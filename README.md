# read-each-line but backwards

Modified version of read-each-line to accodimate backwards reading.

Reads file line by line, synchronously, from last line to first - backwards.

## Example

```javascript
var readEachLine = require('read-each-line') //this depens on file name

readEachLine('test.txt', 'utf8', function(line) {
  console.log(line)
})
```

Encoding can optionally be omitted, in which case it will default to utf8:

```javascript
readEachLine('test.txt', function(line) {
  console.log(line)
})
```

## Credits

Original Author: [Geza Kovacs](http://github.com/gkovacs)
