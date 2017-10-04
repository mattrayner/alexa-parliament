'use strict';

// Include our helper methods
const constants = require('../constants');
const audioData = require('../audioData');
const helpers = require('../helpers');
const audioController = require('../helpers/audioController');

const AlexaDeviceAddressClient = require("../../../vendor/amazon/device_address_client/AlexaDeviceAddressClient");
const NtripleClient = require("../clients/NtripleClient");

const N3Util = require('n3').Util;
const winston = require('winston');
const moment = require('moment');

const COUNTRY_AND_POST_CODE_PERMISSION = "read::alexa:device:all:address:country_and_postal_code";
const PERMISSIONS = [COUNTRY_AND_POST_CODE_PERMISSION];
const NTRIPLE_ENDPOINT = 'beta.parliament.uk';

/**
 * Alexa null state intent handlers
 */
module.exports = {
    /*
     *  All Intent Handlers for state : START_MODE
     */
    'LaunchRequest' : function () {
        // Initialize Attributes
        // this.attributes['playOrder'] = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
        // this.attributes['index'] = 0;
        // this.attributes['offsetInMilliseconds'] = 0;
        // this.attributes['loop'] = true;
        // this.attributes['shuffle'] = false;
        // this.attributes['playbackIndexChanged'] = true;
        //  Change state to START_MODE
        this.handler.state = constants.states.START_MODE;

        this.response.speak(this.t('LAUNCH_TEXT')).listen(this.t('LAUNCH_TEXT_REPROMPT'));
        this.emit(':responseReady');
    },
    'PlayAudio' : function () {
        helpers.logHandler(this.name);
        audioController.play(this, audioData.title);
    },
    'AMAZON.HelpIntent' : function () {
        this.response.speak(this.t('HELP_TEXT')).listen(this.t('HELP_TEXT_REPROMPT'));
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent' : function () {
        var message = 'Good bye.';
        this.response.speak(message);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.NoIntent' : function () {
        this.response.speak('');
        this.emit(':responseReady');
    },
    'AMAZON.YesIntent' : function () { this.emit('AMAZON.NoIntent'); },
    /**
     * MyMPIntent - tell the user who is their MP
     *
     * @funcion
     */
    "MyMPIntent": function() {
        helpers.logHandler(this.name);
        winston.info("Starting getAddressHandler()");

        const consentToken = this.event.context.System.user.permissions.consentToken;

        // If we have not been provided with a consent token, this means that the user has not
        // authorized your skill to access this information. In this case, you should prompt them
        // that you don't have permissions to retrieve their address.
        if(!consentToken) {
            this.emit(":tellWithPermissionCard", this.t('NOTIFY_MISSING_PERMISSIONS'), PERMISSIONS);

            // Lets terminate early since we can't do anything else.
            winston.log("User did not give us permissions to access their address.");
            winston.info("Ending getAddressHandler()");
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

                    winston.log(address);

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

                                winston.log("Parliament response received");

                                if(ntripleResponse.store.size === 0) {
                                    winston.log('No triples in store');
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
                                    if(incumbencyStartDateTriple) { object.incumbency = moment(N3Util.getLiteralValue(incumbencyStartDateTriple.object)).format('DD-MM-YYYY'); }
                                }

                                let constituencyTriple = store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://id.ukpds.org/schema/ConstituencyGroup');
                                if(constituencyTriple) {
                                    let constituencyNameTriple = store.getTriples(constituencyTriple.subject, "http://id.ukpds.org/schema/constituencyGroupName", null)[0];
                                    if(constituencyNameTriple) { object.constituency = N3Util.getLiteralValue(constituencyNameTriple.object); }
                                }

                                winston.log('Triples processed into data');

                                let location = `${ssml_postcode}`;
                                if(object.constituency) { location = object.constituency }

                                if(!object.member) {
                                    return this.emit(':tell', `I can't find an MP for ${location}.`)
                                }

                                let mp_for_string = `The MP for ${location}, is ${object.member}.`;

                                let incumbency_string = '';
                                if(object.incumbency) { incumbency_string = ` was elected on <say-as interpret-as="date" format="dmy">${object.incumbency}</say-as>` }

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
                                winston.log("Don't know about that postcode");
                                this.emit(':tell', `I was unable to find any information for ${ssml_postcode}.`);

                                break;
                            default:
                                winston.log("Other error");
                                this.emit(":tell", this.t('MP_PROBLEM'));
                        }
                    });

                    ntripleRequest.catch((error) => {
                        this.emit(":tell", 'ERROR');
                        winston.error(error);
                        winston.info("Ending getTripleStore()");
                    });

                    break;
                case 204:
                    // This likely means that the user didn't have their address set via the companion app.
                    winston.log("Successfully requested from the device address API, but no address was returned.");
                    this.emit(":tell", this.t('NO_ADDRESS'));
                    break;
                case 403:
                    winston.log("The consent token we had wasn't authorized to access the user's address.");
                    this.emit(":tellWithPermissionCard", this.t('NOTIFY_MISSING_PERMISSIONS'), PERMISSIONS);
                    break;
                default:
                    this.emit(":tell", this.t('LOCATION_FALIURE'));
            }

            winston.info("Ending getAddressHandler()");
        });

        deviceAddressRequest.catch((error) => {
            this.emit(":tell", 'ERROR');
            winston.error(error);
            winston.info("Ending getAddressHandler()");
        });
    },
    /**
     * WhatsOnIntent - sets the skill state to 'WHATS_ON' and calls the state-specific intent.
     *
     * @function
     */
    "WhatsOnIntent": function () {
        helpers.logHandler(this.name);

        this.handler.state = constants.states.WHATS_ON;

        this.emitWithState("WhatsOnIntent");
    },
    'SessionEndedRequest' : function () {
        // No session ended logic
    },
    'Unhandled' : function () {
        let message = 'Sorry, I could not understand. Please say, whats on, to find out whats on, or who\'s my MP, to find out who your MP is.';
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    }
};

