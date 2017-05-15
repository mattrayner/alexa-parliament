// Test helpers
const mockery = require("mockery");    // Mocking remote connections
const fs = require("fs");
const Bluebird = require("bluebird");

const language_strings = require("../../lib/parliament/language_strings");
const translation_dictionary = "en-GB";

module.exports = {
    mocked_handlers: function(commons_data_file, lords_data_file) {
        before(function (done) {
            let commons_content_filename = commons_data_file;
            let lords_content_filename = lords_data_file;
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
    }
};
