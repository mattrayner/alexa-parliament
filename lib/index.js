// Include our required additional files
var Alexa = require('alexa-sdk'), // Require the main Alexa SDK
    languageStrings = require('./parliament/language_strings.js'), // Require our i18n translation file
    intentHandlers = require('./parliament/handlers.js'); // Require our intent handlers

// Configure the alexa SDK
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    if ('undefined' === typeof process.env.DEBUG) {
        alexa.appId = appId;
    }

    // Enable internationalization (i18n) features.
    alexa.resources = languageStrings;

    // Register our handlers
    alexa.registerHandlers(intentHandlers);

    // Start our Alexa skill
    alexa.execute();
};

