"use strict";

// Include our helper methods
const helpers = require("../helpers");
const AlexaDeviceAddressClient = require("../../../vendor/amazon/device_address_client/AlexaDeviceAddressClient");
const NtripleClient = require("../clients/NtripleClient");
const audioData = require("../audioData");

const N3Util = require('n3').Util;

const COUNTRY_AND_POST_CODE_PERMISSION = "read::alexa:device:all:address:country_and_postal_code";
const PERMISSIONS = [COUNTRY_AND_POST_CODE_PERMISSION];
const NTRIPLE_ENDPOINT = 'beta.parliament.uk';

/**
 * Alexa null state intent handlers
 */
module.exports = {
    /**
     * AMAZON.YesIntent handler - stops the session
     *
     * @function
     */
    "AMAZON.YesIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":tell", this.t("CANCEL_RESPONSE"));
    },

    /**
     * AMAZON.NoIntent handler - stops the session
     *
     * @function
     */
    "AMAZON.NoIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":tell", this.t("CANCEL_RESPONSE"));
    },

    // /**
    //  * AMAZON.CancelIntent handler - stops the session
    //  *
    //  * @function
    //  */
    // "AMAZON.CancelIntent": function () {
    //     helpers.logHandler(this.name);
    //
    //     this.emit(":tell", this.t("CANCEL_RESPONSE"));
    // },
    //
    // /**
    //  * AMAZON.StopIntent handler - stops the session
    //  *
    //  * @function
    //  */
    // "AMAZON.StopIntent": function () {
    //     helpers.logHandler(this.name);
    //
    //     this.emit(":tell", this.t("CANCEL_RESPONSE"));
    // },

    /**
     * AMAZON.HelpIntent handler - gives a clear message explaining what the skill can 1~do
     *
     * @function
     */
    "AMAZON.HelpIntent": function () {
        helpers.logHandler(this.name);

        this.emit(":ask", this.t("HELP_TEXT"), this.t("HELP_TEXT_REPROMPT"));
    },

    /**
     * LaunchRequest handler - gives a welcome message and explains usage instructions
     *
     * @function
     */
    "LaunchRequest": function () {
        helpers.logHandler(this.name);

        this.emit(":ask", this.t("LAUNCH_TEXT"), this.t("LAUNCH_TEXT_REPROMPT"));
    },

    /**
     * WhatsOnIntent - sets the skill state to 'WHATS_ON' and calls the state-specific intent.
     *
     * @function
     */
    "WhatsOnIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = helpers.states.WHATS_ON;

        this.emitWithState("WhatsOnIntent");
    },

    /**
     * MyMPIntent - tell the user who is their MP
     *
     * @funcion
     */
    "MyMPIntent": function() {
        helpers.logHandler(this.name);
        console.info("Starting getAddressHandler()");

        const consentToken = this.event.context.System.user.permissions.consentToken;

        // If we have not been provided with a consent token, this means that the user has not
        // authorized your skill to access this information. In this case, you should prompt them
        // that you don't have permissions to retrieve their address.
        if(!consentToken) {
            this.emit(":tellWithPermissionCard", this.t('NOTIFY_MISSING_PERMISSIONS'), PERMISSIONS);

            // Lets terminate early since we can't do anything else.
            console.log("User did not give us permissions to access their address.");
            console.info("Ending getAddressHandler()");
            return;
        }

        const deviceId = this.event.context.System.device.deviceId;
        const apiEndpoint = this.event.context.System.apiEndpoint;

        const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
        let deviceAddressRequest = alexaDeviceAddressClient.getCountryAndPostalCode();

        deviceAddressRequest.then((addressResponse) => {
            switch(addressResponse.statusCode) {
                case 200:
                    const address = addressResponse.address;

                    console.log(address);

                    const ADDRESS_MESSAGE = "Got address from AMAZON: " +
                        `${address['countryCode']}, ${address['postalCode']}`;

                    let postcode = address['postalCode'].toUpperCase();

                    const ntripleClient = new NtripleClient(NTRIPLE_ENDPOINT);

                    let uri_postcode = postcode.replace(' ', '%20');
                    // let ssml_postcode = postcode.replace(' ', '').toLowerCase().split('').join('. ');
                    let ssml_postcode = postcode;
                    let ntripleRequest = ntripleClient.getTripleStore(`/postcodes/${uri_postcode}`);

                    ntripleRequest.then((ntripleResponse) => {
                        switch(ntripleResponse.statusCode) {
                            case 200:
                                let object = {
                                    member: null,
                                    constituency: null,
                                    party: null,
                                    incumbency: null
                                };

                                console.log("Parliament response received");

                                if(ntripleResponse.store.size === 0) {
                                    console.log('No triples in store');
                                    return this.emit(':tell', `I can't find an MP for ${ssml_postcode}.`);
                                }

                                let store = ntripleResponse.store;

                                let memberTriple = store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://id.ukpds.org/schema/Person')[0];
                                if(memberTriple) {
                                    let memberNameTriple = store.getTriples(memberTriple.subject, "http://example.com/F31CBD81AD8343898B49DC65743F0BDF", null)[0];
                                    if(memberNameTriple) { object.member = N3Util.getLiteralValue(memberNameTriple.object); }
                                }

                                let partyTriple = store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://id.ukpds.org/schema/Party')[0];
                                if(partyTriple) {
                                    let partyNameTriple = store.getTriples(partyTriple.subject, "http://id.ukpds.org/schema/partyName", null)[0];
                                    if(partyNameTriple) { object.party = N3Util.getLiteralValue(partyNameTriple.object); }
                                }

                                let incumbencyTriple = store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://id.ukpds.org/schema/SeatIncumbency')[0];
                                if(incumbencyTriple) {
                                    let incumbencyStartDateTriple = store.getTriples(incumbencyTriple.subject, "http://id.ukpds.org/schema/incumbencyStartDate", null)[0];
                                    if(incumbencyStartDateTriple) { object.incumbency = N3Util.getLiteralValue(incumbencyStartDateTriple.object); }
                                }

                                let constituencyTriple = store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://id.ukpds.org/schema/ConstituencyGroup');
                                if(constituencyTriple) {
                                    let constituencyNameTriple = store.getTriples(constituencyTriple.subject, "http://id.ukpds.org/schema/constituencyGroupName", null)[0];
                                    if(constituencyNameTriple) { object.constituency = N3Util.getLiteralValue(constituencyNameTriple.object); }
                                }

                                console.log('Triples processed into data');

                                let location = `${ssml_postcode}`;
                                if(object.constituency) { location = object.constituency }

                                if(!object.member) {
                                    return this.emit(':tell', `I can't find an MP for ${location}.`)
                                }

                                let mp_for_string = `The MP for ${location}, is ${object.member}.`;

                                let incumbency_string = '';
                                if(object.incumbency) { incumbency_string = ` was elected on <say-as interpret-as="date" format="ymd">${object.incumbency}</say-as>` }

                                if(!object.party) {
                                    if(object.incumbency) {
                                        return this.emit(':tell', `${mp_for_string} Your MP${incumbency_string}.`)
                                    } else {
                                        return this.emit(':tell', mp_for_string)
                                    }
                                }

                                let party_string = '';
                                if(object.party) { party_string = ` is a member of the ${object.party} party` }

                                if(object.party && object.incumbency) {
                                    return this.emit(':tell', `${mp_for_string} Your MP${party_string}, and${incumbency_string}.`)
                                }

                                this.emit(':tell', `${mp_for_string} Your MP${party_string}.`)

                                break;
                            case 404:
                                console.log("Don't know about that postcode");
                                this.emit(':tell', `I was unable to find any information for ${ssml_postcode}.`);

                                break;
                            default:
                                console.log("Other error");
                                this.emit(":tell", this.t('MP_PROBLEM'));
                        }
                    });

                    ntripleRequest.catch((error) => {
                        this.emit(":tell", 'ERROR');
                        console.error(error);
                        console.info("Ending getTripleStore()");
                    });

                    break;
                case 204:
                    // This likely means that the user didn't have their address set via the companion app.
                    console.log("Successfully requested from the device address API, but no address was returned.");
                    this.emit(":tell", this.t('NO_ADDRESS'));
                    break;
                case 403:
                    console.log("The consent token we had wasn't authorized to access the user's address.");
                    this.emit(":tellWithPermissionCard", this.t('NOTIFY_MISSING_PERMISSIONS'), PERMISSIONS);
                    break;
                default:
                    this.emit(":tell", this.t('LOCATION_FALIURE'));
            }

            console.info("Ending getAddressHandler()");
        });

        deviceAddressRequest.catch((error) => {
            this.emit(":tell", 'ERROR');
            console.error(error);
            console.info("Ending getAddressHandler()");
        });
    },

    'PlayAudio': function () {
        // play the radio
        controller.play.call(this, `Welcome to ${audioData.title}`);
    },

    'ExceptionEncountered': function () {
        console.log("******************* EXCEPTION **********************");
        console.log(JSON.stringify(this.event.request, null, 2));
        this.callback(null, null)
    },

    'AMAZON.NextIntent': function () {
        this.response.speak('This is radio, you have to wait for next track to play.');
        this.emit(':responseReady');
    },
    'AMAZON.PreviousIntent': function () {
        this.response.speak('This is radio, you can not go back in the playlist');
        this.emit(':responseReady');
    },

    'AMAZON.PauseIntent': function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.CancelIntent': function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.StopIntent': function () { controller.stop.call(this) },

    'AMAZON.ResumeIntent': function () { controller.play.call(this, `resuming ${audioData.title}`) },

    'AMAZON.LoopOnIntent': function () { this.emit('AMAZON.StartOverIntent'); },
    'AMAZON.LoopOffIntent': function () { this.emit('AMAZON.StartOverIntent');},

    'AMAZON.ShuffleOnIntent': function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.ShuffleOffIntent': function () { this.emit('AMAZON.StartOverIntent');},

    'AMAZON.StartOverIntent': function () {
        this.response.speak('This is radio, you can not do that.  You can say stop or pause to stop listening.');
        this.emit(':responseReady');

    },
    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    'PlayCommandIssued': function () { controller.play.call(this) },
    'PauseCommandIssued': function () { controller.stop.call(this) },

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

        this.handler.state = helpers.states.NULL_STATE;
        this.emit(":tell", this.t("GOODBYE"));
    }
};

var controller = function () {
    return {
        play: function (text) {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */

            if (canThrowCard.call(this)) {
                var cardTitle = audioData.subtitle;
                var cardContent = audioData.cardContent;
                var cardImage = audioData.image;
                this.response.cardRenderer(cardTitle, cardContent, cardImage);
            }

            this.response.speak(text).audioPlayerPlay('REPLACE_ALL', audioData.url, audioData.url, null, 0);
            this.emit(':responseReady');
        },
        stop: function () {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.speak("Good bye.").audioPlayerStop();
            this.emit(':responseReady');
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' || this.event.request.type === 'LaunchRequest') {
        return true;
    } else {
        return false;
    }
}