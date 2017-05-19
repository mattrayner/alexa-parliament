const rp = require("request-promise");
const moment = require("moment");

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

    "AMAZON.YesIntent": function() {
        this.emit(":tell", this.t("YES_RESPONSE"));
    },

    "AMAZON.NoIntent": function() {
        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    "AMAZON.HelpIntent": function() {
        this.emit(":ask", this.t("HELP_TEXT"), this.t("HELP_TEXT_REPROMPT"));
    },

    "AMAZON.CancelIntent": function() {
        this.emit(":tell", this.t("CANCEL_RESPONSE"));
    },

    "AMAZON.StopIntent": function() {
        this.emit(":tell", this.t("NO_RESPONSE"));
    },

    "LaunchRequest": function () {
        this.emit("WhatsOnIntent");
    },

    "WhatsOnIntent": function (callback, done) {
        let intent_data = getHouseData(this.intent);
        let date_string = moment().format("YYYY-MM-DD");
        let uri_options = {
            uri: "http://service.calendar.parliament.uk/calendar/events/list.json?startdate=" + date_string + "&enddate=" + date_string
        };

        let handlers = this;

        global_events = {
            count: 0,
            commons: {},
            lords: {}
        };

        let generate_message = function () {
            let events = global_events;

            if(events == null) {
                handlers.emit(":tell", handlers.t("ERROR"));

                if (callback) {
                    callback(done);
                }

                return;
            }

            events.count = events['commons'].count + events['lords'].count;

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

        let events_callback = function (events) {
            global_events = events;

            generate_message();
        };

        let get_events_for = function (rp_options, callback) {
            rp(rp_options)
                .then(function (body) {
                    let data = JSON.parse(body);

                    let events = {
                        commons: {
                            count: 0,
                            starts: null,
                            venues: []
                        },
                        lords: {
                            count: 0,
                            starts: null,
                            venues: []
                        }
                    };

                    data.forEach(function(event_data) {
                        let event = {};

                        event.title = event_data['Category'];
                        event.description = event_data['Description'];

                        if(event_data['StartTime'].length > 0){
                            event.time = event_data['StartTime']
                        }

                        let house_name = event_data['House'].toLowerCase();
                        let venue = event_data['Type'];

                        if( events[house_name].venues[venue] == null ) {
                            events[house_name].venues[venue] = {
                                name: venue,
                                count: 0,
                                events: []
                            };
                        }

                        events[house_name].venues[venue].count = events[house_name].venues[venue].count + 1;
                        events[house_name].count = events[house_name].count + 1;

                        let event_count = events[house_name].venues[venue].events.length;
                        events[house_name].venues[venue].events[event_count] = event;
                    });

                    if(callback) {
                        callback(events);
                    }
                }).catch(function(err) {
                    console.log("E: WhatsOnIntent Error:");
                    console.log(err);

                    if(callback) {
                        callback(null);
                    }
                });
        };

        get_events_for(uri_options, events_callback);
    }
};

function getHouseData(intent) {
    "use strict";
    let houseDataFilled = intent && intent.slots && intent.slots.HOUSE && intent.slots.HOUSE.value;

    return houseDataFilled ? intent.slots.HOUSE.value : null
};
