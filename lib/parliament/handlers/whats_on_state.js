"use strict";

const helpers = require('../helpers');
const constants = require('../constants');
const moment = require("moment");
const sanitizeHtml = require('sanitize-html');
const JSONClient = require("../clients/JSONClient");
const validator = require('ssml-validator');

const CALENDAR_ENDPOONT = 'service.calendar.parliament.uk';
const NONSITTING_CATEGORIES = [
    'recess',
    'dissolution'
];
// The order in which we speak events
const VENUE_ORDER = [
    'Main Chamber',
    'Westminster Hall',
    'General Committees',
    'Grand Committees',
    'Select & Joint Committees'
];

/**
 * Alexa WHATS_ON state intent handlers
 */
module.exports = {
    /*
     *  All Intent Handlers for state : WHATS_ON
     */
    /**
     * AMAZON.YesIntent handler - stops the session
     *
     * @param callback
     * @param done
     *
     * @function
     */
    "AMAZON.YesIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = constants.START_STATE;

        let houseOfInterest = this.attributes.houseOfInterest;
        let speakFututeEvents = this.attributes.speakFutureEvents;

        let eventMessage = '';

        if(speakFututeEvents) {
            this.attributes.speakFutureEvents = false;

            let futureEvents;
            if(typeof this.attributes.futureEvents === 'string') {
                futureEvents = JSON.parse(this.attributes.futureEvents);
            } else {
                futureEvents = this.attributes.futureEvents;
            }

            let housesWithEvents = [];
            if(futureEvents.events.commons.count > 0)
                housesWithEvents.push('commons');

            if(futureEvents.events.lords.count > 0)
                housesWithEvents.push('lords');

            eventMessage = `On <say-as interpret-as="date" format="dm">${moment(futureEvents.date).format('DD-MM')}</say-as>.`;

            let houseArray = housesWithEvents;
            if(houseOfInterest)
                houseArray = [houseOfInterest];

            houseArray.forEach((house) => {
                eventMessage += `<break time="0.5s" /> In the house of ${house}, ${helpers.generateVenueEventList(VENUE_ORDER, futureEvents.events[house].venues, true)}`
            });

            eventMessage += '<break time="0.5s" /> That is all.';

            this.attributes.futureEvents = null;
        } else if(this.attributes.events) {
            let events = JSON.parse(JSON.stringify(this.attributes.events));
            if(!events.commons || !events.lords) {
                return this.emit(':tell', 'Something went wrong. Please try again.')
            }

            let housesWithEvents = [];
            if(events.commons.count > 0)
                housesWithEvents.push('commons');

            if(events.lords.count > 0)
                housesWithEvents.push('lords');

            housesWithEvents.forEach((house) => {
                eventMessage += `In the house of ${house}, ${helpers.generateVenueEventList(VENUE_ORDER, events[house].venues)}<break time="0.5s" /> `
            });

            eventMessage += 'That is all.';

            this.attributes.events = null;
        }

        let ssml = eventMessage.replace(/ & /g, ` and `);
        let validated_ssml = validator.correct(ssml);
        this.emit(':tell', validated_ssml);
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

        this.handler.state = constants.states.START_MODE;

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

        this.handler.state = constants.states.START_MODE;

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

        this.handler.state = constants.states.START_MODE;

        this.emit(":tell", this.t("NO_RESPONSE"));
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
    "WhatsOnIntent": function () {
        helpers.logHandler(this.name);

        let houseOfInterest = null;

        if(this.attributes.haveVerifiedHouse) {
            houseOfInterest = this.attributes.verifiedHouse;
        } else {
            try {
                houseOfInterest = helpers.getHouseIntentData(this.event.request.intent);
            } catch(err) {
                console.error(err);

                if(err.intent) {
                    return this.emit(':ask', `I heard, ${err.intent}. Did you mean, 'commons', 'lords', or, 'both'?`, "Did you mean, 'commons', 'lords', or, 'both'?")
                } else {
                    return this.emit(':ask', `Did you mean, 'commons', 'lords', or, 'both'?`, "Did you mean, 'commons', 'lords', or, 'both'?")
                }
            }
        }

        this.attributes.houseOfInterest = houseOfInterest;

        const jsonClient = new JSONClient(CALENDAR_ENDPOONT, false);
        let calendarDataPath = '/calendar/events/list.json?date=30days';
        if(houseOfInterest) { calendarDataPath += `&house=${houseOfInterest}`; }
        let jsonRequest = jsonClient.getJSON(calendarDataPath);

        jsonRequest.then((jsonResponse) => {
            switch(jsonResponse.statusCode) {
                case 200:
                    let response = jsonResponse.json;
                    let today = moment().format("YYYY-MM-DD");

                    let dataObject = {
                        count: 0,
                        nonsitting: {
                            commons: {
                                end: null,
                                description: null,
                                recess: false,
                                dissolution: false,
                                other: false
                            },
                            lords: {
                                end: null,
                                description: null,
                                recess: false,
                                dissolution: false,
                                other: false
                            }
                        },
                        events: {
                            commons: {
                                count: 0,
                                starts: null,
                                venues: {}
                            },
                            lords: {
                                count: 0,
                                starts: null,
                                venues: {}
                            }
                        },
                        future: {
                            date: null,
                            count: 0,
                            events: {
                                commons: {
                                    count: 0,
                                    starts: null,
                                    venues: {}
                                },
                                lords: {
                                    count: 0,
                                    starts: null,
                                    venues: {}
                                }
                            }
                        }
                    };

                    let messageObject = {
                        commons: {
                            nonsitting: [],
                            nonsittingReason: null,
                            noEvents: [],
                            events: []
                        },
                        lords: {
                            nonsitting: [],
                            nonsittingReason: null,
                            noEvents: [],
                            events: []
                        }
                    };

                    // Find out if there is an event today
                    let lastEvent = response[response.length-1];
                    if(lastEvent) {
                        let lastEventStart = lastEvent['StartDate'];
                        lastEventStart = lastEventStart.split("T")[0];

                        if(lastEventStart === today) {
                            dataObject.future = null; // No need for future events
                        } else {
                            dataObject.future.date = lastEventStart; // Next event's date
                        }
                    }

                    let targetDate = (dataObject.future && dataObject.future.date) || today;

                    response.forEach((eventData) => {
                        if(eventData.StartDate.split('T')[0] !== targetDate)
                            return;

                        let event = {};
                        event.title = eventData.Category;
                        event.description = eventData.Description;
                        event.startTime = eventData.StartTime || null;
                        event.endTime = eventData.EndTime || null;
                        event.startDate = eventData.StartDate.split('T')[0] || null;

                        let houseName = eventData.House.toLowerCase();
                        let venue = eventData.Type;

                        // Increase our event count;
                        dataObject.future ? dataObject.future.count++ : dataObject.count++;
                        let targetEvents = dataObject.future ? dataObject.future.events : dataObject.events;

                        let venueObject = targetEvents[houseName].venues[venue] || {
                            name: venue,
                            count: 0,
                            events: []
                        };

                        if(!targetEvents[houseName].venues[venue])
                            targetEvents[houseName].venues[venue] = venueObject;

                        targetEvents[houseName].count = targetEvents[houseName].count + 1;
                        venueObject.count = venueObject.count + 1;
                        venueObject.events[venueObject.events.length] = event;
                    });

                    // If there are no current or future events, remove the future object
                    if(dataObject.count === 0 && dataObject.future.count === 0)
                        dataObject.future = null;

                    // Check if we are nonsitting
                    let nonsittingJsonRequest = jsonClient.getJSON('/calendar/events/nonsitting.json?date=today');

                    // Got data for nonsitting days
                    nonsittingJsonRequest.then((nonsittingJsonResponse) => {
                            if(!nonsittingJsonResponse.json)
                                return;


                            nonsittingJsonResponse.json.forEach((nonsittingEntry) => {
                                let category = 'other';
                                let nonsittingHouse = nonsittingEntry.House.toLowerCase();

                                NONSITTING_CATEGORIES.forEach((nonsittingCategory) => {
                                    if(nonsittingEntry.Category.toLowerCase().indexOf(nonsittingCategory) > -1)
                                        category = nonsittingCategory;
                                });

                                // Either set the nonsitting category, or fallback to the default category
                                dataObject.nonsitting[nonsittingHouse][category] = true;
                                dataObject.nonsitting[nonsittingHouse].description = nonsittingEntry.Description || null;

                                // Split the EndDate from '2017-07-31T00:00:00' to '2017-07-31' or null
                                let nonsittingEnd = (nonsittingEntry.EndDate && nonsittingEntry.EndDate.split('T')[0]) || null;
                                dataObject.nonsitting[nonsittingHouse].end = nonsittingEnd;
                            });
                        })
                        .catch((error) => { // Catch an error
                            console.error('Error getting recess JSON:');
                            console.error(error)
                        })
                        .then(() => { // Always run this
                            // Populate our message struct so we can decide what to say to the user.
                            let houses = ['commons', 'lords'];
                            houses.forEach((house) => {
                                let houseEvents = dataObject.events[house];

                                // Non-sitting messages
                                let nonsittingMessageArray = [];
                                let nonsittingHouse = dataObject.nonsitting[house];
                                if(nonsittingHouse.recess || nonsittingHouse.dissolution || nonsittingHouse.other) {
                                    let recessMessage = nonsittingHouse.description;
                                    let recessEndMessage;

                                    /**
                                     * Decide what messaging we should use if a description is not defined.
                                     * ('Christmas Recess' is stored as a description)
                                     */
                                    if(!recessMessage) {
                                        if(nonsittingHouse.recess)
                                            recessMessage = 'in Recess';
                                        if(nonsittingHouse.dissolution)
                                            recessMessage = 'in Dissolution';
                                        if(nonsittingHouse.other)
                                            recessMessage = 'not sitting';
                                    }

                                    messageObject[house].nonsittingReason = recessMessage;

                                    recessEndMessage = nonsittingHouse.end ? ` until ${nonsittingHouse.end}` : '';

                                    nonsittingMessageArray = [`The House of ${house.toProperCase()} is currently ${recessMessage}${recessEndMessage}`];
                                }
                                messageObject[house].nonsitting = nonsittingMessageArray;

                                // Events messages
                                let eventsMessageArray = [];
                                // No Events
                                if(houseEvents.count <= 0) {
                                    // Create the no events message
                                    let noEventsMessage = [];
                                    // Is this house, not sitting?
                                    if(nonsittingMessageArray.length > 0) {
                                        noEventsMessage.push('and there are no events today.');
                                    } else {
                                        noEventsMessage.push(`There are no events on at the House of ${house.toProperCase()} today.`);
                                    }
                                    messageObject[house].noEvents = noEventsMessage;

                                    // Future Events
                                    if(dataObject.future && dataObject.future.events && dataObject.future.events[house] && dataObject.future.events[house].count > 0) {
                                        eventsMessageArray.push(`The next event will be on ${moment(dataObject.future.events[house].date).format('dddd')} <say-as interpret-as="date" format="ymd">${dataObject.future.events[house].date}</say-as>.`);

                                        if(dataObject.future.events[house].count === 1) {
                                            eventsMessageArray.push(`On <say-as interpret-as="date" format="ymd">${dataObject.future.date}</say-as>,`);
                                            eventsMessageArray.push(`${helpers.generateVenueEventList(VENUE_ORDER, dataObject.future.events[house].venues)}.`);
                                        }
                                    }
                                } else { // Current Events
                                    // Give summary
                                    let isAre = (houseEvents.count === 1) ? 'is' : 'are';
                                    let eventEvents = (houseEvents.count === 1) ? 'event' : 'events';

                                    // Is this house, not sitting?
                                    if(nonsittingMessageArray.length > 0) {
                                        eventsMessageArray.push(`and there ${isAre} ${houseEvents.count} ${eventEvents} today.`);
                                    } else {
                                        eventsMessageArray.push(`There ${isAre} ${houseEvents.count} ${eventEvents} on at the House of ${house.toProperCase()} today.`);
                                    }
                                }
                                messageObject[house].events = eventsMessageArray;
                            });

                            // Generate our message output
                            let messageArray = [];
                            let repromptMessage = null;
                            let cardArray = [];
                            let houseOfInterest = helpers.getHouseIntentData(this.event.request.intent);

                            // Asked for both houses
                            if(!houseOfInterest) {
                                // Non sitting message
                                if(messageObject.commons.nonsitting.length > 0 && messageObject.lords.nonsitting.length > 0) {
                                    let nonsittingReason = 'not sitting';

                                    if(messageObject.commons.nonsittingReason.toLowerCase() === messageObject.lords.nonsittingReason.toLowerCase()) {
                                        // Starts with 'in ' i.e. 'in Recess'
                                        if(messageObject.commons.nonsittingReason.toLowerCase().match(/^in /)){
                                            nonsittingReason = messageObject.commons.nonsittingReason;
                                        } else {
                                            nonsittingReason = `in ${messageObject.commons.nonsittingReason.toProperCase()}`;
                                        }
                                    }

                                    let nonsittingString = `The Houses of Parliament are currently ${nonsittingReason}`;
                                    if(dataObject.count === 0) {
                                        nonsittingString += ', and there are no events today.';
                                        cardArray = messageArray;
                                    } else {
                                        nonsittingString += '.'
                                    }
                                    messageArray.push(nonsittingString);
                                }

                                // No events
                                if(dataObject.count === 0) {
                                    if(messageArray.length === 0) // No non sitting message set
                                        messageArray.push('There are no events on at the Houses of Parliament today.');

                                    // Future events
                                    if(dataObject.future) {
                                        let messageString = `The next event will be on ${moment(dataObject.future.date).format('dddd')} <say-as interpret-as="date" format="dm">${moment(dataObject.future.date).format('DD-MM')}</say-as>`;

                                        if(dataObject.future.count === 1) {
                                            // Which house has the future event?
                                            let futureHouseWithEvents = (dataObject.future.events.commons.count === 1) ? 'commons' : 'lords';
                                            messageString += `, in the House of ${futureHouseWithEvents.toProperCase()}.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">${moment(dataObject.future.date).format('DD-MM')}</say-as>, ${helpers.generateVenueEventList(VENUE_ORDER, dataObject.future.events[futureHouseWithEvents].venues, true)}`;
                                        } else {
                                            repromptMessage = 'Would you like to hear more?';
                                            messageString += `. ${repromptMessage}`;
                                        }

                                        messageArray.push(messageString);
                                    }
                                } else { // Current events
                                    // Give summary
                                    let isAre = (dataObject.count === 1) ? 'is' : 'are';
                                    let eventEvents = (dataObject.count === 1) ? 'event,' : 'events';

                                    // Is this house, not sitting?
                                    if(messageArray.length > 0) {
                                        messageArray.push(`There ${isAre} ${dataObject.count} ${eventEvents} today.`);
                                    } else {
                                        messageArray.push(`There ${isAre} ${dataObject.count} ${eventEvents} on at the Houses of Parliament today.`);
                                    }

                                    // Are we giving the details of a single event?
                                    if(dataObject.count  === 1) {
                                        let houseWithEvents = (dataObject.events.commons.count === 1) ? 'commons' : 'lords';

                                        messageArray.push(`It is in the House of ${houseWithEvents.toProperCase()}. In the house of ${houseWithEvents.toProperCase()}. ${messageObject[houseWithEvents].events}. That is all.`);
                                    } else {
                                        if(dataObject.count === dataObject.events.commons.count) {
                                            messageArray.push('They are all in the House of Commons.');
                                        } else if(dataObject.count === dataObject.events.lords.count) {
                                            messageArray.push('They are all in the House of Lords.');
                                        } else {
                                            messageArray.push(`${dataObject.events.commons.count} in the House of Commons and ${dataObject.events.lords.count} in the House of Lords.`)
                                        }
                                        cardArray.push(messageArray.join(' '));
                                        repromptMessage = 'Would you like to hear more?';
                                        messageArray.push(repromptMessage);
                                    }
                                }

                                if(repromptMessage && dataObject.future) {
                                    this.attributes.speakFutureEvents = true;
                                    this.attributes.futureEvents = dataObject.future;
                                } else if(repromptMessage) {
                                    this.attributes.events = dataObject.events;
                                }
                            } else {
                                if(messageObject[houseOfInterest].nonsitting.length > 0) {
                                    let nonsittingReason = 'not sitting';

                                    if(messageObject[houseOfInterest].nonsittingReason) {
                                        if(messageObject[houseOfInterest].nonsittingReason.match(/^in /)){
                                            nonsittingReason = messageObject[houseOfInterest].nonsittingReason;
                                        } else {
                                            nonsittingReason = `in ${messageObject[houseOfInterest].nonsittingReason.toProperCase()}`;
                                        }
                                    }


                                    let nonsittingString = `The House of ${houseOfInterest.toProperCase()} is currently ${nonsittingReason}`;
                                    if(dataObject.count === 0) {
                                        nonsittingString += ', and there are no events today.';
                                        cardArray = messageArray;
                                    } else {
                                        nonsittingString += '.'
                                    }
                                    messageArray.push(nonsittingString);
                                }

                                // No events
                                if(dataObject.count === 0) {
                                    if(messageArray.length === 0) // No non sitting message set
                                        messageArray.push(`There are no events on at the House of ${houseOfInterest.toProperCase()} today.`);

                                    // Future events
                                    if(dataObject.future && dataObject.future.events[houseOfInterest].count > 0) {
                                        let firstVenue = Object.keys(dataObject.future.events[houseOfInterest].venues)[0];
                                        let messageString = `The next event will be on ${moment(dataObject.future.events[houseOfInterest].venues[firstVenue].events[0].startDate).format('dddd')} <say-as interpret-as="date" format="dm">${moment(dataObject.future.events[houseOfInterest].venues[firstVenue].events[0].startDate).format('DD-MM')}</say-as>`;

                                        if(dataObject.future.events[houseOfInterest].count === 1) {
                                            // Which house has the future event?
                                            messageString += `.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">${moment(dataObject.future.date).format('DD-MM')}</say-as>, ${helpers.generateVenueEventList(VENUE_ORDER, dataObject.future.events[houseOfInterest].venues, true)}`;
                                        } else {
                                            repromptMessage = 'Would you like to hear more?';
                                            messageString += `. ${repromptMessage}`;
                                        }

                                        messageArray.push(messageString);
                                    }
                                } else { // Current events
                                    // Give summary
                                    let isAre = (dataObject.count === 1) ? 'is' : 'are';
                                    let eventEvents = (dataObject.count === 1) ? 'event,' : 'events';

                                    // Is this house, not sitting?
                                    if(messageArray.length > 0) {
                                        messageArray.push(`There ${isAre} ${dataObject.count} ${eventEvents} today.`);
                                    } else {
                                        messageArray.push(`There ${isAre} ${dataObject.count} ${eventEvents} on at the House of ${houseOfInterest.toProperCase()} today.`);
                                    }

                                    // Are we giving the details of a single event?
                                    if(dataObject.count  === 1) {
                                        messageArray.push(`${messageObject[houseWithEvents].events}. That is all.`);
                                    } else {
                                        cardArray.push(messageArray.join(' '));
                                        repromptMessage = 'Would you like to hear more?';
                                        messageArray.push(repromptMessage);
                                    }
                                }

                                if(repromptMessage && dataObject.future) {
                                    this.attributes.speakFutureEvents = true;
                                    this.attributes.futureEvents = dataObject.future;
                                } else if(repromptMessage) {
                                    this.attributes.events = dataObject.events;
                                }
                            }

                            let raw_string = messageArray.join(' ');
                            let ssml = raw_string.replace(/ & /g, ` and `);
                            let validated_ssml = validator.correct(ssml);

                            if(repromptMessage && cardArray.length > 0) {
                                this.emit(':askWithCard', validated_ssml, repromptMessage, "What's on at Parliament?", sanitizeHtml(cardArray.join(' '), { allowedTags: [], allowedAttributes: [] }))
                            } else if(repromptMessage) {
                                this.emit(':ask', validated_ssml, repromptMessage);
                            } else if(cardArray.length > 0) {
                                this.emit(':tellWithCard', validated_ssml, "What's on at Parliament?", sanitizeHtml(cardArray.join(' '), { allowedTags: [], allowedAttributes: [] }))
                            } else {
                                this.emit(':tell', validated_ssml);
                            }
                        })
                        .catch((error) => {
                            console.log('Error:');
                            console.log(error);
                        });

                    break;
                default:
                    console.log("Other error");
                    this.attributes.events = {};
                    return this.emit(':tell', 'Something went wrong, please try again later.');
            }
        });

        jsonRequest.catch((error) => {
            this.attributes.events = {};
            this.emit(":tell", 'Something went wrong, please try again later.');

            console.error(error);
            console.info("Ending getTripleStore()");
        });


    },

    /**
     * HouseIntent - collects a house from the user, and re-calls WhatsOnIntent or re-calls HouseIntent.
     *
     * @function
     */
    "HouseIntent": function () {
        let houseOfInterest = null;

        try {
            houseOfInterest = helpers.getHouseIntentData(this.event.request.intent);

            this.attributes.haveVerifiedHouse = true;
            this.attributes.verifiedHouse = houseOfInterest;
            this.emitWithState('WhatsOnIntent');
        } catch(err) {
            console.error(err);

            if(err.intent) {
                return this.emit(':ask', `I heard, ${err.intent}. Did you mean, 'commons', 'lords', or, 'both'?`, "Did you mean, 'commons', 'lords', or, 'both'?")
            } else {
                return this.emit(':ask', `Did you mean, 'commons', 'lords', or, 'both'?`, "Did you mean, 'commons', 'lords', or, 'both'?")
            }
        }
    },

    /**
     * MyMPIntent - sets the skill state to 'START_MODE' and calls the state-specific intent.
     *
     * @function
     */
    "MyMPIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = constants.states.START_MODE;

        this.emitWithState('MyMPIntent');
    },


    'PlaybackStarted' : function () {
        /*
         * AudioPlayer.PlaybackStarted Directive received.
         * Confirming that requested audio file began playing.
         * Storing details in dynamoDB using attributes.
         */
        console.log("Playback started");
        this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
        this.emit(':responseReady');
    },
    'PlaybackFinished' : function () {
        /*
         * AudioPlayer.PlaybackFinished Directive received.
         * Confirming that audio file completed playing.
         * Storing details in dynamoDB using attributes.
         */
        console.log("Playback finished");
        this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
        this.emit(':responseReady');
    },
    'PlaybackStopped' : function () {
        /*
         * AudioPlayer.PlaybackStopped Directive received.
         * Confirming that audio file stopped playing.
         * Storing details in dynamoDB using attributes.
         */
        console.log("Playback stopped");
        this.callback(null, null);
        //this.context.succeed(true);
    },
    'PlaybackNearlyFinished' : function () {
        console.log("Playback nearly finished");
        // this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
        this.response.audioPlayerPlay('REPLACE_ALL', audioData.url, audioData.url, null, 0);
        this.emit(':responseReady');
    },
    'PlaybackFailed' : function () {
        //  AudioPlayer.PlaybackNearlyFinished Directive received. Logging the error.
        console.log("Playback Failed : %j", this.event.request.error);
        this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
        this.emit(':responseReady');
    },



    /**
     * Unhandled handler - resets the state and stops the session
     *
     * @function
     */
    "Unhandled": function () {
        helpers.logHandler(this.name);

        this.handler.state = constants.states.START_MODE;

        this.emitWithState(this.event.request.intent.name);
    }
};