// module.exports = {
//     /**
//      * AMAZON.YesIntent handler - stops the session
//      *
//      * @function
//      */
//     "AMAZON.YesIntent": function () {
//         helpers.logHandler(this.name);
//
//         this.emit(":tell", this.t("CANCEL_RESPONSE"));
//     },
//
//     /**
//      * AMAZON.NoIntent handler - stops the session
//      *
//      * @function
//      */
//     "AMAZON.NoIntent": function () {
//         helpers.logHandler(this.name);
//
//         this.emit(":tell", this.t("CANCEL_RESPONSE"));
//     },
//
//     // /**
//     //  * AMAZON.CancelIntent handler - stops the session
//     //  *
//     //  * @function
//     //  */
//     // "AMAZON.CancelIntent": function () {
//     //     helpers.logHandler(this.name);
//     //
//     //     this.emit(":tell", this.t("CANCEL_RESPONSE"));
//     // },
//     //
//     // /**
//     //  * AMAZON.StopIntent handler - stops the session
//     //  *
//     //  * @function
//     //  */
//     // "AMAZON.StopIntent": function () {
//     //     helpers.logHandler(this.name);
//     //
//     //     this.emit(":tell", this.t("CANCEL_RESPONSE"));
//     // },
//
//     /**
//      * AMAZON.HelpIntent handler - gives a clear message explaining what the skill can 1~do
//      *
//      * @function
//      */
//     "AMAZON.HelpIntent": function () {
//         helpers.logHandler(this.name);
//
//         this.emit(":ask", this.t("HELP_TEXT"), this.t("HELP_TEXT_REPROMPT"));
//     },
//
//     /**
//      * LaunchRequest handler - gives a welcome message and explains usage instructions
//      *
//      * @function
//      */
//     "LaunchRequest": function () {
//         helpers.logHandler(this.name);
//
//         this.emit(":ask", this.t("LAUNCH_TEXT"), this.t("LAUNCH_TEXT_REPROMPT"));
//     },
//
//     /**
//      * WhatsOnIntent - sets the skill state to 'WHATS_ON' and calls the state-specific intent.
//      *
//      * @function
//      */
//     "WhatsOnIntent": function () {
//         helpers.logHandler(this.name);
//
//         this.handler.state = constants.states.WHATS_ON;
//
//         this.emitWithState("WhatsOnIntent");
//     },

