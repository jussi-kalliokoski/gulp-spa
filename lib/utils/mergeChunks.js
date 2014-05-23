"use strict";

module.exports = function (options) {
    var lastChunk = options.chunks.pop();
    return options.chunks.map(function (chunk, index) {
        var separator = options.itemSeparators[index];
        var urlPrefix = options.urlPrefixes[index];
        return chunk + options.files[index].map(function (file) {
            return options.insertFile.call(null, urlPrefix + file.relative);
        }).filter(function (item) {
            return Boolean(item);
        }).join(separator);
    }).join("") + lastChunk;
};
