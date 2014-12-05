'use strict';

function cartesianProductOf() {
    return [].reduce.call(arguments, function (a, b) {
        var ret = [];
        a.forEach(function (a) {
            b.forEach(function (b) {
                ret.push(a.concat([b]));
            });
        });
        return ret;
    }, [
        []
    ]);
}

exports.cartesianProductOf = cartesianProductOf;