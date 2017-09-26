'use strict';

// Require Alexa SDK so that we can create state-specific handlers
const Alexa = require("alexa-sdk");

// Require our helpers so that we have access to our skill states
const constants = require("./constants");

/**
 * Alexa skill handlers
 */
module.exports = {
    /**
     * NULL_STATE state intent handlers
     *
     * @see handlers.whats_on_state
     */
    startHandlers: Alexa.CreateStateHandler(constants.states.START_MODE, require("./handlers/start_state")),

    /**
     * WHATS_ON state intent handlers
     *
     * @see handlers.whats_on_state
     */
    whatsOnHandlers: Alexa.CreateStateHandler(constants.states.WHATS_ON, require("./handlers/whats_on_state")),

    /**
     * STREAMING state intent handlers
     *
     * @see handlers.streaming_state
     */
    streamingHandlers: Alexa.CreateStateHandler(constants.states.STREAMING, require("./handlers/streaming_state"))
};
