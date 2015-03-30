var _ = require('underscore');
/* Extend the Underscore object with the following methods */

// Rate limit ensures a function is never called more than every [rate]ms
// Unlike underscore's _.throttle function, function calls are queued so that
//   requests are never lost and simply deferred until some other time
//
// Parameters
// * func - function to rate limit
// * rate - minimum time to wait between function calls
// * async - if async is true, we won't wait (rate) for the function to complete before queueing the next request
//
// Example
// function showStatus(i) {
//   console.log(i);
// }
// var showStatusRateLimited = _.rateLimit(showStatus, 200);
// for (var i = 0; i < 10; i++) {
//   showStatusRateLimited(i);
// }
//
// Dependencies
// * underscore.js
//
_.rateLimit = function(func, rate, async) {
  var queue = [];
  var timeOutRef = false;
  var currentlyEmptyingQueue = false;
  
  var emptyQueue = function() {
    if (queue.length) {
      currentlyEmptyingQueue = true;
      _.delay(function() {
        if (async) {
          _.defer(function() { queue.shift().call(); });
        } else {
          queue.shift().call();
        }
        emptyQueue();
      }, rate);
    } else {
      currentlyEmptyingQueue = false;
    }
  };
  
  return function() {
    var args = _.map(arguments, function(e) { return e; }); // get arguments into an array
    queue.push( _.bind.apply(this, [func, this].concat(args)) ); // call apply so that we can pass in arguments as parameters as opposed to an array
    if (!currentlyEmptyingQueue) { emptyQueue(); }
  };
};