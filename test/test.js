var expect = require('chai').expect;
var resolve = require('../resolve');
var Promise = require('es6-promise').Promise;

describe('resolve', function () {
	it('should resolve booleans immediately', function () {
		resolve(true, function (val) {
			expect(val).to.be.true;
		});

		resolve(false, function (val) {
			expect(val).to.be.false;
		});
	});

	it('should resolve strings immediately', function () {
		resolve('hello', function (val) {
			expect(val).to.equal('hello');
		});
	});

	it('should resolve nulls immediately', function () {
		resolve(null, function (val) {
			expect(val).to.be.null;
		});
	});

	it('should resolve undefined immediately', function () {
		resolve(undefined, function (val) {
			expect(val).to.be.undefined;
		});
	});

	it('should resolve numbers immediately', function () {
		resolve(1, function (val) {
			expect(val).to.equal(1);
		});

		resolve(1.4, function (val) {
			expect(val).to.equal(1.4);
		});

		resolve(-1/0, function (val) {
			expect(val).to.equal(-Infinity);
		});

		resolve(1/0, function (val) {
			expect(val).to.equal(Infinity);
		});

		resolve(0/0, function (val) {
			expect(val).to.be.NaN;
		});
	});

	it('should resolve functions recursively', function () {
		function fn() {
			return function(){
				return function(){
					return 123;
				};
			};
		}

		resolve(fn, function (val) {
			expect(val).to.equal(123);
		});
	});

	it('should resolve functions via a callback parameter', function (done) {
		function fn(callback) {
			setTimeout(function(){
				callback('bar');
			}, 1);

			return 'foo';
		};

		var call = 0;

		resolve(fn, function (val) {
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

	it('should resolve promises that succeed', function (done) {
		var promise = new Promise(function (resolve) {
			resolve('hello');
		});

		resolve(promise, function (val) {
			expect(val).to.equal('hello');
			done();
		});
	});

	it('should resolve promises that fail', function (done) {
		var promise = new Promise(function () {
			throw new Error('boo');
		});

		resolve(promise, function (val) {
			expect(val).to.be.an.error;
			expect(val.message).to.equal('boo');
			done();
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

		resolve(data, function (all) {
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