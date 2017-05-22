// Test helpers
const mockery = require("mockery");    // Mocking remote connections
const fs = require("fs");
const Bluebird = require("bluebird");

const language_strings = require("../../lib/parliament/language_strings");
const translation_dictionary = "en-GB";

module.exports = {
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

            mocked_handlers = require("../../lib/parliament/handlers");
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
    }
};
