module.exports = (function(){
'use strict';

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
function solve(o, callback) {
	// callback is theoretically optional
	// we could check for it everywhere, but this is easier
	callback = callback || function () {};

	// bind makes sure results are mapped back to the array or object member
	var bind = function (key) {
			var initial = o[key];

			// don't bother changing static values
			if (!isStatic(initial)) {
				solve(initial, function (value) {
					// got a value, put it in place
					o[key] = value;

					// go through all properties once before calling callback here
					if (ran) {
						callback(o);
					}
				});
			}
		},

		// handler for functions and promises
		done = function (value) {
			// remember that this callback was called
			ran = 1;

			// solve the value
			solve(value, callback);
		},

		// used for return value of function
		result,

		// iterator
		k,

		// used to see if function callback ran
		// also used to check if we're done first run of object properties
		ran;

	// statics, we're done
	if (isStatic(o)) {
		callback(o);

	// functions, solve the return value, and pass in a callback too
	} else if (isFunction(o)) {
		result = o(done);

		// if the callback wasn't already called synchronously, process the return value
		// note: if result is undefined, then that's what we'll start off with
		if (!ran) {
			solve(result, callback);
		}

	// promises (thenable), resolve via then
	} else if (isFunction(o.then)) {
		o.then(done);

		// promises start off undefined, unless somehow the promise was already resolved
		if (!ran) {
			callback();
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
				bind(k);
			}
		}

		// we've ran through it once, now bindings can call callback
		ran = 1;

		// definitely call callback after first run through
		callback(o);
	}

	// always return whatever was passed in
	return o;
}

// expose the solve function
return solve;

// execute this scope immediately
})();