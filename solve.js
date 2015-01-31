module.exports = (function(){
'use strict';

var ArrayClass = [].constructor;

function isArray(o) {
	return o instanceof ArrayClass;
}

function isStatic(o) {
	return !o || !isFunction(o) && !isObject(o);
}

function isFunction(o) {
	return typeof o === 'function';
}

function isObject(o) {
	return typeof o === 'object';
}

function noop() {}

function solve(o, callback) {
	callback = callback || noop;

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

	// promises (thenable), resolve via then & catch & progress (maybe)
	} else if (isFunction(o.then)) {
		o.then(done);

		// promises start off undefined, unless somehow the promise was already resolved
		if (!ran) {
			callback();
		}

	} else {
		if (isArray(o)) {
			// iterate over arrays
			for (k=0;k < o.length;k++) {
				bind(k);
			}
		} else {
			// other objects, solve each property
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

return solve;

})();