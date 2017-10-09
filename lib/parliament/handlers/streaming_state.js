const audioData = require("../audioData");
const audioController = require('../helpers/audioController');
const constants = require('../constants');
const winston = require('../helpers/logger');

module.exports = {
    /*
     *  All Intent Handlers for state : STREAMING
     */
    'AMAZON.NextIntent': function () {
        this.response.speak('This is radio, you have to wait for next track to play.');
        this.emit(':responseReady');
    },
    'AMAZON.PreviousIntent': function () {
        this.response.speak('This is radio, you can not go back in the playlist');
        this.emit(':responseReady');
    },

    'AMAZON.StopIntent': function () { audioController.stop(this) },
    'AMAZON.PauseIntent': function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.CancelIntent': function () { this.emit('AMAZON.StopIntent'); },

    'AMAZON.ResumeIntent': function () { audioController.play(this, `resuming ${audioData.title}`) },

    'AMAZON.StartOverIntent': function () {
        this.response.speak('This is radio, you can not do that.  You can say stop or pause to stop listening.');
        this.emit(':responseReady');

    },
    'AMAZON.LoopOnIntent': function () { this.emit('AMAZON.StartOverIntent'); },
    'AMAZON.LoopOffIntent': function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.ShuffleOnIntent': function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.ShuffleOffIntent': function () { this.emit('AMAZON.StartOverIntent');},

    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    'PlayCommandIssued': function () { audioController.play(this, 'Playing.') },
    'PauseCommandIssued': function () { audioController.stop(this) },

    /**
     * Unhandled handler - resets the state and stops the session
     *
     * @function
     */
    "Unhandled": function () {
        winston.info('Unhandled_STREAMING');
        
        winston.info('----------');
        winston.info(this.event.request);
        winston.info('----------');

        this.handler.state = constants.states.START_MODE;

        let event_to_emit;

        if(this.event.request.type === 'IntentRequest') {
            event_to_emit = this.event.request.intent.name
        } else {
            event_to_emit = this.event.request.type;
        }

        if(typeof event_to_emit === 'undefined' || event_to_emit === null)
            event_to_emit = 'Unhandled';

        winston.info(`Emitting: ${event_to_emit}`);

        this.emitWithState(event_to_emit);
    }
};