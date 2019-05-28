"use strict";
/**
 * @copyright Festify Dev Team, 2017
 * @author Festify Dev Team
 * @licence MIT
 */
exports.__esModule = true;
var exec_promise_1 = require("exec-promise.js");
var eventemitter3_1 = require("eventemitter3.js");
/** @hidden */
var emitter;
/** @hidden */
var emitterRegistered = false;
/**
 * Plays a track by its URI.
 *
 * When `positionMs` is < 0, this function immediately throws an error
 * instead of returning a rejected promise.
 *
 * `auth` may change freely during runtime. The plugin will handle the
 * required login / logout processes automatically when a new track is played.
 *
 * @param {string} trackUri The URI of the track to play.
 * @param {AuthorizationData} auth Valid authorization data.
 * @param {number} positionMs The position (in millseconds) to start playing from. Must be >= 0.
 * @returns {Promise<void>} A promise that resolves when the track starts playing.
 * @async
 */
function play(trackUri, auth, positionMs) {
    if (!trackUri) {
        throw new ReferenceError("trackUri parameter is null");
    }
    if (!auth) {
        throw new ReferenceError("auth parameter is null");
    }
    if (!auth.token) {
        throw new ReferenceError("token parameter is null");
    }
    if (!auth.clientId) {
        throw new ReferenceError("clientId parameter is null");
    }
    if (positionMs !== undefined && positionMs < 0) {
        throw new RangeError("positionMs parameter is < 0");
    }
    return exec_promise_1["default"]('play', [trackUri, auth.token, auth.clientId, positionMs || 0]);
}
exports.play = play;
/**
 * Obtains the playback position in milliseconds.
 *
 * If no track is currently loaded / playing, the function returns 0.
 *
 * @returns {Promise<number>} A promise with the playback position.
 * @async
 */
function getPosition() {
    return exec_promise_1["default"]('getPosition');
}
exports.getPosition = getPosition;
/**
 * Pauses playback.
 *
 * If no track is currently loaded / playing, this function does nothing.
 *
 * @returns {Promise<void>} A promise that resolves when the playback has been paused.
 * @async
 */
function pause() {
    return exec_promise_1["default"]('pause');
}
exports.pause = pause;
/**
 * Resumes playback.
 *
 * If no track is currently loaded / playing, this function returns
 * a rejected Promise with an error of type `not_playing`.
 *
 * @returns {Promise<void>} A promise that resolves when the playback has been resumed.
 * @async
 */
function resume() {
    return exec_promise_1["default"]('resume');
}
exports.resume = resume;
/**
 * Seeks to the given position in the current track.
 *
 * If no track is currently loaded / playing, this function returns
 * a rejected Promise with an error of type `not_playing`.
 *
 * When `positionMs` is < 0, this function immediately throws an error
 * instead of returning a rejected promise.
 *
 * @param {number} positionMs The position (in millseconds) to seek to. Must be >= 0.
 * @returns {Promise<void>} A promise that resolves when the seek has been done.
 * @async
 */
function seekTo(positionMs) {
    if (positionMs < 0) {
        throw new RangeError("positionMs parameter is < 0");
    }
    return exec_promise_1["default"]('seekTo', [positionMs]);
}
exports.seekTo = seekTo;
/**
 * Obtains an event emitter that relays the events fired by the native SDKs.
 *
 * The emitter will be created once and then returned on subsequent invocations.
 * The emitter implementation comes from [eventemitter3]{@link https://github.com/primus/eventemitter3}.
 *
 * The emitted events are the following:
 * - connectionmessage
 * - loggedin
 * - loggedout
 * - loginfailed
 * - playbackerror
 * - playbackevent
 * - temporaryerror
 *
 * In the case of `loginfailed`, `playbackevent` and `playbackerror`, the event contains
 * a payload that describes what happened exactly. The payload is simply the name
 * of the discriminant of the enum in the native SDK without the prefix (usually
 * `kSp` or `kSpError`). See the offical documentation [here]{@link https://spotify.github.io/android-sdk/player/com/spotify/sdk/android/player/Error.html}
 * and [here]{@link https://spotify.github.io/android-sdk/player/com/spotify/sdk/android/player/PlayerEvent.html}
 * for all variants.
 *
 * @returns {Promise<EventEmitter>} A promise that resolves to the emitter.
 * @async
 */
function getEventEmitter() {
    if (emitter) {
        return Promise.resolve(emitter);
    }
    emitter = new eventemitter3_1.EventEmitter();
    return new Promise(function (res, rej) {
        // Delay callbacks from native code because the Spotify SDKs
        // cannot cope with synchronous invocation from inside of an event
        // handler function.
        var resolve = function (v) { return setTimeout(function () { return res(v); }); };
        var reject = function (e) { return setTimeout(function () { return rej(e); }); };
        cordova.exec(function (event) {
            // First callback invocation confirms the emitter's registration
            // with the native code. The subsequent ones are actual events.
            if (!emitterRegistered) {
                emitterRegistered = true;
                resolve(emitter);
            }
            else {
                setTimeout(function () {
                    var _a;
                    return (_a = emitter).emit.apply(_a, [event.name].concat((event.args || [])));
                });
            }
        }, function (err) {
            // Make sure we can try again
            if (!emitterRegistered) {
                emitter = null;
            }
            reject(err);
        }, 'SpotifyConnector', 'registerEventsListener', []);
    });
}
exports.getEventEmitter = getEventEmitter;
