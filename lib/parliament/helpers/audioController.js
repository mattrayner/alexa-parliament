'use strict';

const constants = require('../constants');
const audioData = require('../audioData');
const winston = require('../helpers/logger');

module.exports = {
    play: (handlers, text) => {
        /*
         *  Using the function to begin playing audio when:
         *      Play Audio intent invoked.
         *      Resuming audio when stopped/paused.
         *      Next/Previous commands issued.
         */

        handlers.handler.state = constants.states.STREAMING;

        winston.info('AudioController#Play');

        if (canThrowCard(handlers)) {
            winston.info('Throwing card');
            let cardTitle = audioData.subtitle;
            let cardContent = audioData.cardContent;
            let cardImage = audioData.image;
            handlers.response.cardRenderer(cardTitle, cardContent, cardImage);
        }

        winston.info('Generating response');

        handlers.response.speak(text).audioPlayerPlay('REPLACE_ALL', audioData.url, audioData.url, null, 0);

        winston.info('emitting');

        handlers.emit(':responseReady');
    },
    stop: (handlers) => {
        /*
         *  Issuing AudioPlayer.Stop directive to stop the audio.
         *  Attributes already stored when AudioPlayer.Stopped request received.
         */
        handlers.handler.state = constants.states.START_MODE;
        handlers.response.speak("Good bye.").audioPlayerStop();
        handlers.emit(':responseReady');
    }
};

function canThrowCard(handlers) {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (handlers.event.request.type === 'IntentRequest' || handlers.event.request.type === 'LaunchRequest') {
        return true;
    } else {
        return false;
    }
}