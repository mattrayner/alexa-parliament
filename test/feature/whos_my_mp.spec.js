const expect = require("chai").expect;         // Expectations
const assert = require("chai").assert;         // Assertions
const winston = require("winston");            // Async logging
const clearRequire = require("clear-require"); // Ablility to clear our require as needed.
const mockery = require("mockery");            // Mock external network requests
const mock = require("mock-require");
const sinon = require("sinon");
const Mitm = require("mitm");
const fs = require("fs");
const Bluebird = require("bluebird");
const nock = require('nock');

const KappaLambda = require('kappa-lambda');
const lambdaFile = '../../../index.js';
const kappaLambda = new KappaLambda(lambdaFile);

const helpers = require("../support/test_helpers").feature_helpers;

winston.level = "error";

describe("Parliament Alexa", function () {
    describe("MyMPIntent", function () {
        afterEach(function(){
            nock.cleanAll();
        });

        context('without postcode consent', function () {
            before(function (cb) {
                event = helpers.getEvent("MyMPIntent/without_consent.json");

                kappaLambda.execute(event, cb);
            });

            it("should return outputSpeech matching string", function () {
                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Please enable Location permissions in the Amazon Alexa app. </speak>');
            });

            it("should be of type AskForPermissionsConsent", function () {
                expect(kappaLambda.done.response.card.type).to.have.string('AskForPermissionsConsent');
            });

            it("should ask for the correct permissions", function () {
                expect(kappaLambda.done.response.card.permissions).to.eql(['read::alexa:device:all:address:country_and_postal_code']);
            });
        });

        context('with postcode consent', function () {
            let event;

            beforeEach(function() {
                event = helpers.getEvent("MyMPIntent/with_consent.json");
            });

            context('without amazon providing a postcode', function () {
                context('403 status', function () {
                    beforeEach(function(cb){
                        nock('https://api.eu.amazonalexa.com')
                            .get(/^\/v1\/devices\//)
                            .reply(403, JSON.parse('{"foo":"bar"}'));

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Please enable Location permissions in the Amazon Alexa app. </speak>');
                    });
                });

                context('204 status', function () {
                    beforeEach(function(cb){
                        nock('https://api.eu.amazonalexa.com')
                            .get(/^\/v1\/devices\//)
                            .reply(204, JSON.parse('{"foo":"bar"}'));

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> I couldn’t get a postcode for your device. Please check the location in your Amazon Alexa app. </speak>');
                    });
                });

                context('other status', function () {
                    beforeEach(function(cb){
                        nock('https://api.eu.amazonalexa.com')
                            .get(/^\/v1\/devices\//)
                            .reply(500, '');

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There was a problem getting your postcode from Amazon. Please try again later. </speak>');
                    });
                });
            });

            context('with amazon providing a postcode', function () {
                beforeEach(function(){
                    let file_path = __dirname + "/../fixtures/external_data/device_address.json";
                    let response = fs.readFileSync(file_path, "utf8");

                    nock('https://api.eu.amazonalexa.com')
                        .get(/^\/v1\/devices\//)
                        .reply(200, JSON.parse(response.trim()));
                });

                context('application upcases postcode', function () {
                    beforeEach(function(cb){
                        nock('https://api.eu.amazonalexa.com')
                            .get(/^\/v1\/devices\//)
                            .reply(200, JSON.parse('{"countryCode":"GB","postalCode":"sw1a 0aa"}'));

                        nock('https://beta.parliament.uk')
                            .get('/postcodes/SW1A%200AA')
                            .reply(404, '<html><head></head><body><h1>title</h1></body></html>');

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> I was unable to find any information for SW1A 0AA. </speak>');
                    });
                });

                context('without finding the users postcode', function () {
                    beforeEach(function(cb) {
                        nock('https://beta.parliament.uk')
                            .get('/postcodes/SW1A%200AA')
                            .reply(404, '<html><head></head><body><h1>title</h1></body></html>');

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> I was unable to find any information for SW1A 0AA. </speak>');
                    });
                });

                context('with a 500 error from parliament', function() {
                    beforeEach(function(cb) {
                        nock('https://beta.parliament.uk')
                            .get('/postcodes/SW1A%200AA')
                            .reply(500, '<html><head></head><body><h1>title</h1></body></html>');

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There was a problem getting information from Parliament. Please try again later. </speak>');
                    });
                });

                context('with finding the users postcode', function () {
                    context('without finding the users MP', function () {
                        context('without finding the users constituency', function () {
                            beforeEach(function(cb) {
                                nock('https://beta.parliament.uk')
                                    .get('/postcodes/SW1A%200AA')
                                    .reply(200, '');

                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string("<speak> I can't find an MP for SW1A 0AA. </speak>");
                            });
                        });

                        context('with finding the users constituency', function () {
                            beforeEach(function(cb) {
                                let file_path = __dirname + "/../fixtures/external_data/whos_my_mp/constituency_only.nt";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('https://beta.parliament.uk')
                                    .get('/postcodes/SW1A%200AA')
                                    .reply(200, response.trim());

                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string("<speak> I can't find an MP for Cities of London and Westminster. </speak>");
                            });
                        });
                    });

                    context('with finding the users MP', function () {
                        context('without finding the MPs party', function () {
                            context('without finding the MPs election date', function () {
                                context('without finding the users constituency name', function () {
                                    beforeEach(function(cb){
                                        let file_path = __dirname + "/../fixtures/external_data/whos_my_mp/mp_only.nt";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('https://beta.parliament.uk')
                                            .get('/postcodes/SW1A%200AA')
                                            .reply(200, response.trim());

                                        kappaLambda.execute(event, cb);
                                    });

                                    it("should return outputSpeech matching string", function () {
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The MP for SW1A 0AA, is Mark Field. </speak>');
                                    });
                                });

                                context('with finding the users constituency name', function () {
                                    beforeEach(function(cb){
                                        let file_path = __dirname + "/../fixtures/external_data/whos_my_mp/mp_and_constituency_only.nt";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('https://beta.parliament.uk')
                                            .get('/postcodes/SW1A%200AA')
                                            .reply(200, response.trim());

                                        kappaLambda.execute(event, cb);
                                    });

                                    it("should return outputSpeech matching string", function (done) {
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The MP for Cities of London and Westminster, is Mark Field. </speak>');

                                        done();
                                    });
                                });
                            });

                            context('with finding the MPs election date', function () {
                                context('without finding the users constituency name', function () {
                                    beforeEach(function(cb){
                                        let file_path = __dirname + "/../fixtures/external_data/whos_my_mp/mp_and_election_only.nt";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('https://beta.parliament.uk')
                                            .get('/postcodes/SW1A%200AA')
                                            .reply(200, response.trim());

                                        kappaLambda.execute(event, cb);
                                    });

                                    it("should return outputSpeech matching string", function () {
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The MP for SW1A 0AA, is Mark Field. Your MP was elected on <say-as interpret-as="date" format="dmy">08-06-2017</say-as>. </speak>');
                                    });
                                });

                                context('with finding the users constituency name', function () {
                                    beforeEach(function(cb){
                                        let file_path = __dirname + "/../fixtures/external_data/whos_my_mp/mp_election_and_constituency_only.nt";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('https://beta.parliament.uk')
                                            .get('/postcodes/SW1A%200AA')
                                            .reply(200, response.trim());

                                        kappaLambda.execute(event, cb);
                                    });

                                    it("should return outputSpeech matching string", function () {
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The MP for Cities of London and Westminster, is Mark Field. Your MP was elected on <say-as interpret-as="date" format="dmy">08-06-2017</say-as>. </speak>');
                                    });
                                });
                            });
                        });

                        context('with finding the MPs party', function () {
                            context('without finding the MPs election date', function () {
                                context('without finding the users constituency name', function () {
                                    beforeEach(function(cb){
                                        let file_path = __dirname + "/../fixtures/external_data/whos_my_mp/mp_and_party_only.nt";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('https://beta.parliament.uk')
                                            .get('/postcodes/SW1A%200AA')
                                            .reply(200, response.trim());

                                        kappaLambda.execute(event, cb);
                                    });

                                    it("should return outputSpeech matching string", function () {
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The MP for SW1A 0AA, is Mark Field. Your MP is a member of the Conservative party. </speak>');
                                    });
                                });

                                context('with finding the users constituency name', function () {
                                    beforeEach(function(cb){
                                        let file_path = __dirname + "/../fixtures/external_data/whos_my_mp/mp_party_and_constituency_only.nt";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('https://beta.parliament.uk')
                                            .get('/postcodes/SW1A%200AA')
                                            .reply(200, response.trim());

                                        kappaLambda.execute(event, cb);
                                    });

                                    it("should return outputSpeech matching string", function () {
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The MP for Cities of London and Westminster, is Mark Field. Your MP is a member of the Conservative party. </speak>');
                                    });
                                });
                            });

                            context('with finding the MPs election date', function () {
                                context('without finding the users constituency name', function () {
                                    beforeEach(function(cb){
                                        let file_path = __dirname + "/../fixtures/external_data/whos_my_mp/mp_party_and_election_only.nt";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('https://beta.parliament.uk')
                                            .get('/postcodes/SW1A%200AA')
                                            .reply(200, response.trim());

                                        kappaLambda.execute(event, cb);
                                    });

                                    it("should return outputSpeech matching string", function () {
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The MP for SW1A 0AA, is Mark Field. Your MP is a member of the Conservative party, and was elected on <say-as interpret-as="date" format="dmy">08-06-2017</say-as>. </speak>');
                                    });
                                });

                                context('with finding the users constituency name', function () {
                                    beforeEach(function(cb){
                                        let file_path = __dirname + "/../fixtures/external_data/whos_my_mp/all_data.nt";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('https://beta.parliament.uk')
                                            .get('/postcodes/SW1A%200AA')
                                            .reply(200, response.trim());

                                        kappaLambda.execute(event, cb);
                                    });

                                    it("should return outputSpeech matching string", function () {
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The MP for Cities of London and Westminster, is Mark Field. Your MP is a member of the Conservative party, and was elected on <say-as interpret-as="date" format="dmy">08-06-2017</say-as>. </speak>');
                                    });

                                    it("should have shouldEndSession equal to true", function () {
                                        assert.equal(kappaLambda.done.response.shouldEndSession, true);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
