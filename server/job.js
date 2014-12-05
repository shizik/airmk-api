'use strict';

//var cron = require('cron').CronJob;
var regions = ['SkopjeRegion', 'WesternRegion', 'EasternRegion'],
    params = ['PM10', 'PM25', 'CO', 'NO2', 'O3', 'SO2'],

    moment = require('moment'),
    _ = require('underscore'),
    async = require('async'),

    api = require('./api.js'),
    db = require('./db.js');

async.series([db.getStations, db.getLatestDate],
    function (err, results) {
        if (err) {
            console.log(err);
            return;
        }

        var stations = results[0],
            date = results[1].length
                ? moment(results[1][0].date).add(1, 'hours')
                : moment([2013, 0, 1]);

        addData(stations, date);
    });

function addData(stations, date) {
    var request = {
        date: date,
        regions: regions,
        params: params
    };

    api.getMeasurements(request, function (err, data) {

        if (err) {
            console.log('Error: ' + err.message);
            return;
        }

        var result = getMeasurementsForDay(data, stations, date);

        db.insertMeasurements(result, function () {
            console.log('Added measurements: ' + date.toString());
        });

        if (date.isBefore(new Date(), 'hour')) {
            // Call the whole process again for the next day
            addData(stations, date);
        }
    });
}

function getMeasurementsForDay(data, stations, date) {
    var dateString,
        result = [];

    while (true) {
        dateString = date.format('YYYYMMDD HH');

        stations.forEach(function (station) {

            var shouldInsert,
                stationParams = [],
                clonedDate = date.clone().toDate();

            params.forEach(function (p) {
                stationParams.push({
                    param: p,
                    value: getValueFromResults(p, dateString, station, data)
                });
            });

            shouldInsert = _.some(stationParams, function (sp) {
                return !!sp.value;
            });

            if (!shouldInsert) {
                return;
            }

            result.push({
                date: clonedDate,
                stationId: station._id,
                values: stationParams
            });
        });

        date.add(1, 'hours');

        if (date.hour() === 0) {
            break;
        }
    }

    return result;
}

function getValueFromResults(param, dateString, station, results) {
    var measure = _.find(results, function (elm) {
        return elm.parameter === param && elm.measurements[dateString] && elm.measurements[dateString].hasOwnProperty(station.name);
    });

    if (!measure) {
        return null;
    }

    var value = parseFloat(measure.measurements[dateString][station.name]);

    return isNaN(value) ? null : value;
}
