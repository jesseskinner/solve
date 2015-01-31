var expect = require('chai').expect;
var solve = require('../src/index');
var Promise = require('es6-promise').Promise;

describe('solve', function () {
	it('should return whatever was passed in', function () {
		var data = {};
		var returned = solve(data);

		data.val = true;

		expect(returned.val).to.be.true;
	});

	it('should solve booleans immediately', function () {
		solve(true, function (val) {
			expect(val).to.be.true;
		});

		solve(false, function (val) {
			expect(val).to.be.false;
		});
	});

	it('should solve strings immediately', function () {
		solve('hello', function (val) {
			expect(val).to.equal('hello');
		});
	});

	it('should solve nulls immediately', function () {
		solve(null, function (val) {
			expect(val).to.be.null;
		});
	});

	it('should solve undefined immediately', function () {
		solve(undefined, function (val) {
			expect(val).to.be.undefined;
		});
	});

	it('should solve numbers immediately', function () {
		solve(1, function (val) {
			expect(val).to.equal(1);
		});

		solve(1.4, function (val) {
			expect(val).to.equal(1.4);
		});

		solve(-1/0, function (val) {
			expect(val).to.equal(-Infinity);
		});

		solve(1/0, function (val) {
			expect(val).to.equal(Infinity);
		});

		solve(0/0, function (val) {
			expect(val).to.be.NaN;
		});
	});

	it('should solve functions recursively', function () {
		function fn() {
			return function(){
				return function(){
					return 123;
				};
			};
		}

		solve(fn, function (val) {
			expect(val).to.equal(123);
		});
	});

	it('should solve functions via a callback parameter', function (done) {
		function fn(callback) {
			setTimeout(function(){
				callback('bar');
			}, 1);

			return 'foo';
		};

		var call = 0;

		solve(fn, function (val) {
			call++;
			
			if (call === 1) {
				// first time
				expect(val).to.equal('foo');
			}

			if (call === 2) {
				// second time
				expect(val).to.equal('bar');
				done();
			}
		});
	});

	it('should solve promises that succeed', function (done) {
		var promise = new Promise(function (resolve) {
			resolve('hello');
		});

		solve(promise, function (val) {
			if (val) {
				expect(val).to.equal('hello');
				done();
			}
		});
	});

	it('should solve synchronous promises (non-spec)', function () {
		var nonSpecPromise = {
			then: function (callback) {
				// Promises should always resolve asynchronously (eg. nextTick)
				// but let's create a bad implementation where that is not true
				callback('done');
			}
		};

		solve(nonSpecPromise, function (val) {
			expect(val).to.equal('done');
		});
	});

	it('should not solve promises that fail', function (done) {
		var promise = new Promise(function () {
			throw new Error('boo');
		});

		solve(promise, function (val) {
			expect(val).to.be.undefined;
			done();
		});
	});

	it('should recursively process promise results', function (done) {
		var promise = new Promise(function (resolve) {
			resolve(function (callback) {
				callback('recursive');
			});
		});

		solve(promise, function (val) {
			if (val) {
				expect(val).to.equal('recursive');
				done();
			}
		});
	});

	it('should solve each element of an array', function (done) {
		var arr = [
				'foo',
				'bar',
				function (cb) {
					cb(123);
				},
				new Promise(function (resolve) {
					resolve(456)
				})
			],
			tick = 0;

		solve(arr, function (val) {
			// on second tick
			if (tick++ >= 1) {
				setTimeout(function () {
					expect(val).to.eql(['foo','bar',123,456]);
					done();
				}, 1);
			}
		});
	});

	it('should not solve inherited properties, eg. on Object.prototype', function () {
		Object.prototype.dumb = function () {
			return 'ick';
		};

		solve({}, function (val) {
			expect(val).to.be.empty;
		});
	});

	it('should not get messed up by custom hasOwnProperty method', function () {
		var data = {
			hasOwnProperty: function(){},
			foo: function () {
				return 'bar';
			}
		};

		solve(data, function (val) {
			expect(val.foo).to.equal('bar');
		});
	});

	it('should do all the above recursively', function (done) {
		var data = {
			bool: true,
			num: 123,
			promise: new Promise(function (resolve) {
				resolve('success');
			}),
			fn: function () {
				return 'static';
			},
			callback: function(cb) {
				cb(function (cb2) {
					return function (cb3) {
						return cb3('dynamic');
					};
				});
			},
			nested: {
				complex: function (cb) {
					cb({
						inner: function () {
							return new Promise(function (resolve) {
								resolve('yay');
							});
						}
					});
				}
			}
		};

		solve(data, function (all) {
			// wait for everything to finish
			if (all && all.promise && all.nested && all.nested.complex && all.nested.complex.inner) {
				expect(all.bool).to.be.true;
				expect(all.num).to.equal(123);

				expect(all.promise).to.equal('success');
				expect(all.fn).to.equal('static');
				expect(all.callback).to.equal('dynamic');

				expect(all.nested.complex.inner).to.equal('yay');

				done();
			}
		});
	});
});