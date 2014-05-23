"use strict";

var filter = require("./filter");

module.exports = function () {
    var count = 0;

    return filter(function (file) {
        return count++ === 0;
    });
};
