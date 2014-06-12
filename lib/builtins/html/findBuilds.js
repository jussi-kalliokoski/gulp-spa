"use strict";

var _ = require("lodash");
var PluginError = require("gulp-util").PluginError;

var BLOCK_START_REGEX = /<!--\s*build:(\w+)(?:\s+(\{[^]*\}))?\s*-->/;
var BLOCK_END_REGEX = /<!--\s*endbuild\s*-->/gm;
var JS_TAG_REGEX = /<\s*script\s+.*?src\s*=\s*"([^"]+?)".*?><\s*\/\s*script\s*>/gi;
var CSS_TAG_REGEX = /<\s*link\s+.*?href\s*=\s*"([^"]+)".*?>/gi;
var TAG_SEPARATOR_REGEX = /^\s*/;

module.exports = function (contents) {
    var processed = {
        chunks: []
    };

    var sections = contents.split(BLOCK_END_REGEX);
    var lastSection = sections.pop();

    processed.builds = sections.map(function (section) {
        var hasBlockStart = BLOCK_START_REGEX.test(section);
        if ( !hasBlockStart ) {
            throw new PluginError("gulp-spa", "Found an endbuild block without build block");
        }

        var splitSection = section.split(BLOCK_START_REGEX);
        var sectionContent = splitSection[0];
        var buildId = splitSection[1];
        var buildOverridesDefinition = splitSection[2];
        var buildContents = splitSection[3];

        processed.chunks.push(sectionContent);

        var files = [];

        var addUrlToFiles = function (tag, url) {
            files.push(url);
        };

        var tagSeparator = TAG_SEPARATOR_REGEX.exec(buildContents)[0];

        buildContents
            .replace(JS_TAG_REGEX, addUrlToFiles)
            .replace(CSS_TAG_REGEX, addUrlToFiles);

        var buildOverrides = {};

        if ( buildOverridesDefinition ) {
            buildOverrides = JSON.parse(buildOverridesDefinition);
        }

        return _.extend({
            id: buildId,
            files: files,
            itemSeparator: tagSeparator
        }, buildOverrides);
    });

    processed.chunks.push(lastSection);

    return processed;
};
