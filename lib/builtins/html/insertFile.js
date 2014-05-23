"use strict";

var path = require("path");

module.exports = function (url) {
    var extension = path.extname(url).toLowerCase();
    switch ( extension ) {
        case ".js":
            return "<script src=\"" + url + "\"></script>";
        case ".css":
            return "<link rel=\"stylesheet\" href=\"" + url + "\" />";
    }

    return "";
};
