'use strict';

var Db = require('nedb'),
    dbMeasurements = new Db({filename: 'db/measurements.db', autoload: true}),
    dbStations = new Db({filename: 'db/stations.db', autoload: true});

dbMeasurements.ensureIndex({fieldName: 'date'}, function (err) {
    if (err) {
        console.log('Error creating index: ' + err);
    }
});

//
// Measurement queries

function insertMeasurements(data, callback) {
    dbMeasurements.insert(data, callback);
}

function getLatestDate(callback) {
    dbMeasurements
        .find({}, {date: 1})
        .sort({date: -1})
        .limit(1)
        .exec(callback);
}

//
// Station queries

function getStations(callback) {
    dbStations.find({}, callback);
}

//
// Exports

exports.getStations = getStations;
exports.getLatestDate = getLatestDate;
exports.insertMeasurements = insertMeasurements;