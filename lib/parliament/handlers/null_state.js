"use strict";

const helpers = require('../helpers');

module.exports = {
    "AMAZON.YesIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":tell", this.t("CANCEL_RESPONSE"));
    },

    "AMAZON.NoIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":tell", this.t("CANCEL_RESPONSE"));
    },

    "AMAZON.CancelIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":tell", this.t("CANCEL_RESPONSE"));
    },

    "AMAZON.StopIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":tell", this.t("CANCEL_RESPONSE"));
    },

    "Unhandled": function () {
        helpers.logHandler(this.name);

        this.handler.state = null;
        this.emit(":tell", this.t("GOODBYE"));
    },

    "AMAZON.HelpIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":ask", this.t("HELP_TEXT"), this.t("HELP_TEXT_REPROMPT"));
    },

    "LaunchRequest": function () {
        helpers.logHandler(this.name);

        this.emit(":ask", this.t("LAUNCH_TEXT"), this.t("LAUNCH_TEXT_REPROMPT"));
    },

    "WhatsOnIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.WHATS_ON;

        this.emitWithState("WhatsOnIntent");
    }
}