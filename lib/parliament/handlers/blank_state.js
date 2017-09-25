"use strict";

// Include our helper methods
const helpers = require("../helpers");

/**
 * Alexa blank state intent handlers
 */
module.exports = {
    /**
     * AMAZON.YesIntent handler - stops the session
     *
     * @function
     */
    "AMAZON.YesIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    /**
     * AMAZON.NoIntent handler - stops the session
     *
     * @function
     */
    "AMAZON.NoIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    /**
     * AMAZON.CancelIntent handler - stops the session
     *
     * @function
     */
    "AMAZON.CancelIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    /**
     * AMAZON.StopIntent handler - stops the session
     *
     * @function
     */
    "AMAZON.StopIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    /**
     * AMAZON.HelpIntent handler - gives a clear message explaining what the skill can 1~do
     *
     * @function
     */
    "AMAZON.HelpIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    /**
     * LaunchRequest handler - gives a welcome message and explains usage instructions
     *
     * @function
     */
    "LaunchRequest": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    /**
     * WhatsOnIntent - sets the skill state to 'WHATS_ON' and calls the state-specific intent.
     *
     * @function
     */
    "WhatsOnIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    /**
     * MyMPIntent - sets the skill state to 'NULL_STATE' and calls the state-specific intent.
     *
     * @function
     */
    "MyMPIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    'PlayAudio': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    'ExceptionEncountered': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    'AMAZON.NextIntent': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },
    'AMAZON.PreviousIntent': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    'AMAZON.PauseIntent': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    'AMAZON.ResumeIntent': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    'AMAZON.LoopOnIntent': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },
    'AMAZON.LoopOffIntent': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    'AMAZON.ShuffleOnIntent': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },
    'AMAZON.ShuffleOffIntent': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    'AMAZON.StartOverIntent': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);

    },
    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    'PlayCommandIssued': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name); },
    'PauseCommandIssued': function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    'PlaybackStarted' : function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },
    'PlaybackFinished' : function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },
    'PlaybackStopped' : function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },
    'PlaybackNearlyFinished' : function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },
    'PlaybackFailed' : function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    },

    /**
     * Unhandled handler - resets the state and stops the session
     *
     * @function
     */
    "Unhandled": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.NULL_STATE;

        this.emitWithState(this.name);
    }
};
