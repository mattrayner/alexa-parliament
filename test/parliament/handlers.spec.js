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
                context("for the commons commons", function(){
                    before(function (done) {
                        let commons_content_filename = "commons_content.html";
                        let lords_content_filename = "lords_content.html";
                        mockery.enable({
                            warnOnReplace: false,
                            warnOnUnregistered: false,
                            useCleanCache: true
                        });

                        mockery.registerMock("request-promise", function (config) {
                            let file_path = "";

                            if (config.uri.indexOf("Commons") > 0) {
                                file_path = __dirname + "/../fixtures/" + commons_content_filename;
                            } else {
                                file_path = __dirname + "/../fixtures/" + lords_content_filename;
                            }

                            let response = fs.readFileSync(file_path, "utf8");
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
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 45 on at the Houses of Parliament today: 25 in the House of Commons and 20 in the House of Lords would you like to hear more?", "There are 45 on at the Houses of Parliament today: 25 in the House of Commons and 20 in the House of Lords would you like to hear more?", "What's on at Parliament", "There are 45 on at the Houses of Parliament today: 25 in the House of Commons and 20 in the House of Lords would you like to hear more?")

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

                expect(spy).to.have.been.calledWith(":tell", "UK Parliament. You can find out what’s on in: the House of Commons, the House of Lords, or Both. Which would you like to do?")
            })
        })
    })
})
