'use strict';

var http = require('http'),
    async = require('async'),
    utils = require('./utils');

function buildUrl(region, param, date) {
    return [
        'http://airquality.moepp.gov.mk/graphs/site/pages/MakeGraph.php?graph=StationLineGraph',
        '&station=', region,
        '&parameter=', param,
        '&endDate=', date,
        '&timeMode=Day'
    ].join('');
}

function getApiCall(url) {
    return function (callback) {
        http
            .get(url, function (res) {
                var str = '';
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    str += chunk;
                });

                res.on('end', function () {
                    callback(null, JSON.parse(str));
                });
            })
            .on('error', function (err) {
                callback(err, null);
            });
    };
}

function getMeasurements(request, callback) {
    var apiCalls = [],
        queryParams = utils.cartesianProductOf(request.regions, request.params);

    queryParams.forEach(function (queryParam) {
        var url = buildUrl(queryParam[0], queryParam[1], request.date.format('YYYY-MM-DD'));

        apiCalls.push(getApiCall(url));
    });

    async.parallel(apiCalls, callback);
}

exports.getMeasurements = getMeasurements;