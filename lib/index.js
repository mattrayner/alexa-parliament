"use strict";

// Require the main Alexa SDK
const Alexa = require("alexa-sdk");

// Variables used to customise our application
const appId = "amzn1.ask.skill.d9431bea-6b44-4cea-b4ff-d4781bd09504"; // The Alexa skill ID we are writing this for
const dynamoDBTableName = "ParliamentAlexaSkill";                     // The DynamoDB Table our skill uses to persist attributes

const languageStrings = require("./parliament/language_strings.js");  // Alexa translation file

// Require our intent handlers, one file for each skill state
const mainIntentHandlers = require("./parliament/handlers.js").mainHandlers;
const whatsOnIntentHandlers = require("./parliament/handlers.js").whatsOnHandlers;

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

    // Only specify appId and dynamoDBTableName when we are running in production (facilitates tests)
    if ("undefined" === typeof process.env.DEBUG) {
        // Lock to our appId
        alexa.appId = appId;
    }
        // Enable DynamoDB for attribute persistence
        alexa.dynamoDBTableName = dynamoDBTableName;
    // }

    // Enable internationalization features
    alexa.resources = languageStrings;

    // Register our handlers
    alexa.registerHandlers(mainIntentHandlers, whatsOnIntentHandlers);

    // Execute our Alexa event and return a result
    alexa.execute();
};

