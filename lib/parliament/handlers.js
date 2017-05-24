const helpers = require("./helpers");
const moment = require("moment");

module.exports = {

    "AMAZON.YesIntent": function(callback, done) {
        "use strict";

        let handlers = this;
        let houseOfInterest = handlers.attributes.houseOfInterest;

        let uri_options = helpers.getCalendarUriOptions(houseOfInterest);

        // Get our events and generate a message from them
        helpers.getEvents(uri_options, function (events) {
            helpers.generateDetailedEventMessage(events, handlers, callback, done);
        });
    },

    "AMAZON.NoIntent": function() {
        "use strict";

        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    "AMAZON.HelpIntent": function() {
        "use strict";

        this.emit(":ask", this.t("HELP_TEXT"), this.t("HELP_TEXT_REPROMPT"));
    },

    "AMAZON.CancelIntent": function() {
        "use strict";

        this.emit(":tell", this.t("CANCEL_RESPONSE"));
    },

    "AMAZON.StopIntent": function() {
        "use strict";

        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    "LaunchRequest": function () {
        "use strict";

        this.emit(":ask", this.t("LAUNCH_TEXT"), this.t("LAUNCH_TEXT_REPROMPT"));
    },

    "WhatsOnIntent": function (callback, done) {
        "use strict";

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
