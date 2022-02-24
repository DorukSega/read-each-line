const readEachLine = require('../read-each-line');

readEachLine('./test/testfile', 'utf8', function (line) {
    console.log(line)
})
