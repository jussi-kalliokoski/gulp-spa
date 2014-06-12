# gulp-spa

[![Build Status](https://travis-ci.org/jussi-kalliokoski/gulp-spa.svg?branch=master)](https://travis-ci.org/jussi-kalliokoski/gulp-spa)
[![Coverage Status](https://img.shields.io/coveralls/jussi-kalliokoski/gulp-spa.svg)](https://coveralls.io/r/jussi-kalliokoski/gulp-spa)

gulp-spa is a [gulp](http://gulpjs.com/) plugin for making it easier to build single page apps. It lets you define your sources in HTML and the pipelines in gulp so you can easily make different versions, like completely minified and garbled production version, or a development version with the files as they were. It also uses streams for going through the sources, so it's fast!

## Installation

You can install gulp-spa via npm:

```bash
$ npm install --save-dev gulp-spa
```

## Usage

Include the plugin:

```javascript
var spa = require("gulp-spa");
```

This will give you an interface with a method `html` that takes the following options as its first argument:

* `assetsDir` (defaults to `./`) This is where gulp-spa will look for the assets your HTML file refers to.
* `pipelines` (defaults to `{}`) A key-value mapping of pipeline names and functions that return the streams the files in that pipeline should go to. The first argument of the function is a stream of the source files.

### Defining builds

You define your builds in HTML using the following syntax:

```html
<!-- build:PIPELINE_ID_HERE -->
<script src="foo.js"></script>
<script src="bar.js"></script>
<!-- endbuild -->
```

So the assets go within the two comment blocks, and you define the name of the pipeline after the `build:` instruction. Simple, right?

## Examples

If you have the following HTML:

```html
<html>
<head>
    <!-- build:css -->
    <link rel="stylesheet" href="foo.css">
    <link rel="stylesheet" href="bar.css">
    <!-- endbuild -->
</head>
<body>
    <!-- build:js -->
    <script src="foo.js"></script>
    <script src="bar.js"></script>
    <!-- endbuild -->
</body>
</html>
```

and something like this in your gulpfile:

```javascript
gulp.task("build", function () {
    return gulp.src("./path/to/index.html")
        .pipe(spa.html({
            assetsDir: "./path/to/",
            pipelines: {
                main: function (files) {
                    // this gets applied for the HTML file itself
                    return files.pipe(htmlmin());
                },

                js: function (files) {
                    return files
                        .pipe(uglify())
                        .pipe(concat("app.js"))
                        .pipe(rev());
                },

                css: function (files) {
                    return files
                        .pipe(minifyCss())
                        .pipe(concat("app.css")
                        .pipe(rev());
                }
            }
        })))
        .pipe(gulp.dest("./public/"));
});
```

You will end up with your files minified, revved and whatnot, and something like the following HTML:

```html
<html>
<head>
    <link rel="stylesheet" href="app-f71237f1.css">
</head>
<body>
    <script src="app-ead18fa.js"></script>
</body>
</html>
```

Because gulp-spa uses [vinyl-fs](https://github.com/wearefractal/vinyl-fs) (the same module that provides `gulp.src` and `gulp.dest`) itself for finding the files, and streams for processing, it even gives you the flexibility to go crazy like this:

```html
<html>
<head>
    <!-- build:css -->
    <link rel="stylesheet" href="**/*.styl">
    <!-- endbuild -->
</head>
<body>
    <!-- build:js -->
    <script src="**/*.coffee"></script>
    <!-- endbuild -->
</body>
</html>
```

```javascript
gulp.task("build", function () {
    return gulp.src("./path/to/index.html")
        .pipe(spa.html({
            assetsDir: "./path/to/",
            pipelines: {
                js: function (files) {
                    return files
                        .pipe(coffee());
                },

                css: function (files) {
                    return files
                        .pipe(stylus());
                }
            }
        })))
        .pipe(gulp.dest("./public/"));
});
```

And it will work as expected:

```html
<html>
<head>
    <link rel="stylesheet" href="used-to-be-stylus-1.css">
    <link rel="stylesheet" href="used-to-be-stylus-2.css">
</head>
<body>
    <script src="used-to-be-coffee-script-1.js"></script>
    <script src="used-to-be-coffee-script-2.js"></script>
</body>
</html>
```

If you want to define your sources in your gulpfile, for example to use the same list of sources for tests, you can do that as well. This is done by not defining any sources in the build, and defining them in the pipeline stream instead:

```html
<html>
<body>
    <!-- build:js -->
    <!-- endbuild -->
</body>
</html>
```

```js
gulp.task("build", function () {
    return gulp.src("./path/to/index.html")
        .pipe(spa.html({
            pipelines: {
                js: function () {
                    return gulp.src("./path/to/javascripts/*.js")
                        .pipe(concat("app.js"));
                }
            }
        })))
        .pipe(gulp.dest("./public/"));
});
```

If you wanted to have leading slashes in front of your URLs, you can do that by either having one in your source files:

```html
<html>
<body>
    <!-- build:js -->
    <script src="/my-js-file1.js"></script>
    <script src="/my-js-file2.js"></script>
    <!-- endbuild -->
</body>
</html>
```

Or you can also define it by overriding the build options:

```html
<html>
<body>
    <!-- build:js {
        "urlPrefix": "/"
    } -->
    <script src="my-js-file1.js"></script>
    <script src="my-js-file2.js"></script>
    <!-- endbuild -->
</body>
</html>
```

If you wanted to be able to define your own URLs, you can do that by defining them in your build options:

```html
<html>
<body>
    <!-- build:js {
        "urlPrefix": "/your-choosen-path/"
    } -->
    <script src="my-js-file1.js"></script>
    <script src="my-js-file2.js"></script>
    <!-- endbuild -->
</body>
</html>
```
urlPrefix can be whatever valid string you need (paths, urls) and will be prepended to your generated file name.

```html
<script src="/your-choosen-path/generated-file.js"></script>
```


## Inspiration and Philosophy

gulp-spa draws its inspiration from [grunt-usemin](https://github.com/yeoman/grunt-usemin). What I wanted to do is split what usemin does (a lot of things!) and make them into small components that do one thing and do it well. Another part of that project is [gulp-resolver](https://github.com/jussi-kalliokoski/gulp-resolver) that replaces references to original assets by finding the minified / revved files generated by the build.

As mentioned, the philosophy behind the plugin is to do one thing and do it well. Other than that, I'm a big fan of node streams and fast builds, so high performance and building on streams are high up on the design goal list.

## Future

For now, only HTML is supported, with assets that compile to / are JS or CSS, but in the future I hope to fix that. The problem is, I can't think of the perfect API to suit that purpose, so if you have ideas, go ahead and file an issue!

## Contributing

Contributions are most welcome! If you're having problems and don't know why, search the issues to see if someone's had the same issue. If not, file a new issue so we can solve it together and leave the solution visible to others facing the same problem as well. If you find bugs, file an issue, preferably with good reproduction steps. If you want to be totally awesome, you can make a PR to go with your issue, containing a new test case that fails currently!

### Development

Development is pretty straightforward, it's all JS and the standard node stuff works:

To install dependencies:

```bash
$ npm install
```

To run the tests:

```bash
$ npm test
```

Then just make your awesome feature and a PR for it. Don't forget to file an issue first, or start with an empty PR so others can see what you're doing and discuss it so there's a a minimal amount of wasted effort.

Do note that the test coverage is currently a whopping 100%. Let's keep it that way! Remember: if it's not in the requirements specification (i.e. the tests), it's not needed, and thus unnecessary bloat.
