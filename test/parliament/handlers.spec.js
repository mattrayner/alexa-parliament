// Include our testing frameworks
const expect = require("chai").expect; // Expectations
const sinon = require("sinon");        // Spying
const mockery = require("mockery");
const Bluebird = require("Bluebird");

// Include the subject of our tests
const handlers = require("../../lib/parliament/handlers");

const language_strings = require("../../lib/parliament/language_strings");
const translation_dictionary = "en-GB";

const helpers = require("../support/test_helpers");

describe("The handlers module", function(){
    it("is an object", function() {
        expect(handlers).to.be.an("object");
    });

    it("has the expected intents", function(){
        expect(Object.keys(handlers)).to.eql([
            "AMAZON.YesIntent",
            "AMAZON.NoIntent",
            "AMAZON.HelpIntent",
            "AMAZON.CancelIntent",
            "AMAZON.StopIntent",
            "LaunchRequest",
            "WhatsOnIntent"
        ]);
    });

    describe("intents", function () {
        // Allow for emit and t to be called (usually handled by Alexa SDK
        beforeEach(function(){
            handlers.t = function(key) { return language_strings[translation_dictionary].translation[key]; };
            handlers.emit = function(args) {  };
            handlers.attributes = [];
        });

        afterEach(function(){
            handlers.t = undefined;
            handlers.emit = undefined;
            handlers.attributes = undefined
        });

        describe("WhatsOnIntent", function (){
            context("with content", function(){
                context("for both commons and lords", function(){
                    // Mock handlers with content for both commons and lords
                    helpers.mocked_handlers("events_both_houses.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["WhatsOnIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 55 events on at the Houses of Parliament today: 23 in the House of Commons and 32 in the House of Lords . Would you like to hear more?", ". Would you like to hear more?", "What's on at Parliament", "There are 55 events on at the Houses of Parliament today: 23 in the House of Commons and 32 in the House of Lords . Would you like to hear more?");

                            done();
                        }, done);
                    });
                });

                context('for just the commons', function(){
                    // Mock handlers with content for commons only
                    helpers.mocked_handlers("events_commons.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["WhatsOnIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 18 events on at the Houses of Parliament today: they are all in the House of Commons . Would you like to hear more?", ". Would you like to hear more?", "What's on at Parliament", "There are 18 events on at the Houses of Parliament today: they are all in the House of Commons . Would you like to hear more?");

                            done();
                        }, done);
                    });
                });

                context("for just the lords", function(){
                    // Mock handlers with content for commons only
                    helpers.mocked_handlers("events_lords.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["WhatsOnIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 16 events on at the Houses of Parliament today: they are all in the House of Lords . Would you like to hear more?", ". Would you like to hear more?", "What's on at Parliament", "There are 16 events on at the Houses of Parliament today: they are all in the House of Lords . Would you like to hear more?");

                            done();
                        }, done);
                    });
                });
            });

            context("with no content", function(){
                // Mock handlers with content for both commons and lords
                helpers.mocked_handlers("events_none.json");

                it("emits as expected", function(done){
                    let spy = sinon.spy(mocked_handlers, "emit");

                    mocked_handlers["WhatsOnIntent"](function(done){
                        expect(spy).to.have.been.calledWith(":tellWithCard", "There are no events at the houses of parliament today.", "What's on at Parliament", "There are no events at the houses of parliament today.");

                        done();
                    }, done);
                });
            });

            context("with a network error", function(){
                // Mock handlers with 404
                helpers.mocked_handlers("404.html");

                it("emits the error message", function(done){
                    let spy = sinon.spy(mocked_handlers, "emit");

                    mocked_handlers["WhatsOnIntent"](function(done){
                        expect(spy).to.have.been.calledWith(":tell", "Something went wrong, please try again later");

                        done();
                    }, done);
                });
            })
        });

        describe("AMAZON.HelpIntent", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["AMAZON.HelpIntent"]();

                expect(spy).to.have.been.calledWith(":ask", "You can say 'what's on at the houses of parliament', or, you can say exit... What can I help you with?", "You can say 'what's on at the houses of parliament', or, you can say exit... What can I help you with?");
            })
        });

        describe("AMAZON.YesIntent", function(){
            helpers.mocked_handlers("events_both_houses.json");

            it("emits as expected", function(done){
                let spy = sinon.spy(mocked_handlers, "emit");

                mocked_handlers["AMAZON.YesIntent"](done);

                expect(spy).to.have.been.calledWith(":tell", "Once this feature has been implemented, it will be great!");
            })
        });

        describe("AMAZON.NoIntent", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["AMAZON.NoIntent"]();

                expect(spy).to.have.been.calledWith(":tell", "Okay");
            })
        });

        describe("AMAZON.CancelIntent", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["AMAZON.CancelIntent"]();

                expect(spy).to.have.been.calledWith(":tell", "");
            })
        });

        describe("AMAZON.StopIntent", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["AMAZON.StopIntent"]();

                expect(spy).to.have.been.calledWith(":tell", "Okay");
            })
        });

        describe("LaunchRequest", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["LaunchRequest"]();

                expect(spy).to.have.been.calledWith("WhatsOnIntent");
            })
        })
    })
})
