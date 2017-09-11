/**
 * Internationalisation JSON object - used with alexa-sdk to provide translation functionality.
 *
 * @see https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs#adding-multi-language-support-for-skill
 *
 * @example
 * const language_strings = require('./lib/parliament/language_string');
 * language_strings["en-GB"].translation.PARLIAMENT
 */
module.exports = {
    "en-GB": {
        "translation": {
            "THERE_IS": "There is",
            "EVENT": "event",
            "THERE_ARE": "There are",
            "EVENTS": "events",
            "ON": "on",
            "ON_AT": "on at",
            "PARLIAMENT": "the Houses of Parliament",
            "TODAY": "today",
            "IN": "in",
            "THE_COMMONS": "the House of Commons",
            "STARTING_AT": "Starting at",
            "AND": "and",
            "THE_LORDS": "the House of Lords",
            "HEAR_MORE": "Would you like to hear more?",
            "IT_IS": "it is",
            "THEY_ARE": "they are all",
            "NO_EVENTS": "There are no events",
            "NEXT_EVENT": "The next event",
            "WILL_BE_ON": "will be on",
            "IS_TOMORROW": "is tomorrow",
            "WHATS_ON_CARD_TITLE": "What's on at Parliament?",
            "WHATS_ON_ERROR": "There was an error finding out what's on. Please try again later.",
            "HELP_TEXT": "Parliament for Alexa, can tell you what's on today at the Houses of Parliament, or tell you who your MP is. Try saying, 'what's on', to hear about the events at both houses. Alternatively, say, 'whats on at the commons', or, 'whats on in the lords', to hear about the events at a specific house. To find out who your MP is, try saying 'who's my MP'.",
            "HELP_TEXT_REPROMPT": "Try saying, 'what's on', or 'who's my MP'.",
            "WHATS_ON_HELP_TEXT": "You can either say, 'yes', to hear more. Or, 'no', to cancel.",
            "LAUNCH_TEXT": "Welcome to Parliament. Say, 'what's on', to find out whats happening today at the Houses of Parliament. Say, 'who's my MP' to find out information about your MP. Or say, 'help', for more information.",
            "LAUNCH_TEXT_REPROMPT": "Try saying, 'what's on'.",
            "YES_RESPONSE": "Once this feature has been implemented, it will be great!",
            "NO_RESPONSE": "Okay.",
            "CANCEL_RESPONSE": "",
            "ERROR": "Something went wrong, please try again later.",
            "REQUEST_ERROR": "There was a problem connecting to Parliament. Please try again later.",
            "FROM": "From",
            "TILL": "till",
            "THATS_ALL": "That's all for today.",
            "GOODBYE": "Goodbye.",
            "NOTIFY_MISSING_PERMISSIONS": "Please enable Location permissions in the Amazon Alexa app.",
            "NO_ADDRESS": "I couldn’t get a postcode for your device. Please check the location in your Amazon Alexa app.",
            "LOCATION_FALIURE": "There was a problem getting your postcode from Amazon. Please try again later.",
            "MP_PROBLEM": "There was a problem getting information from Parliament. Please try again later."
        }
    },
    "en-US": {
        "translation": {
            "THERE_IS": "There is",
            "EVENT": "event",
            "THERE_ARE": "There are",
            "EVENTS": "events",
            "ON": "on",
            "ON_AT": "on at",
            "PARLIAMENT": "the Houses of Parliament",
            "TODAY": "today",
            "IN": "in",
            "THE_COMMONS": "the House of Commons",
            "STARTING_AT": "Starting at",
            "AND": "and",
            "THE_LORDS": "the House of Lords",
            "HEAR_MORE": "Would you like to hear more?",
            "IT_IS": "it is",
            "THEY_ARE": "they are all",
            "NO_EVENTS": "There are no events",
            "NEXT_EVENT": "The next event",
            "WILL_BE_ON": "will be on",
            "IS_TOMORROW": "is tomorrow",
            "WHATS_ON_CARD_TITLE": "What's on at Parliament?",
            "WHATS_ON_ERROR": "There was an error finding out what's on. Please try again later.",
            "HELP_TEXT": "Parliament for Alexa, can tell you what's on today at the Houses of Parliament, or tell you who your MP is. Try saying, 'what's on', to hear about the events at both houses. Alternatively, say, 'whats on at the commons', or, 'whats on in the lords', to hear about the events at a specific house. To find out who your MP is, try saying 'who's my MP'.",
            "HELP_TEXT_REPROMPT": "Try saying, 'what's on', or 'who's my MP'.",
            "WHATS_ON_HELP_TEXT": "You can either say, 'yes', to hear more. Or, 'no', to cancel.",
            "LAUNCH_TEXT": "Welcome to Parliament. Say, 'what's on', to find out whats happening today at the Houses of Parliament. Say, 'who's my MP' to find out information about your MP. Or say, 'help', for more information.",
            "LAUNCH_TEXT_REPROMPT": "Try saying, 'what's on'.",
            "YES_RESPONSE": "Once this feature has been implemented, it will be great!",
            "NO_RESPONSE": "Okay.",
            "CANCEL_RESPONSE": "",
            "ERROR": "Something went wrong, please try again later.",
            "REQUEST_ERROR": "There was a problem connecting to Parliament. Please try again later.",
            "FROM": "From",
            "TILL": "till",
            "THATS_ALL": "That's all for today.",
            "GOODBYE": "Goodbye.",
            "NOTIFY_MISSING_PERMISSIONS": "Please enable Location permissions in the Amazon Alexa app.",
            "NO_ADDRESS": "I couldn’t get a postcode for your device. Please check the location in your Amazon Alexa app.",
            "MP_PROBLEM": "There was a problem getting information from Parliament. Please try again later." ,
            "LOCATION_FALIURE": "There was a problem getting your postcode from Amazon. Please try again later."
        }
    }
};
