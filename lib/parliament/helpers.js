"use strict";

const rp = require("request-promise");
const moment = require("moment");

// Add String prototypes
require("./helpers/string_prototypes")();

/**
 * Alexa Skill Helpers
 */
module.exports = {
    /**
     * Internal states available within our skill.
     *
     * @type {object}
     *
     * @example const states = require("./parliament/helpers").states;
     */
    states: {
        WHATS_ON: "_WHATS_ON"
    },

    /**
     * Log an intent name - useful for debugging and assessing applicaion flow.
     *
     * @param {string} name the name of an intent
     *
     * @example
     * const helpers = require("./parliament/helpers");
     * helpers.logHandler("Intent Name");
     *
     * @function
     */
    logHandler: function (name) {
        console.log("Intent: " + name);
    },

    /**
     * Given a set of options, make a network request for events. Then send an object representing the events to our
     * callback.
     *
     * @param {{uri: string}} uri_options a request-promise options object
     * @param {function} callback method to be called when we have finished our network requests
     *
     * @see getCalendarUriOptions
     *
     * @example
     * const helpers = require("./lib/parliament/helpers");
     * let uri_options = helpers.getCalendarUriOptions();
     * let callback = function(events) { console.log("Got events: " + events); };
     * helpers.getEvents(uri_options, callback);
     *
     * @function
     */
    getEvents: function (uri_options, callback) {
        rp(uri_options)
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
                        event.start_time = event_data['StartTime']
                    }

                    if(event_data['EndTime'].length > 0){
                        event.end_time = event_data['EndTime']
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
                console.log("E: WhatsOnIntent Error: " + err.name ? err.name : "");
                console.log(err);

                if(err.name && err.name === "RequestError" && callback) {
                    callback("REQUEST_ERROR");
                } else if (callback) {
                    callback(null);
                }
            });
    },

    /**
     * Given an alexa-sdk event's request, get the house slot, if it is present.
     *
     * This method is used to get the name of a specific house that a user has requested events for.
     *
     * @example
     * // With the sample utterance 'Alexa, ask Parliament what's on at the House of Commons'
     * // This method should return 'commons' when run inside of the WhatsOnIntent
     * const helpers = require("./lib/parliament/helpers");
     * let houseOfInterest = helpers.getHouseIntentDate(this.event.request.intent);
     *
     * @param {object} intent an alexa-sdk intent object
     * @returns {(string|null)} either the intent value or null
     *
     * @function
     */
    getHouseIntentData: function (intent) {
        let houseDataFilled = intent && intent.slots && intent.slots.house && intent.slots.house.value;

        return houseDataFilled ? intent.slots.house.value : null;
    },

    /**
     * Build a request-promise uri options object pointing to the parliament calendar API, asking for events for today.
     * If a house is passed, we will limit the events returned to that house.
     *
     * @param {string=} houseOfInterest a specific house we would like to build a URL for
     * @returns {{uri: string}} a request-promise uri options object
     *
     * @function
     */
    getCalendarUriOptions: function (houseOfInterest) {
        // Format the calendar URL
        let date_string = moment().format("YYYY-MM-DD");
        // let date_string = "2017-02-22";
        let uri_options = {
            uri: "http://service.calendar.parliament.uk/calendar/events/list.json?startdate=" + date_string + "&enddate=" + date_string
        };

        if (houseOfInterest) {
            uri_options.uri = uri_options.uri + "&house=" + houseOfInterest;
        }

        return uri_options;
    },

    generateEventMessage: function (events, handlers, callback, done) {
        if (events === "REQUEST_ERROR") {
            handlers.emit(":tell", handlers.t(events));

            if (callback) {
                callback(done);
            }

            return;
        } else if (events === null) {
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

        let houseOfInterest = handlers.attributes.houseOfInterest;

        let message = [];

        if (has_events) {
            if (houseOfInterest) {
                let eventsOfInterest = events[houseOfInterest];

                if (events.count === 1) {
                    message.push(handlers.t("THERE_IS"));
                    message.push(eventsOfInterest.count);
                    message.push(handlers.t("EVENT"));
                } else {
                    message.push(handlers.t("THERE_ARE"));
                    message.push(eventsOfInterest.count);
                    message.push(handlers.t("EVENTS"));
                }

                message.push(handlers.t("ON_AT"));
                message.push(handlers.t("THE_"+houseOfInterest.toUpperCase()));
                message.push(handlers.t("TODAY") + ".");
            } else {
                message = message.concat(this.thereIsAreHelper(events.count, handlers, function(){
                    return [ events.count ];
                }));

                message.push(handlers.t("ON_AT"));
                message.push(handlers.t("PARLIAMENT"));
                message.push(handlers.t("TODAY") + ".");

                if (has_commons_events && has_lords_events) {
                    message.push(events.commons.count);
                    message.push(handlers.t("IN").toProperCase());
                    message.push(handlers.t("THE_COMMONS"));

                    message.push(handlers.t("AND"));
                    message.push(events.lords.count);
                    message.push(handlers.t("IN"));
                    message.push(handlers.t("THE_LORDS") + ".");
                } else if (has_commons_events) {
                    if (events.count === 1) {
                        message.push(handlers.t("IT_IS").toCapLetter());
                        message.push(handlers.t("IN"));
                        message.push(handlers.t("THE_COMMONS") + ".");
                    } else {
                        message.push(handlers.t("THEY_ARE"));
                        message.push(handlers.t("IN"));
                        message.push(handlers.t("THE_COMMONS") + ".");
                    }
                } else {
                    if (events.count === 1) {
                        message.push(handlers.t("IT_IS"));
                        message.push(handlers.t("IN"));
                        message.push(handlers.t("THE_LORDS") + ".");
                    } else {
                        message.push(handlers.t("THEY_ARE"));
                        message.push(handlers.t("IN"));
                        message.push(handlers.t("THE_LORDS") + ".");
                    }
                }
            }

            let spoken_message = message.concat([handlers.t("HEAR_MORE")]);

            handlers.emit(
                ":askWithCard",
                spoken_message.join(" "),
                handlers.t("HEAR_MORE"),
                handlers.t("WHATS_ON_CARD_TITLE"),
                message.join(" ")
            );
        } else {
            message.push(handlers.t("NO_EVENTS"));
            message.push(handlers.t("ON_AT"));

            if (houseOfInterest) {
                message.push(handlers.t("THE_"+houseOfInterest.toUpperCase()));
            } else {
                message.push(handlers.t("PARLIAMENT"));
            }
            message.push(handlers.t("TODAY") + ".");

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
    },

    generateDetailedEventMessage: function (events, handlers, callback, done) {
        if (events === "REQUEST_ERROR") {
            handlers.emit(":tell", handlers.t(events));

            if (callback) {
                callback(done);
            }

            return;
        } else if (events === null) {
            handlers.emit(":tell", handlers.t("ERROR"));

            if (callback) {
                callback(done);
            }

            return;
        }

        let message = [];

        let houseOfInterest = handlers.attributes.houseOfInterest;

        // https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference#prosody
        if (houseOfInterest) {
            // Do something with: events[houseOfInterest]
            message = message.concat(this.speakEvents(events[houseOfInterest], handlers));
        } else {
            message.push(handlers.t("IN"));
            message.push(handlers.t("THE_COMMONS"));

            let commons_events = this.speakEvents(events.commons, handlers);

            message = message.concat(commons_events);
            message.push("<break strength=\"x-strong\" />")

            message.push(handlers.t("IN"));
            message.push(handlers.t("THE_LORDS"));

            let lords_events = this.speakEvents(events.lords, handlers);

            message = message.concat(lords_events);
        }

        message.push("<break strength=\"x-strong\" />")
        message.push(handlers.t("THATS_ALL"));

        let message_string = message.join(" ");
        message_string = message_string.replace(/[\n\r]/g, "");

        handlers.emit(
            ":tell",
            message_string
        );

        if (callback) {
            callback(done);
        }
    },

    speakEvents: function (house, handlers) {
        let messages = [];

        let venueOrder = [
            "Main Chamber",
            "Westminster Hall",
            "General Committees",
            "Grand Committees",
            "Select & Joint Committees"
        ];

        if( house.count === 0 ) {
            messages.push(handlers.t("NO_EVENTS"));
        } else {
            let i;
            for (i = 0; i < Object.keys(house.venues).length; i += 1) {
                let venueString = venueOrder[i];

                let currentVenue = house.venues[venueString];

                if (currentVenue) {
                    messages = messages.concat(this.thereIsAreHelper(currentVenue.count, handlers, function(){
                        return [ currentVenue.count, venueString ];
                    }));

                    let i2;
                    for (i2 = 0; i2 < currentVenue.events.length; i2 += 1) {
                        let currentEvent = currentVenue.events[i2];

                        let time;
                        let title = currentEvent.title;
                        let description;

                        if (currentEvent.start_time && currentEvent.end_time) {
                            time = [handlers.t("FROM"), currentEvent.start_time, handlers.t("TILL"), currentEvent.end_time, "- "].join(" ");
                        } else if (currentEvent.start_time) {
                            time = [handlers.t("STARTING_AT"), currentEvent.start_time, ",", ""].join(" ");
                        } else {
                            time = "";
                        }

                        if (currentEvent.description) {
                            description = currentEvent.description;
                        } else {
                            description = "<break strength=\"strong\" />";
                        }

                        messages.push("<p><s><prosody pitch=\"low\"> " + time + title + " </prosody></s>" + description + "</p>");
                    }

                    messages.push("<break strength=\"strong\" />");
                }
            }
        }

        return messages;
    },

    thereIsAreHelper: function(count, handlers, block) {
        let messages = [];

        if (count === 1) {
            messages.push(handlers.t("THERE_IS"));
            messages = messages.concat(block());
            messages.push(handlers.t("EVENT"));
        } else {
            messages.push(handlers.t("THERE_ARE"));
            messages = messages.concat(block());
            messages.push(handlers.t("EVENTS"));
        }

        return messages;
    }
};