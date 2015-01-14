var couchbase = require('couchbase');
var redis = require('redis');
var db = redis.createClient();
var myCluster = new couchbase.Cluster();
var bucket = myCluster.openBucket('test');

module.exports.redis = db;
module.exports.couchbase = bucket;