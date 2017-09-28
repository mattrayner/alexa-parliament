'use strict';

const audioData = require('../audioData');
const winston = require('winston');

// Binding audio handlers to PLAY_MODE State since they are expected only in this mode.
let audioEventHandlers = {
    'PlaybackStarted' : function () {
        /*
         * AudioPlayer.PlaybackStarted Directive received.
         * Confirming that requested audio file began playing.
         * Storing details in dynamoDB using attributes.
         */
        winston.log("Playback started");
        this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
        this.emit(':responseReady');
    },
    'PlaybackFinished' : function () {
        /*
         * AudioPlayer.PlaybackFinished Directive received.
         * Confirming that audio file completed playing.
         * Storing details in dynamoDB using attributes.
         */
        winston.log("Playback finished");
        this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
        this.emit(':responseReady');
    },
    'PlaybackStopped' : function () {
        /*
         * AudioPlayer.PlaybackStopped Directive received.
         * Confirming that audio file stopped playing.
         * Storing details in dynamoDB using attributes.
         */
        winston.log("Playback stopped");
        this.callback(null, null);
        //this.context.succeed(true);
    },
    'PlaybackNearlyFinished' : function () {
        winston.log("Playback nearly finished");
        // this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
        this.response.audioPlayerPlay('REPLACE_ALL', audioData.url, audioData.url, null, 0);
        this.emit(':responseReady');
    },
    'PlaybackFailed' : function () {
        //  AudioPlayer.PlaybackNearlyFinished Directive received. Logging the error.
        winston.log("Playback Failed : %j", this.event.request.error);
        this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
        this.emit(':responseReady');
    }
};

module.exports = audioEventHandlers;
