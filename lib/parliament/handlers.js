const rp = require("request-promise");
const cheerio = require("cheerio");

// An object that holds our event data. Will eventually be in the format:
// {
//     count: 1,
//     commonts: {
//         count: 1,
//         venues: [
//             {
//                 name: 'Main Chamber',
//                 count: 1,
//                 events: [
//                     {
//                         title: 'Oral Questions',
//                         description: 'Chancellor of the Exchequer, including Topical Questions'
//                         time: '2:30pm'
//                     }
//                 ]
//             }
//         ]
//     },
//     lords: {
//         count: 0,
//         venues: []
//     }
// }
let global_events = {};

module.exports = {
    // The main What's On intent
    "WhatsOnIntent": function (callback, done) {
        "use strict";

        let commons_options = {
            uri: "http://calendar.parliament.uk/calendar/Commons/All/2017/4/18/Daily"
        };

        let lords_options = {
            uri: "http://calendar.parliament.uk/calendar/Lords/All/2017/4/27/Daily"
        };

        let handlers = this;

        global_events = {
            count: 0,
            commons: {},
            lords: {}
        };

        let generate_message = function () {
            let events = global_events;
            events.count = events.commons.count + events.lords.count;

            let has_events = (events.count > 0);
            let has_commons_events = (events.commons.count > 0);
            let has_lords_events = (events.lords.count > 0);

            let message = [];

            if (has_events) {
                if (events.count === 1) {
                    message.push(handlers.t("THERE_IS"));
                    message.push(events.count);
                    message.push(handlers.t("EVENT"));
                } else {
                    message.push(handlers.t("THERE_ARE"));
                    message.push(events.count);
                    message.push(handlers.t("EVENTS"));
                }
                message.push(handlers.t("AT_PARLIAMENT_TODAY"));

                if (has_commons_events && has_lords_events) {
                    message.push(events.commons.count);
                    message.push(handlers.t("IN_THE_COMMONS"));

                    if (events.commons.starts !== null) {
                        message.push(handlers.t("STARTING_AT"));
                        message.push(events.commons.starts);
                    }

                    message.push(handlers.t("AND"));
                    message.push(events.lords.count);
                    message.push(handlers.t("IN_THE_LORDS"));

                    if (events.lords.starts !== null) {
                        message.push(handlers.t("STARTING_AT"));
                        message.push(events.lords.starts);
                    }
                } else if (has_commons_events) {
                    if (events.count === 1) {
                        message.push(handlers.t("IT_IS"));
                        message.push(handlers.t("IN_THE_COMMONS"));
                    } else {
                        message.push(handlers.t("THEY_ARE"));
                        message.push(handlers.t("IN_THE_COMMONS"));
                    }
                } else {
                    if (events.count === 1) {
                        message.push(handlers.t("IT_IS"));
                        message.push(handlers.t("IN_THE_LORDS"));
                    } else {
                        message.push(handlers.t("THEY_ARE"));
                        message.push(handlers.t("IN_THE_LORDS"));
                    }
                }

                message.push(handlers.t("HEAR_MORE"));

                handlers.emit(
                    ":askWithCard",
                    message.join(" "),
                    handlers.t("HEAR_MORE"),
                    handlers.t("WHATS_ON_CARD_TITLE"),
                    message.join(" ")
                );
            } else {
                message.push(handlers.t("NO_EVENTS"));

                handlers.emit(
                    ":tellWithCard",
                    message.join(" "),
                    handlers.t("WHATS_ON_CARD_TITLE"),
                    message.join(" ")
                );
            }

            if (callback) {
                callback(done);
            }
        };

        let callback_count = 2;
        let events_callback = function (house, events) {
            callback_count -= 1;

            // Save the house's events
            global_events[house] = events;

            if (0 === callback_count) {
                // Generate our message
                generate_message();
            }
        };

        let get_events_for = function (house, rp_options, callback) {
            rp(rp_options)
                .then(function (body) {
                    let $ = cheerio.load(body);
                    let events = {
                        count: 0,
                        starts: null,
                        venues: []
                    };

                    // Iterate over each of the venues
                    $("#results-container .tab-content .panel").each(function (i, elem) {
                        let panel_title = $(this).children(".parl-calendar-eventgrouping.panel-heading").children(".parl-calendar-eventgrouping-title").text();

                        let no_content_message_present = ($(this).children(".panel-body").children("p.parl-calendar-event-no-results") > 0);

                        if(!no_content_message_present) {
                            let rows = $(this).children(".panel-body").children().children("table").children("tr");

                            events.count += rows.length;

                            if(rows.length > 0) {
                                events.venues.push({
                                    name: panel_title,
                                    count: rows.length,
                                    events: []
                                });
                            }

                            $(rows).each(function(i,elem) {
                                let event = {};

                                let time_column = $(this).children("td.col-xs-3").children("p.parl-calendar-event-time").text().trim();

                                if(time_column){
                                    event.time = time_column;
                                }

                                let content_column = $(this).children("td.col-xs-9")
                                event.title = $(content_column).children("p.parl-calendar-event-title").text().trim().replace(/(\r\n|\n|\r)/gm,"");
                                event.description = $(content_column).children("p.parl-calendar-event-description").text().trim().replace(/(\r\n|\n|\r|\t)/gm,"");

                                events.venues[events.venues.length-1].events.push(event);
                            });
                        }

                    });

                    if(callback) {
                        callback(house, events);
                    }
                }).catch(function(err) {
                    console.log(err)

                    if(callback) {
                        callback(house, null)
                    }
                });
        };

        get_events_for("commons", commons_options, events_callback);
        get_events_for("lords", lords_options, events_callback);
    },

    "AMAZON.YesIntent": function() {
        this.emit(":tell", this.t("YES_RESPONSE"));
    },

    "AMAZON.NoIntent": function() {
        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    "AMAZON.HelpIntent": function() {
        this.emit(":ask", this.t("HELP_TEXT"), this.t("HELP_TEXT_REPROMPT"));
    },

    "LaunchRequest": function () {
        this.emit("WhatsOnIntent");
    }
};
