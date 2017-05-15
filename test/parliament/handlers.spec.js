// Include our testing frameworks
const expect = require("chai").expect; // Expectations
const sinon = require("sinon");        // Spying
const mockery = require("mockery");    // Mocking remote connections

// Include additional modules to help with testing
const fs = require("fs");
const Bluebird = require("bluebird");

// Include the subject of our tests
const handlers = require("../../lib/parliament/handlers");
const language_strings = require("../../lib/parliament/language_strings");
const translation_dictionary = "en-GB";

describe("The handlers module", function(){
    it("is an object", function() {
        expect(handlers).to.be.an("object");
    });

    it("has the expected intents", function(){
        expect(Object.keys(handlers)).to.eql([ "WhatsOnIntent", "AMAZON.HelpIntent", "LaunchRequest" ]);
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
                context("for the commons commons", function(){
                    before(function (done) {
                        console.log("BEFORE");

                        let filename = "commons_content.html";
                        mockery.enable({
                            warnOnReplace: false,
                            warnOnUnregistered: false,
                            useCleanCache: true
                        });

                        mockery.registerMock("request-promise", function () {
                            let response = fs.readFileSync(__dirname + "/../fixtures/" + filename, "utf8");
                            return Bluebird.resolve(response.trim());
                        });

                        mocked_handlers = require("../../lib/parliament/handlers");
                        mocked_handlers.t = function(key) { return language_strings[translation_dictionary].translation[key] };
                        mocked_handlers.emit = function(arguments) {  };

                        done()
                    });

                    after(function (done) {
                        mockery.disable();
                        mockery.deregisterAll();

                        done()
                    });

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["WhatsOnIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tellWithCard", "foo", "bar", "other");

                            done()
                        }, done)
                    })
                })
            })

        });

        describe("AMAZON.HelpIntent", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["AMAZON.HelpIntent"]();

                expect(spy).to.have.been.calledWith(":ask", "I can tell you what's going on at Parliament today. Simply ask 'what's on'.", "I can tell you what's going on at Parliament today. Simply ask 'what's on'.")
            })
        });

        describe("LaunchRequest", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["LaunchRequest"]();

                expect(spy).to.have.been.calledWith(":tell", "Welcome to Parliament")
            })
        })
    })
})
