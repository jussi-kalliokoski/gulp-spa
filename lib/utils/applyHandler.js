"use strict";

module.exports = function (stream, handler) {
    if ( handler == null ) {
        return stream;
    }

    return handler(stream);
};
