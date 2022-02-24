/**
 * Read file line by line, synchronously, and backwards.
 *
 * Example:
 *
 * var readEachLine = require('read-each-line')
 *
 * readEachLine('test.txt', 'utf8', function(line) {
 *   console.log(line)
 * })
 *
 * Encoding can optionally be omitted, in which case it will default to utf8:
 *
 * readEachLine('test.txt', function(line) {
 *   console.log(line)
 * })
 *
 * Github: https://github.com/gkovacs/read-each-line
 * Author: Geza Kovacs http://www.gkovacs.com/
 * Based on readLineSync https://gist.github.com/Basemm/9700229
 * License: MIT
 */


const fs = require('fs'),
    os = require('os');


const EOL = os.EOL;

/**
 * Get a line from buffer & return it + remaining buffer
 *
 * @param {Buffer} buffer
 */
function getLine(buffer) {
    var i, start, end;

    for (i = buffer.length - 1; i > -1; i--) {

        if (buffer[i] === 0x0a || i === 0) { // if either NL or start of file
            start = i + 1; //start of line
            end = EOL.length > 1 ? i - 1 : i; // end of newBuffer, if EOL is CRLF - twice the length - then it goes one more back
            if (i === 0) { // if start of file
                start = 0,
                    end = 0;
            }
            return {
                line: buffer.subarray(start, buffer.length).toString(),
                newBuffer: buffer.subarray(0, end)
            }
        }

    }

    return null;
}

/**
 * Read file line by line synchronous
 *
 * @param {String} path
 * @param {String} encoding - "optional" encoding in same format as nodejs Buffer
 */
module.exports = function readEachLine(path, encoding, processline) {

    if (typeof (encoding) == 'function') { // default to utf8 if encoding not specified
        processline = encoding;
        encoding = 'utf8';
    }

    const buf_alloc = function (buf_size) {
        if (Buffer.alloc) {
            return Buffer.alloc(buf_size, encoding = encoding);
        } else {
            return new Buffer(buf_size, encoding = encoding);
        }
    }

    const chunkSize = 64 * 1024; //64KB

    var fsize,
        fd,
        bufferSize = chunkSize,
        curBuffer = buf_alloc(0),
        readBuffer;

    if (!fs.existsSync(path)) {
        throw new Error("no such file or directory '" + path + "'");
    }

    fsize = fs.statSync(path).size;

    if (fsize < chunkSize) {
        bufferSize = fsize;
    }
    const
        numOfLoops = Math.floor(fsize / bufferSize),
        remainder = fsize % bufferSize;

    fd = fs.openSync(path, 'r');

    for (var i = 0; i < numOfLoops; i++) {
        readBuffer = buf_alloc(bufferSize);

        fs.readSync(fd, readBuffer, 0, bufferSize, bufferSize * i);

        curBuffer = Buffer.concat([curBuffer, readBuffer], curBuffer.length + readBuffer.length);
        var lineObj;
        while (lineObj = getLine(curBuffer)) {
            curBuffer = lineObj.newBuffer;
            processline(lineObj.line);
        }
    }

    if (remainder > 0) {
        readBuffer = buf_alloc(remainder);

        fs.readSync(fd, readBuffer, 0, remainder, bufferSize * i);

        curBuffer = Buffer.concat([curBuffer, readBuffer], curBuffer.length + readBuffer.length);
        var lineObj;
        while (lineObj = getLine(curBuffer)) {
            curBuffer = lineObj.newBuffer;
            processline(lineObj.line);
        }
    }

    //return last remainings in the buffer in case
    //it didn't have any more lines
    if (curBuffer.length) {
        processline(curBuffer.toString());
    }

    fs.closeSync(fd);
}