//     /**
//      * MyMPIntent - tell the user who is their MP
//      *
//      * @funcion
//      */
//     "MyMPIntent": function() {
//         helpers.logHandler(this.name);
//         winston.info("Starting getAddressHandler()");
//
//         const consentToken = this.event.context.System.user.permissions.consentToken;
//
//         // If we have not been provided with a consent token, this means that the user has not
//         // authorized your skill to access this information. In this case, you should prompt them
//         // that you don't have permissions to retrieve their address.
//         if(!consentToken) {
//             this.emit(":tellWithPermissionCard", this.t('NOTIFY_MISSING_PERMISSIONS'), PERMISSIONS);
//
//             // Lets terminate early since we can't do anything else.
//             winston.log("User did not give us permissions to access their address.");
//             winston.info("Ending getAddressHandler()");
//             return;
//         }
//
//         const deviceId = this.event.context.System.device.deviceId;
//         const apiEndpoint = this.event.context.System.apiEndpoint;
//
//         const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
//         let deviceAddressRequest = alexaDeviceAddressClient.getCountryAndPostalCode();
//
//         deviceAddressRequest.then((addressResponse) => {
//             switch(addressResponse.statusCode) {
//                 case 200:
//                     const address = addressResponse.address;
//
//                     winston.log(address);
//
//                     const ADDRESS_MESSAGE = "Got address from AMAZON: " +
//                         `${address['countryCode']}, ${address['postalCode']}`;
//
//                     let postcode = address['postalCode'].toUpperCase();
//
//                     const ntripleClient = new NtripleClient(NTRIPLE_ENDPOINT);
//
//                     let uri_postcode = postcode.replace(' ', '%20');
//                     // let ssml_postcode = postcode.replace(' ', '').toLowerCase().split('').join('. ');
//                     let ssml_postcode = postcode;
//                     let ntripleRequest = ntripleClient.getTripleStore(`/postcodes/${uri_postcode}`);
//
//                     ntripleRequest.then((ntripleResponse) => {
//                         switch(ntripleResponse.statusCode) {
//                             case 200:
//                                 let object = {
//                                     member: null,
//                                     constituency: null,
//                                     party: null,
//                                     incumbency: null
//                                 };
//
//                                 winston.log("Parliament response received");
//
//                                 if(ntripleResponse.store.size === 0) {
//                                     winston.log('No triples in store');
//                                     return this.emit(':tell', `I can't find an MP for ${ssml_postcode}.`);
//                                 }
//
//                                 let store = ntripleResponse.store;
//
//                                 let memberTriple = store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://id.ukpds.org/schema/Person')[0];
//                                 if(memberTriple) {
//                                     let memberNameTriple = store.getTriples(memberTriple.subject, "http://example.com/F31CBD81AD8343898B49DC65743F0BDF", null)[0];
//                                     if(memberNameTriple) { object.member = N3Util.getLiteralValue(memberNameTriple.object); }
//                                 }
//
//                                 let partyTriple = store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://id.ukpds.org/schema/Party')[0];
//                                 if(partyTriple) {
//                                     let partyNameTriple = store.getTriples(partyTriple.subject, "http://id.ukpds.org/schema/partyName", null)[0];
//                                     if(partyNameTriple) { object.party = N3Util.getLiteralValue(partyNameTriple.object); }
//                                 }
//
//                                 let incumbencyTriple = store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://id.ukpds.org/schema/SeatIncumbency')[0];
//                                 if(incumbencyTriple) {
//                                     let incumbencyStartDateTriple = store.getTriples(incumbencyTriple.subject, "http://id.ukpds.org/schema/incumbencyStartDate", null)[0];
//                                     if(incumbencyStartDateTriple) { object.incumbency = N3Util.getLiteralValue(incumbencyStartDateTriple.object); }
//                                 }
//
//                                 let constituencyTriple = store.getTriples(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://id.ukpds.org/schema/ConstituencyGroup');
//                                 if(constituencyTriple) {
//                                     let constituencyNameTriple = store.getTriples(constituencyTriple.subject, "http://id.ukpds.org/schema/constituencyGroupName", null)[0];
//                                     if(constituencyNameTriple) { object.constituency = N3Util.getLiteralValue(constituencyNameTriple.object); }
//                                 }
//
//                                 winston.log('Triples processed into data');
//
//                                 let location = `${ssml_postcode}`;
//                                 if(object.constituency) { location = object.constituency }
//
//                                 if(!object.member) {
//                                     return this.emit(':tell', `I can't find an MP for ${location}.`)
//                                 }
//
//                                 let mp_for_string = `The MP for ${location}, is ${object.member}.`;
//
//                                 let incumbency_string = '';
//                                 if(object.incumbency) { incumbency_string = ` was elected on <say-as interpret-as="date" format="ymd">${object.incumbency}</say-as>` }
//
//                                 if(!object.party) {
//                                     if(object.incumbency) {
//                                         return this.emit(':tell', `${mp_for_string} Your MP${incumbency_string}.`)
//                                     } else {
//                                         return this.emit(':tell', mp_for_string)
//                                     }
//                                 }
//
//                                 let party_string = '';
//                                 if(object.party) { party_string = ` is a member of the ${object.party} party` }
//
//                                 if(object.party && object.incumbency) {
//                                     return this.emit(':tell', `${mp_for_string} Your MP${party_string}, and${incumbency_string}.`)
//                                 }
//
//                                 this.emit(':tell', `${mp_for_string} Your MP${party_string}.`)
//
//                                 break;
//                             case 404:
//                                 winston.log("Don't know about that postcode");
//                                 this.emit(':tell', `I was unable to find any information for ${ssml_postcode}.`);
//
//                                 break;
//                             default:
//                                 winston.log("Other error");
//                                 this.emit(":tell", this.t('MP_PROBLEM'));
//                         }
//                     });
//
//                     ntripleRequest.catch((error) => {
//                         this.emit(":tell", 'ERROR');
//                         winston.error(error);
//                         winston.info("Ending getTripleStore()");
//                     });
//
//                     break;
//                 case 204:
//                     // This likely means that the user didn't have their address set via the companion app.
//                     winston.log("Successfully requested from the device address API, but no address was returned.");
//                     this.emit(":tell", this.t('NO_ADDRESS'));
//                     break;
//                 case 403:
//                     winston.log("The consent token we had wasn't authorized to access the user's address.");
//                     this.emit(":tellWithPermissionCard", this.t('NOTIFY_MISSING_PERMISSIONS'), PERMISSIONS);
//                     break;
//                 default:
//                     this.emit(":tell", this.t('LOCATION_FALIURE'));
//             }
//
//             winston.info("Ending getAddressHandler()");
//         });
//
//         deviceAddressRequest.catch((error) => {
//             this.emit(":tell", 'ERROR');
//             winston.error(error);
//             winston.info("Ending getAddressHandler()");
//         });
//     },
//
//     'PlayAudio': function () {
//         // play the radio
//         controller.play.call(this, `Welcome to ${audioData.title}`);
//     },
//
//     'ExceptionEncountered': function () {
//         winston.log("******************* EXCEPTION **********************");
//         winston.log(JSON.stringify(this.event.request, null, 2));
//         this.callback(null, null)
//     },
//
//     /**
//      * Unhandled handler - resets the state and stops the session
//      *
//      * @function
//      */
//     "Unhandled": function () {
//         helpers.logHandler(this.name);
//
//         this.handler.state = constants.states.NULL_STATE;
//         this.emit(":tell", this.t("GOODBYE"));
//     }
// };