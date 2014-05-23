"use strict";

module.exports = function (stream, otherStream) {
    if ( otherStream == null ) {
        return stream;
    }

    return stream.pipe(otherStream);
};
