"use strict";
exports.__esModule = true;
var queue_1 = cordova.require('cordova-spotify.async');
var _exec = cordova.exec;
var q = async.queue(function (_a, cb) {
    var methodName = _a.methodName, args = _a.args;
    // Delay the resolution and rejection callbacks because
    // the Spotify SDKs do not like being reinvoked from inside
    // of an event handler function.
    _exec(function (val) { return setTimeout(function () { return cb(null, val); }); }, function (err) { return setTimeout(function () { return cb(err); }); }, 'SpotifyConnector', methodName, args || []);
});
/**
 * Cordova's exec with Promise and error handling support.
 *
 * @param methodName the native method to execute
 * @param args method arguments
 * @hidden
 */
function default_1(methodName, args) {
    if (args === void 0) { args = []; }
    if (!methodName) {
        throw new Error("Missing method or class name argument (1st).");
    }
    return new Promise(function (res, rej) { return q.push({ methodName: methodName, args: args }, function (err, val) { return err ? rej(err) : res(val); }); })["catch"](function (err) {
        if (err) {
            var e = new Error(err.msg);
            e.name = err.type;
            return Promise.reject(e);
        }
        return Promise.reject(err);
    });
}
exports["default"] = default_1;
