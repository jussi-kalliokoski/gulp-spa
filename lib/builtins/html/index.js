"use strict";

var createBuilder = require("../../utils/createBuilder");
var findBuilds = require("./findBuilds");
var insertFile = require("./insertFile");

module.exports = createBuilder(findBuilds, insertFile);
