"use strict";

var PluginError = require("gulp-util").PluginError;
var gulp = require("gulp");
var es = require("event-stream");
var through = require("through2");
var _ = require("lodash");

var assignPrefix = require("./assignPrefix");
var createArray = require("./createArray");
var mergeChunks = require("./mergeChunks");

var defaults = {
    assetsDir: "./",
    pipelines: {}
};

module.exports = function (findBuilds, insertFile) {
    return function (options) {
        options = _.extend({}, defaults, options);

        var pushStreamToPipeline = function (stream, name) {
            if ( options.pipelines[name] ) {
                return stream.pipe(options.pipelines[name]());
            }

            return stream;
        };

        var process = function (file, encoding, callback) {
            var self = this;

            if ( file.isNull() ) {
                callback();
                return;
            }

            if ( file.isStream() ) {
                throw new PluginError("gulp-spa", "Streaming not supported");
            }

            var processed = findBuilds(String(file.contents));
            processed.builds.forEach(assignPrefix);

            var mainPipeline = through.obj();

            var finishMain = function () {
                var contents = mergeChunks({
                    chunks: processed.chunks,
                    files: files,
                    insertFile: insertFile,
                    itemSeparators: _.pluck(processed.builds, "itemSeparator"),
                    urlPrefixes: _.pluck(processed.builds, "urlPrefix")
                });

                file.contents = new Buffer(contents);
                mainPipeline.push(file);
            };

            if ( _.isEmpty(processed.builds) ) {
                finishMain();
            } else {
                var streams = processed.builds.map(function (build) {
                    var stream = gulp.src(build.files, { cwd: options.assetsDir, base: options.assetsDir });
                    return pushStreamToPipeline(stream, build.id);
                });

                var files = streams.map(createArray);

                streams.forEach(function (stream, index) {
                    var fileList = files[index];
                    stream.on("data", fileList.push.bind(fileList));
                    stream.on("data", self.push.bind(self));
                });

                var all = es.merge.apply(es, streams);

                all.on("end", finishMain);
            }

            pushStreamToPipeline(mainPipeline, "main").on("data", function (file) {
                self.push(file);
                callback();
            });
        };

        return through.obj(process);
    };
};
