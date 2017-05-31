"use strict";

const Alexa = require("alexa-sdk");
const helpers = require("./helpers");

module.exports = {
    mainHandlers: require("./handlers/null_state"),
    whatsOnHandlers: Alexa.CreateStateHandler(helpers.states.WHATS_ON, require("./handlers/whats_on_state"))
};
