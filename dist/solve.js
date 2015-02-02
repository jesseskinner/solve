var solve = (function(){
'use strict';

var hasOwnProperty = ({}).hasOwnProperty;
var slice = Array.prototype.slice;

// is this a static value that is already solved?
function isStatic(o) {
	// anything falsey is static (especially null)
	// otherwise, consider it static if it's not a function or an object
	return !o || !isFunction(o) && !isObject(o);
}

// is this a function?
function isFunction(o) {
	return typeof o === 'function';
}

// is this an array?
function isArray(o) {
	return o.constructor === Array;
}

// is this an object?
function isObject(o) {
	return typeof o === 'object';
}

// main solve function
function solve(o) {
	// add all the arguments after the first one as chained listeners
	var chained = slice.call(arguments, 1),

		// bind makes sure results are mapped back to the array or object member
		bind = function (key) {
			var initial = o[key];

			// don't bother changing static values
			if (!isStatic(initial)) {
				solve(initial, function (value) {
					// got a value, put it in place
					o[key] = value;

					// go through all properties once before calling update here
					if (ran) {
						update(o);
					}
				});
			}
		},

		// handler for functions and promises
		done = function (value) {
			// remember that this update was called
			ran = 1;

			// solve the value
			solve(value, update);
		},

		// called when result changes, to pass to all the listeners
		update = function (value) {
			var i;

			// these pass the new values along to the next one
			for (i=0; i < chained.length; i++) {
				value = chained[i](value);
			}

			// if external listeners, call those with the value too
			if (listeners) {
				for (i=0; i < listeners.length; i++) {
					// these are independent, ignore the return value
					listeners[i](value);
				}
			}

			// keep track of the result, for listeners added later
			lastResult = value;
		},

		// used to create new streams
		stream = function () {
			// any callbacks passed to this method will be chained together
			var chained = slice.call(arguments, 0);

			// return a new solve stream each time, to allow chaining of streams
			return solve(function (callback) {
				function run(data) {
					for (var i=0; i < chained.length; i++) {
						// chain the return values through each function
						data = chained[i](data);
					}

					// pass the final value on to any downstream listeners
					callback(data);
				}

				// lazily create listeners array
				if (!listeners) {
					listeners = [];
				}

				// add a listener to this solution for future changes
				listeners.push(run);

				// pass through the current transformation now
				run(lastResult);
			});
		},

		listeners,

		// used to keep track of result for when new listeners added
		lastResult,

		// used for return value of function
		result,

		// iterator
		k,

		// used to see if function update ran
		// also used to check if we're done first run of object properties
		ran;

	// statics, we're done
	if (isStatic(o)) {
		update(o);

	// functions, solve the return value, and pass in a update too
	} else if (isFunction(o)) {
		result = o(done);

		// if the update wasn't already called synchronously, process the return value
		// note: if result is undefined, then that's what we'll start off with
		if (!ran) {
			solve(result, update);
		}

	// promises (thenable), resolve via then
	} else if (isFunction(o.then)) {
		o.then(done);

		// promises start off undefined, unless somehow the promise was already resolved
		if (!ran) {
			update();
		}

	// otherwise either an array or an object
	} else {
		// check for array explicitly
		if (isArray(o)) {
			// iterate over arrays, solve each index
			for (k=0;k < o.length;k++) {
				bind(k);
			}

		// everything else (objects)
		} else {
			// solve each of the objects own properties
			for (k in o) {
				if (hasOwnProperty.call(o, k)) {
					bind(k);
				}
			}
		}

		// we've ran through it once, now bindings can call update
		ran = 1;

		// definitely call update after first run through
		update(o);
	}

	// return a function that allows adding additional listeners
	return stream;
}

// expose the solve function
return solve;

// execute this scope immediately
})();
