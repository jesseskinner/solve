# solve

Recursively converts asynchronous data into static data.

## Usage

```javascript
var solve = require('solve');

staticData = solve(asyncData, function (staticData) {
	
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
