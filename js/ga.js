//GA Event Tracker Script. Licensed under MIT. Free for any use by all. Written by Paul Seal from codeshare.co.uk

// Get the category, action and label from the element and send it to GA. The action is optional, because mostly it will be a click event.
var trackEvent = (action='click', el=null) => function () {
  var eventCategory = el ? el.getAttribute("data-event-category") : this.getAttribute("data-event-category");
  var eventAction = el ? el.getAttribute("data-event-action") : this.getAttribute("data-event-action");
  var eventLabel = el ? el.getAttribute("data-event-label") : this.getAttribute("data-event-label");
  var eventValue = el ? el.getAttribute("data-event-value") : this.getAttribute("data-event-value");
  ga('send', 'event', eventCategory, (eventAction != undefined && eventAction != '' ? eventAction : 'click'), eventLabel, eventValue);
  console.debug("ga", "send", "event", eventCategory, (eventAction != undefined && eventAction != '' ? eventAction : action), eventLabel, eventValue);
};

// Find all of the elements on the page which have the class 'ga-event'
var elementsToTrack = document.getElementsByClassName("ga-event");

// Add an event listener to each of the elements you found
var elementsToTrackLength = elementsToTrack.length;
for (var i = 0; i < elementsToTrackLength; i++) {
  elementsToTrack[i].addEventListener('click', trackEvent('click'), false);
  elementsToTrack[i].addEventListener('mouseover', trackEvent('hover'), false);
  elementsToTrack[i].addEventListener('auxclick', trackEvent('click', false));
  console.debug("Tracking", elementsToTrack[i]);
}


// IsElementIn View Script. Licensed under CC-BY-SA 3.0. https://stackoverflow.com/a/488073
function Utils() {

}

Utils.prototype = {
    constructor: Utils,
    isElementInView: function (element, fullyInView) {
        var pageTop = $(window).scrollTop();
        var pageBottom = pageTop + $(window).height();
        var elementTop = $(element).offset().top;
        var elementBottom = elementTop + $(element).height();

        if (fullyInView === true) {
            return ((pageTop < elementTop) && (pageBottom > elementBottom));
        } else {
            return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
        }
    }
};

var Utils = new Utils();

// Find all elements with the 'ga-scroll-event' class
var scrollElementsToTrack = document.getElementsByClassName("ga-scroll-event");

document.addEventListener('scroll', () => {
  for (const element of scrollElementsToTrack) {
    let isElementInView = Utils.isElementInView(element, false);
    if (isElementInView) {
      trackEvent('scroll', element)();
    }
  }
});


