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
    describe("LaunchRequest", function () {
        beforeEach(function (cb) {
            event = helpers.getEvent("LaunchRequest.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Welcome to Parliament. Say, \'what\'s on\', to find out whats happening today at the Houses of Parliament. Say, who\'s my MP, to find out information about your MP. Or say, \'help\', for more information. </speak>');
        });

        it("should return reprompt outputSpeech matching string", function () {
            expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Try saying, \'what\'s on\', or, who\'s my MP. </speak>');
        });

        it("should have shouldEndSession equal to false", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, false);
        });
    });

    describe("AMAZON.HelpIntent", function () {
        before(function (cb) {
            event = helpers.getEvent("AMAZON.HelpIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Parliament for Alexa, can tell you what\'s on today at the Houses of Parliament, or tell you who your MP is. Try saying, \'what\'s on\', to hear about the events at both houses. Alternatively, say, \'whats on at the commons\', or, \'whats on in the lords\', to hear about the events at a specific house. To find out who your MP is, try saying, who\'s my MP. </speak>');
        });

        it("should return reprompt outputSpeech matching string", function () {
            expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Try saying, \'what\'s on\', or, who\'s my MP. </speak>');
        });

        it("should have shouldEndSession equal to false", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, false);
        });
    });

    describe("AMAZON.YesIntent", function () {
        before(function (cb) {
            event = helpers.getEvent("AMAZON.YesIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak>  </speak>');
        });

        it("should have shouldEndSession equal to true", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, true);
        });
    });

    describe("AMAZON.NoIntent", function () {
        before(function (cb) {
            event = helpers.getEvent("AMAZON.NoIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak>  </speak>');
        });

        it("should have shouldEndSession equal to true", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, true);
        });
    });

    describe("AMAZON.CancelIntent", function () {
        before(function (cb) {
            event = helpers.getEvent("AMAZON.CancelIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak>  </speak>');
        });

        it("should have shouldEndSession equal to true", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, true);
        });
    });

    describe("AMAZON.StopIntent", function () {
        before(function (cb) {
            event = helpers.getEvent("AMAZON.StopIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak>  </speak>');
        });

        it("should have shouldEndSession equal to true", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, true);
        });
    });
});
