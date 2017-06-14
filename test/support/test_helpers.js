// Test helpers
const mockery = require("mockery");    // Mocking remote connections
const fs = require("fs");
const Bluebird = require("bluebird");

const language_strings = require("../../lib/parliament/language_strings");
const translation_dictionary = "en-GB";

module.exports = {
    unit_helpers: {
        mocked_handlers: function(data_file) {
            before(function (done) {
                let test_data_file = data_file;
                mockery.enable({
                    warnOnReplace: false,
                    warnOnUnregistered: false,
                    useCleanCache: true
                });

                mockery.registerMock("request-promise", function (config) {
                    let file_path = __dirname + "/../fixtures/" + test_data_file;

                    let response = fs.readFileSync(file_path, "utf8");
                    return Bluebird.resolve(response.trim());
                });

                mocked_handlers = require("../../lib/parliament/handlers").mainHandlers;
                mocked_handlers.t = function(key) { return language_strings[translation_dictionary].translation[key] };
                mocked_handlers.emit = function(arguments) {  };
                mocked_handlers.attributes = [];
                mocked_handlers.event = { request: { intent: null } };

                done()
            });

            after(function (done) {
                mockery.disable();
                mockery.deregisterAll();

                done()
            });
        },

        mocked_helpers: function(){
            before(function (done) {
                mockery.enable({
                    warnOnReplace: false,
                    warnOnUnregistered: false,
                    useCleanCache: true
                });

                mockery.registerMock("moment", function () {
                    return { format: function(format) { return "2017-02-22" } }
                });

                mocked_helpers = require("../../lib/parliament/helpers");

                done()
            });

            after(function (done) {
                mockery.disable();
                mockery.deregisterAll();

                done()
            });
        },
    },

    feature_helpers: {
        getEvent: function (fileName) {
            return require(`../fixtures/requests/${ fileName }`);
        },

        mocked_handlers: function(data_file, future_event_data_file=null) {
            beforeEach(function (done) {
                let test_data_file = data_file;
                let additional_test_data_file = future_event_data_file;
                mockery.enable({
                    warnOnReplace: false,
                    warnOnUnregistered: false,
                    useCleanCache: true
                });

                mockery.registerMock("request-promise", function (config) {
                    let file_path = __dirname + "/../fixtures/external_data/";

                    if(config.uri.includes("date=30days")) {
                        file_path += additional_test_data_file;
                    } else {
                        file_path +=  test_data_file;
                    }

                    let response = fs.readFileSync(file_path, "utf8");
                    return Bluebird.resolve(response.trim());
                });

                done()
            });

            afterEach(function (done) {
                mockery.disable();
                mockery.deregisterAll();

                done()
            });
        },

        reset_mockery: function(){
            mockery.disable();
            mockery.deregisterAll();
        }
    }
};
