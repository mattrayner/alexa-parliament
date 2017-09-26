"use strict";

// Require the main Alexa SDK
const Alexa = require("alexa-sdk");
const languageStrings = require("./parliament/language_strings");
const constants = require('./parliament/constants');
const stateHandlers = require("./parliament/stateHandlers");
// const audioEventHandlers = require("./parliament/audioEventHandlers.js");

/**
 * The main AWS Lambda Handler for the Parliament Alexa skill
 *
 * @alias index.handler
 *
 * @example
 * const parliament = require('./lib');
 * let instance = parliament.handler({JSON}, {Object}, {Function})
 *
 * @param {JSON} event the json event sent by an Alexa-enabled application that we need to process
 * @param {Object} context an aws-lambda object which is called on success or fail
 * @param {Function} callback a callback that *should* be executed on success or fail
 */
exports.handler = function (event, context, callback) {
    let alexa = Alexa.handler(event, context, callback);

    // Only specify appId when we are running in production (facilitates tests)
    if ("undefined" === typeof process.env.DEBUG) {
        // Lock to our appId
        alexa.appId = constants.appId;
    }

    // Enable DynamoDB for attribute persistence
    alexa.dynamoDBTableName = constants.dynamoDBTableName;

    // Enable internationalization features
    alexa.resources = languageStrings;

    // Register our handlers
    alexa.registerHandlers(
        stateHandlers.startHandlers,
        stateHandlers.whatsOnHandlers,
        stateHandlers.streamingHandlers
    );

    // Execute our Alexa event and return a result
    alexa.execute();
};

