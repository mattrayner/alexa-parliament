'use strict';

const audioData = require('../audioData');
const winston = require('../helpers/logger');

// Binding audio handlers to PLAY_MODE State since they are expected only in this mode.
let audioEventHandlers = {
    'PlaybackStarted' : function () {
        /*
         * AudioPlayer.PlaybackStarted Directive received.
         * Confirming that requested audio file began playing.
         * Storing details in dynamoDB using attributes.
         */
        winston.info("Playback started");
        this.attributes['token'] = getToken.call(this);
        this.attributes['playbackFinished'] = false;
        this.emit(':saveState', true);
    },
    'PlaybackFinished' : function () {
        /*
         * AudioPlayer.PlaybackFinished Directive received.
         * Confirming that audio file completed playing.
         * Storing details in dynamoDB using attributes.
         */
        winston.info("Playback finished");
        this.attributes['playbackFinished'] = true;
        this.attributes['enqueuedToken'] = false;
        this.emit(':saveState', true);
    },
    'PlaybackStopped' : function () {
        /*
         * AudioPlayer.PlaybackStopped Directive received.
         * Confirming that audio file stopped playing.
         * Storing details in dynamoDB using attributes.
         */
        winston.info("Playback stopped");
        this.attributes['token'] = getToken.call(this);
        this.attributes['offsetInMilliseconds'] = getOffsetInMilliseconds.call(this);
        this.emit(':saveState', true);
    },
    'PlaybackNearlyFinished' : function () {
        winston.info("Playback nearly finished");
        // this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
        // this.response.audioPlayerPlay('REPLACE_ALL', audioData.url, audioData.url, null, 0);
        this.context.succeed({});
    },
    'PlaybackFailed' : function () {
        //  AudioPlayer.PlaybackNearlyFinished Directive received. Logging the error.
        winston.info("Playback Failed : %j", this.event.request.error);
        this.context.succeed({});
    }
};

module.exports = audioEventHandlers;


function getToken() {
    // Extracting token received in the request.
    return this.event.request.token;
}

function getOffsetInMilliseconds() {
    // Extracting offsetInMilliseconds received in the request.
    return this.event.request.offsetInMilliseconds;
}