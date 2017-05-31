"use strict";

const helpers = require('../helpers');

module.exports = {
    "AMAZON.YesIntent": function (callback, done) {
        helpers.logHandler(this.name);

        let handlers = this;

        let houseOfInterest = handlers.attributes.houseOfInterest;

        let uri_options = helpers.getCalendarUriOptions(houseOfInterest);

        // Get our events and generate a message from them
        helpers.getEvents(uri_options, function (events) {
            helpers.generateDetailedEventMessage(events, handlers, callback, done);
        });
    },

    "AMAZON.NoIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = null;
        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    "AMAZON.CancelIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = null;
        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    "AMAZON.StopIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = null;
        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    "Unhandled": function () {
        helpers.logHandler(this.name);

        this.handler.state = null;
        this.emit(":tell", this.t("GOODBYE"));
    },

    "AMAZON.HelpIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":ask", this.t("WHATS_ON_HELP_TEXT"), this.t("WHATS_ON_HELP_TEXT"));
    },

    "WhatsOnIntent": function (callback, done) {
        helpers.logHandler(this.name);

        let handlers = this;

        let houseOfInterest = helpers.getHouseIntentData(handlers.event.request.intent);
        handlers.attributes.houseOfInterest = houseOfInterest;

        let uri_options = helpers.getCalendarUriOptions(houseOfInterest);

        // Get our events and generate a message from them
        helpers.getEvents(uri_options, function (events) {
            helpers.generateEventMessage(events, handlers, callback, done);
        });
    }
};