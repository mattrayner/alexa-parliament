"use strict";

// Include our required additional files
const Alexa = require("alexa-sdk");                                   // Require the main Alexa SDK

const appId = "amzn1.ask.skill.d9431bea-6b44-4cea-b4ff-d4781bd09504"; // The Alexa skill ID for our application
const dynamoDBTableName = "ParliamentAlexaSkill";                     // The DynamoDB Table our skill uses to persist attributes

const languageStrings = require("./parliament/language_strings.js");  // Require our i18n translation file

// Require our intent handlers
const mainIntentHandlers = require("./parliament/handlers.js").mainHandlers;
const whatsOnIntentHandlers = require("./parliament/handlers.js").whatsOnHandlers;

// Configure our Alexa skill
exports.handler = function(event, context, callback){
    let alexa = Alexa.handler(event, context, callback);

    // Lock to our appId
    // alexa.appId = appId;

    // Only specify appId and DynamoDB details when we are running in production (facilitates alexa-skill-test node app)
    if ("undefined" === typeof process.env.DEBUG) {
        // Enable DynamoDB for attribute persistence
        // alexa.dynamoDBTableName = dynamoDBTableName;
    }

    // Enable internationalization (i18n) features
    alexa.resources = languageStrings;

    // Register our handlers
    alexa.registerHandlers(mainIntentHandlers, whatsOnIntentHandlers);

    // Start our Alexa skill
    alexa.execute();
};

