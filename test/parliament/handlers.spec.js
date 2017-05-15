// Include our testing frameworks
const expect = require("chai").expect; // Expectations
const sinon = require("sinon");        // Spying

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
        expect(Object.keys(handlers)).to.eql([ "events", "WhatsOnIntent", "AMAZON.HelpIntent", "LaunchRequest" ]);
    });

    describe("intents", function () {
        // Allow for emit and t to be called (usually handled by Alexa SDK
        beforeEach(function(){
            handlers.t = function(key) { return language_strings[translation_dictionary].translation[key]; };
            handlers.emit = function(args) {  };
        });

        afterEach(function(){
            handlers.t = undefined;
            handlers.emit = undefined;
        });

        describe("WhatsOnIntent", function (){
            context("with content", function(){
                context("for both commons and lords", function(){
                    // Mock handlers with content for both commons and lords
                    helpers.mocked_handlers("commons_content.html", "lords_content.html");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["WhatsOnIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 45 events on at the Houses of Parliament today: 25 in the House of Commons and 20 in the House of Lords would you like to hear more?", "There are 45 events on at the Houses of Parliament today: 25 in the House of Commons and 20 in the House of Lords would you like to hear more?", "What's on at Parliament", "There are 45 events on at the Houses of Parliament today: 25 in the House of Commons and 20 in the House of Lords would you like to hear more?");

                            done();
                        }, done);
                    });
                });

                context('for just the commons', function(){
                    // Mock handlers with content for commons only
                    helpers.mocked_handlers("commons_content.html", "lords_no_content.html");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["WhatsOnIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 25 events on at the Houses of Parliament today: they are all in the House of Commons would you like to hear more?", "There are 25 events on at the Houses of Parliament today: they are all in the House of Commons would you like to hear more?", "What's on at Parliament", "There are 25 events on at the Houses of Parliament today: they are all in the House of Commons would you like to hear more?");

                            done();
                        }, done);
                    });
                });

                context("for just the lords", function(){
                    // Mock handlers with content for commons only
                    helpers.mocked_handlers("commons_no_content.html", "lords_content.html");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["WhatsOnIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 20 events on at the Houses of Parliament today: they are all in the House of Lords would you like to hear more?", "There are 20 events on at the Houses of Parliament today: they are all in the House of Lords would you like to hear more?", "What's on at Parliament", "There are 20 events on at the Houses of Parliament today: they are all in the House of Lords would you like to hear more?");

                            done();
                        }, done);
                    });
                });
            });

            context("with no content", function(){
                // Mock handlers with content for both commons and lords
                helpers.mocked_handlers("commons_no_content.html", "lords_no_content.html");

                it("emits as expected", function(done){
                    let spy = sinon.spy(mocked_handlers, "emit");

                    mocked_handlers["WhatsOnIntent"](function(done){
                        expect(spy).to.have.been.calledWith(":tellWithCard", "There are no events at the houses of parliament today.", "What's on at Parliament", "There are no events at the houses of parliament today.");

                        done();
                    }, done);
                });
            });
        });

        describe("AMAZON.HelpIntent", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["AMAZON.HelpIntent"]();

                expect(spy).to.have.been.calledWith(":ask", "I can tell you what's going on at Parliament today. Simply ask 'what's on'.", "I can tell you what's going on at Parliament today. Simply ask 'what's on'.");
            })
        });

        describe("LaunchRequest", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["LaunchRequest"]();

                expect(spy).to.have.been.calledWith(":tell", "UK Parliament. You can find out what’s on in: the House of Commons, the House of Lords, or Both. Which would you like to do?");
            })
        })
    })
})
