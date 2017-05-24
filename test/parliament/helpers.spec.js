// Include our testing frameworks
const expect = require("chai").expect; // Expectations
const sinon = require("sinon");        // Spying
const mockery = require("mockery");
const Bluebird = require("Bluebird");

// Include the subject of our tests
const helpers = require("../../lib/parliament/helpers");

const language_strings = require("../../lib/parliament/language_strings");
const translation_dictionary = "en-GB";

const test_helpers = require("../support/test_helpers");

describe("The helpers module", function(){
    it("is an object", function() {
        expect(helpers).to.be.an("object");
    });

    describe("getEvents", function(){
    //    Implement
    });

    describe("getHouseIntentData", function(){
        context("with intent data", function(){
            it("returns foo", function(){
                let intent = { slots: { house: { value: "foo" } } };

                expect(helpers.getHouseIntentData(intent)).to.equal("foo");
            });
        });

        context("without intent data", function(){
            it("returns null", function(){
                let intent = {}

                expect(helpers.getHouseIntentData(intent)).to.equal(null);
            });
        });
    });

    describe("getCalendarUriOptions", function(){
        //    Implement
    });

    describe("generateEventMessage", function(){
        //    Implement
    });

    describe("generateDetailedEventMessage", function(){
        //    Implement
    });

    describe("speakEvents", function(){
        //    Implement
    });

    describe("thereIsAreHelper", function(){
        beforeEach(function(){
            handlers = { t: function(key) { return key; } };
            block = function() { return ["block", "content"]; };
        });

        context("with a count of 1", function(){
            beforeEach(function(){
                count = 1;
            });

            it("returns as expected", function(){
                expect(helpers.thereIsAreHelper(count, handlers, block)).to.deep.equal(["THERE_IS", "block", "content", "EVENT"]);
            });
        });

        context("with a count of not 1", function(){
            beforeEach(function(){
                count = 3;
            });

            it("returns as expected", function(){
                expect(helpers.thereIsAreHelper(count, handlers, block)).to.deep.equal(["THERE_ARE", "block", "content", "EVENTS"])
            });
        });
    });
});
