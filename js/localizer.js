var DateTime = luxon.DateTime; // Alias luxon's DateTime object.

function getLang() {
  if (navigator.languages != undefined) {
    return navigator.languages[0];
  }
  if(navigator.language != undefined) {
    return navigator.language;
  }
}

function parseTime(timeString) {
  if (timeString == '') return null;

  var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);
  if (time == null) return null;

  var hours = parseInt(time[1],10);
  if (hours == 12 && !time[4]) {
      hours = 0;
  }
  else {
    hours += (hours < 12 && time[4])? 12 : 0;
  }
  var d = new Date();
  d.setHours(hours);
  d.setMinutes(parseInt(time[3],10) || 0);
  d.setSeconds(0, 0);
  return d;
}

Date.prototype.stdTimezoneOffset = function () {
  var jan = new Date(this.getFullYear(), 0, 1);
  var jul = new Date(this.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

function localize() {
  // Get Days
  const days = document.querySelectorAll(".schedule-outer");

  // Iterate over the days to calculate times and offsets
  days.forEach(function (day, i) {
    // Get the month and date of the day
    const dayName = day.querySelector('.schedule-banner > h4')
      .innerText.match(/((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d+)/)[0];

    // Get event times
    const items = day.querySelectorAll(".schedule-grid > p");

    // Iterate over times to process them
    items.forEach(function (e) {
      // Don't re-calculate updated times
      if (e.getAttribute("data-time-updated") != null) return;

      // Parse date in America/New_York
      const eventDate = DateTime.fromFormat(
        `${dayName}, 2021 ${e.innerText} America/New_York`,
        "LLL dd, yyyy h:mm a z"
      );

      // Set time in Locale TIME_SIMPLE format
      // This means that regions like the United States will get an AM/PM format
      // But countries like France will get it in 24-hour time.
      e.innerText = eventDate.toLocaleString(DateTime.TIME_SIMPLE);

      // Set ET version of eventDate for daysOffset calculation
      const etEventDate = eventDate.setZone("America/New_York");

      // Calculate dayOffset
      const dayOffset = eventDate.day - etEventDate.day;

      // If dayOffset is not 0, we need to move the event to another day
      // If the dayOffset is negative on the first day we need to handle
      // or the dayOffset is positive on the last day
      // this edge case by using a supertext to indicate the day offset
      if (i === 0 && dayOffset < 0) {
        e.innerHTML += "<sup>-1</sup>";
      } else if (i === days.length - 1 && dayOffset > 0) {
        e.innerHTML += "<sup>+1</sup>";
      } else if (!!dayOffset) {
        const listItem = e.parentElement;
        const newList = days[i + dayOffset].querySelector(".w-dyn-items");
        if (dayOffset < 0) {
          newList.append(listItem);
        } else {
          newList.prepend(listItem);
        }
      }

      // Store ISO time to make sorting trivial
      e.setAttribute("data-iso-time", eventDate.toISO());

      // Mark the time as re-calculated
      e.setAttribute("data-time-updated", 1);
    })
  });

  // Iterate over the days so we can sort them
  days.forEach(function (day) {
    // Get the event items
    const list = day.querySelector(".w-dyn-items");

    // If no events, remove the day
    if (!list) {
      day.remove();
      return;
    }

    // get child contents of the events
    const children = Array.prototype.slice.call(list.children)

    // Sort the events
    children
      .sort(function (x, y) {
        try {
          // Generate DateTime objects using the ISO date on the attribute
          var tx = DateTime.fromISO(
            x
              .querySelector(".schedule-grid > p")
              .getAttribute("data-iso-time")
          );
          var ty = DateTime.fromISO(
            y
              .querySelector(".schedule-grid > p")
              .getAttribute("data-iso-time")
          );

          // COmpare the dates
          if (tx < ty) {
            return -1;
          }

          if (ty > tx) {
            return 1;
          }

          return 0;
        } catch {
          return 0;
        }
      })
      // Re-add the items
      .forEach(function (x) {
        list.appendChild(x);
      });
  });

  document.getElementsByClassName("timezone-identifier")[0].textContent =
  "All times displayed in " +
  (DateTime.now().toFormat("ZZZZZ ('UTC'ZZ)") || "local timezone") +
  ".";
}

if (document.location.pathname === '/schedule') {
  localize();
}
