"use strict";

var _ = require("lodash");

module.exports = function (build) {
    build.urlPrefix = "";

    build.files = build.files.map(function (file) {
        var firstCharacter = _.first(file);
        if ( firstCharacter === "/" ) {
            build.urlPrefix = "/";
            return file.substr(1);
        }

        return file;
    });
};
