"use strict";

const Alexa = require("alexa-sdk");
const helpers = require("./helpers");

// Define states
let states = {
    WHATS_ON: "_WHATS_ON"
};

function logHandler(name) {
    console.log("Intent: " + name);
}

module.exports = {
    mainHandlers: {
        "AMAZON.YesIntent": function () {
            logHandler(this.name);

            this.emit(":tell", this.t("CANCEL_RESPONSE"));
        },

        "AMAZON.NoIntent": function () {
            logHandler(this.name);

            this.emit(":tell", this.t("CANCEL_RESPONSE"));
        },

        "AMAZON.CancelIntent": function () {
            logHandler(this.name);

            this.emit(":tell", this.t("CANCEL_RESPONSE"));
        },

        "AMAZON.StopIntent": function () {
            logHandler(this.name);

            this.emit(":tell", this.t("CANCEL_RESPONSE"));
        },

        "Unhandled": function x() {
            logHandler(this.name);

            this.handler.state = null;
            this.emit(":tell", this.t("GOODBYE"));
        },

        "AMAZON.HelpIntent": function () {
            logHandler(this.name);

            this.emit(":ask", this.t("HELP_TEXT"), this.t("HELP_TEXT_REPROMPT"));
        },

        "LaunchRequest": function () {
            logHandler(this.name);

            this.emit(":ask", this.t("LAUNCH_TEXT"), this.t("LAUNCH_TEXT_REPROMPT"));
        },

        "WhatsOnIntent": function () {
            logHandler(this.name);

            this.handler.state = states.WHATS_ON;

            this.emitWithState("WhatsOnIntent");
        }
    },

    whatsOnHandlers: Alexa.CreateStateHandler(states.WHATS_ON, {
        "AMAZON.YesIntent": function (callback, done) {
            logHandler(this.name);

            let handlers = this;

            let houseOfInterest = handlers.attributes.houseOfInterest;

            let uri_options = helpers.getCalendarUriOptions(houseOfInterest);

            // Get our events and generate a message from them
            helpers.getEvents(uri_options, function (events) {
                helpers.generateDetailedEventMessage(events, handlers, callback, done);
            });
        },

        "AMAZON.NoIntent": function () {
            logHandler(this.name);

            this.handler.state = null;
            this.emit(":tell", this.t("NO_RESPONSE"));
        },

        "AMAZON.CancelIntent": function () {
            logHandler(this.name);

            this.handler.state = null;
            this.emit(":tell", this.t("NO_RESPONSE"));
        },

        "AMAZON.StopIntent": function () {
            logHandler(this.name);

            this.handler.state = null;
            this.emit(":tell", this.t("NO_RESPONSE"));
        },

        "Unhandled": function () {
            logHandler(this.name);

            this.handler.state = null;
            this.emit(":tell", this.t("GOODBYE"));
        },

        "AMAZON.HelpIntent": function () {
            logHandler(this.name);

            this.emit(":ask", this.t("HELP_TEXT"), this.t("HELP_TEXT_REPROMPT"));
        },

        "WhatsOnIntent": function (callback, done) {
            logHandler(this.name);

            let handlers = this;

            let houseOfInterest = helpers.getHouseIntentData(handlers.event.request.intent);
            handlers.attributes.houseOfInterest = houseOfInterest;

            let uri_options = helpers.getCalendarUriOptions(houseOfInterest);

            // Get our events and generate a message from them
            helpers.getEvents(uri_options, function (events) {
                helpers.generateEventMessage(events, handlers, callback, done);
            });
        }
    })
};
