"use strict";

const helpers = require('../helpers');

/**
 * Alexa WHATS_ON state intent handlers
 */
module.exports = {
    /**
     * AMAZON.YesIntent handler - stops the session
     *
     * @param callback
     * @param done
     *
     * @function
     */
    "AMAZON.YesIntent": function (callback, done) {
        helpers.logHandler(this.name);

        this.handler.state = '';
        let handlers = this;

        let houseOfInterest = handlers.attributes.houseOfInterest;

        let uri_options = helpers.getCalendarUriOptions(houseOfInterest);

        // Get our events and generate a message from them
        helpers.getEvents(uri_options, function (events) {
            helpers.generateDetailedEventMessage(events, handlers, callback, done)

            handlers.attributes.houseOfInterest = null;
        });
    },

    /**
     * AMAZON.NoIntent handler - stops the session
     *
     * @memberOf WhatsOnState
     *
     * @function
     */
    "AMAZON.NoIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = '';
        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    /**
     * AMAZON.CancelIntent handler - stops the session
     *
     * @memberOf WhatsOnState
     *
     * @function
     */
    "AMAZON.CancelIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = '';
        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    /**
     * AMAZON.StopIntent handler - stops the session
     *
     * @memberOf WhatsOnState
     *
     * @function
     */
    "AMAZON.StopIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = '';
        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    /**
     * Unhandled handler - resets the state and stops the session
     *
     * @function
     */
    "Unhandled": function () {
        helpers.logHandler(this.name);

        this.handler.state = '';
        this.emitWithState("LaunchRequest");
    },

    /**
     * AMAZON.HelpIntent handler - gives a clear message explaining what the skill can do
     *
     * @memberOf WhatsOnState
     *
     * @function
     */
    "AMAZON.HelpIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":ask", this.t("WHATS_ON_HELP_TEXT"), this.t("WHATS_ON_HELP_TEXT"));
    },

    /**
     * WhatsOnIntent - sets the skill state to 'WHATS_ON' and calls the state-specific intent.
     *
     * @param callback
     * @param done
     *
     * @function
     */
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