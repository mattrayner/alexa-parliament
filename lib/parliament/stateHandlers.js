"use strict";

// Require Alexa SDK so that we can create state-specific handlers
const Alexa = require("alexa-sdk");

// Require our helpers so that we have access to our skill states
const helpers = require("./helpers");

/**
 * Alexa skill handlers
 */
module.exports = {
    /**
     * Blank state intent handlers
     *
     * @see handlers.null_state
     */
    mainHandlers: require("./handlers/blank_state"),

    /**
     * NULL_STATE state intent handlers
     *
     * @see handlers.whats_on_state
     */
    nullHandlers: Alexa.CreateStateHandler(helpers.states.NULL_STATE, require("./handlers/null_state")),

    /**
     * WHATS_ON state intent handlers
     *
     * @see handlers.whats_on_state
     */
    whatsOnHandlers: Alexa.CreateStateHandler(helpers.states.WHATS_ON, require("./handlers/whats_on_state")),

    /**
     * STREAMING state intent handlers
     *
     * @see handlers.streaming_state
     */
    streamingHandlers: Alexa.CreateStateHandler(helpers.states.STREAMING, require("./handlers/streaming_state"))
};
