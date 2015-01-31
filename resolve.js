function resolve(o, callback) {
	var type = typeof o,

		bind = function (key, initial, undefined) {
			// start off undefined until resolved
			result[key] = undefined;

			// resolve will return undefined
			resolve(initial, function (value) {
				result[key] = value;

				// go through all properties once before calling callback here
				if (ran) {
					callback(result);
				}
			});
		},

		// used for return value of function, and for copy of object
		result,

		// used to see if function callback ran
		// also used to check if we're done first run of object properties
		ran;

	// statics, we're done
	if (!o || type !== 'function' && type !== 'object') {
		callback(o);

	// functions, resolve the return value, and pass in a callback too
	} else if (type === 'function') {
		result = o(function (value) {
			// remember that the callback was called
			ran = 1;

			// resolve the value
			resolve(value, callback);
		});

		// if the callback wasn't already called synchronously, process the return value
		if (!ran) {
			resolve(result, callback);
		}

	// promises (thenable), resolve via then & catch & progress (maybe)
	} else if (typeof o.then === 'function') {
		o.then(callback, callback, callback);

	} else {
		result = {};

		// other objects, resolve each property
		for (var k in o) {
			bind(k, o[k]);
		}

		ran = 1;

		// definitely call callback after first run through
		callback(o);
	}
}

module.exports = resolve;