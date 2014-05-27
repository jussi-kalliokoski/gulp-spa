"use strict";

var gulp = require("gulp");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var gutil = require("gulp-util");
var File = require("vinyl");
var through = require("through2");

var spa = require("../index.js");

describe("spa", function () {
    var basicCase = function (name, pipelines) {
        return function () {
            var expected = gulp.src("./test/expected/" + name + "/**/*");
            var actual = gulp.src("./test/fixtures/" + name + "/*.html")
                .pipe(spa.html({
                    assetsDir: "./test/fixtures/" + name,
                    pipelines: pipelines
                }));
            return actual.should.produce.sameFilesAs(expected);
        };
    };

    var createKeyValue = function (key, value) {
        var obj = {};
        obj[key] = value;
        return obj;
    };

    describe(".html()", function () {
        var tagTypes = [{
            type: "css",
            tagName: "link"
        }, {

            type: "js",
            tagName: "script"
        }];

        describe("with one output file", function () {
            tagTypes.forEach(function (tagType) {
                var type = tagType.type;
                var tagName = tagType.tagName;
                var createConcat = function () {
                    return function () {
                        return concat("joined." + type);
                    };
                };

                it("should produce only one " + tagName + " tag",
                    basicCase("html-one-" + tagName + "-tag", createKeyValue(type, createConcat())));
                it("should preserve leading slash in paths for " + tagName + " tag",
                    basicCase("html-preserve-leading-slash-one-" + tagName + "-tag", createKeyValue(type, createConcat())));
                it("should not add leading slash to " + tagName + " tags' paths that didn't have it",
                    basicCase("html-dont-add-leading-slash-one-" + tagName + "-tag", createKeyValue(type, createConcat())));
            });
        });

        describe("with multiple output files", function () {
            tagTypes.forEach(function (tagType) {
                var type = tagType.type;
                var tagName = tagType.tagName;

                it("should produce multiple " + tagName + " tags using original whitespace convention",
                    basicCase("html-many-" + tagName + "-tag", {}));
                it("should preserve leading slash in paths for " + tagName + " tags",
                    basicCase("html-preserve-leading-slash-many-" + tagName + "-tag", {}));
                it("should not add leading slash to " + tagName + " tags' paths that didn't have it",
                    basicCase("html-dont-add-leading-slash-many-" + tagName + "-tag", {}));
            });
        });

        it("should use the pipeline titled `main` for the main file", basicCase("html-use-pipeline-named-main", {
            main: function () {
                return rename("foo.html");
            }
        }));

        it("should work with multiple html files", basicCase("html-multiple-builds", {
            js: function () {
                return concat("joined.js");
            },
            css: function () {
                return concat("joined.css");
            }
        }));

        it("should not insert files that aren't CSS or JS", basicCase("html-dont-insert-unknown", {}));

        it("should work with html files without any builds", basicCase("html-no-builds", {}));

        it("should throw an error if streaming is attempted", function () {
            var stream = spa.html();
            void function () {
                stream.write(new File({
                    path: "/foo.html",
                    contents: through.obj()
                }));
            }.should.throw("Streaming not supported");
        });

        it("should throw an error if the file has an `endbuild` instruction without `build` instruction", function () {
            var stream = spa.html();
            void function () {
                stream.write(new File({
                    path: "/foo.html",
                    contents: new Buffer("<html><!-- endbuild --></html>")
                }));
            }.should.throw("Found an endbuild block without build block");
        });

        it("should ignore null files", function () {
            var stream = spa.html();

            stream.write(new File({
                path: "/meow.html",
                contents: null
            }));

            var expected = gulp.src("./test/expected/html-ignore-null-files/*");
            var actual = gulp.src("./test/fixtures/html-ignore-null-files/*").pipe(stream);
            return actual.should.produce.sameFilesAs(expected);
        });

        it("should let the source be defined in the gulpfile if build has no sources", function () {
            var expected = gulp.src("./test/expected/html-source-defined-in-gulpfile/*");
            var actual = gulp.src("./test/fixtures/html-source-defined-in-gulpfile/*.html")
                .pipe(spa.html({
                    assetsDir: "./test/fixtures/html-source-defined-in-gulpfile/",
                    pipelines: {
                        js: function () {
                            return gulp.src(["file1.js", "file2.js"], { cwd: "./test/fixtures/html-source-defined-in-gulpfile/" })
                                .pipe(concat("joined.js"));
                        }
                    }
                }));
            actual.should.produce.sameFilesAs(expected);
        });
    });

    it("should allow multiple builds through the same pipeline", basicCase("html-multiple-builds-with-same-pipeline", {
        js: function () {
            return rename(function (file) {
                // do nothing, dummy pipeline
            });
        }
    }));

    var id;

    before(function () {
        id = 0;
    });

    it("should allow multiple builds in different files through the same pipeline",
        basicCase("html-multiple-builds-in-different-files-with-same-pipeline", {
            js: function () {
                id += 1;
                return concat("joined" + id + ".js");
            }
    }));
});
