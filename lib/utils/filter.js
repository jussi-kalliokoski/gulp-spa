"use strict";

var through = require("through2");

module.exports = function (filterExpression) {
    return through.obj(function (file, encoding, callback) {
        if ( filterExpression(file, encoding) ) {
            this.push(file);
        }

        callback();
    });
};
