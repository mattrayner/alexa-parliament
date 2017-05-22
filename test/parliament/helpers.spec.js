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

describe('The helpers module', function(){
    it("is an object", function() {
        expect(helpers).to.be.an("object");
    });
});
