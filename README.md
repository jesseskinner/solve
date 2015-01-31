# solve

Recursively converts asynchronous data into static data.

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Bower version][bower-image]][bower-url]

[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

## Usage

```javascript
var solve = require('solve');

data = solve(data, function (data) {
	// called immediately, and whenever promises resolve or callbacks are called
});
```

## Example

```javascript

var solve = require('solve');

var data = {
	foo: function(callback) {
		setTimeout(function () {
			callback('dynamic');
		}, 1);

		return 'static'
	},
	promise: new Promise(function(resolve){
		resolve('done');
	}),
	nested: function () {
		return function () {
			return function () {
				return 'deep';
			}
		}
	}
};

solve(data, function(data) {
	console.log(data);
});

```

This will output:

```javascript
{ foo: 'static', promise: undefined, nested: 'deep' }
{ foo: 'static', promise: 'done', nested: 'deep' }
{ foo: 'dynamic', promise: 'done', nested: 'deep' }
```

## Documentation

Read [the tests](https://github.com/jesseskinner/solve/blob/master/test/test.js) for more details on what solve can do.

## License

MIT


[coveralls-image]: https://coveralls.io/repos/jesseskinner/solve/badge.png
[coveralls-url]: https://coveralls.io/r/jesseskinner/solve

[npm-url]: https://npmjs.org/package/solve
[downloads-image]: http://img.shields.io/npm/dm/solve.svg
[npm-image]: http://img.shields.io/npm/v/solve.svg
[travis-url]: https://travis-ci.org/jesseskinner/solve
[travis-image]: http://img.shields.io/travis/jesseskinner/solve.svg
[david-dm-url]:https://david-dm.org/jesseskinner/solve
[david-dm-image]:https://david-dm.org/jesseskinner/solve.svg
[david-dm-dev-url]:https://david-dm.org/jesseskinner/solve#info=devDependencies
[david-dm-dev-image]:https://david-dm.org/jesseskinner/solve/dev-status.svg
[bower-url]:http://badge.fury.io/bo/solve
[bower-image]: https://badge.fury.io/bo/solve.svg
