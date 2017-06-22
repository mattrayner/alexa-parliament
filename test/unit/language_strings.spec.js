"use strict";

const expect = require("chai").expect;

const language_strings = require("../../lib/parliament/language_strings");

// How many strings should there be?
const expected_strings = 36;

describe("The language_strings module", function(){
    // Ensure we test any new translation blocks
    it("only has expected keys", function(){
        expect(Object.keys(language_strings)).to.eql(["en-GB", "en-US"])
    });

    context("translation count", function(){
        for(let i=0; i< Object.keys(language_strings).length; i++) {
            let key = Object.keys(language_strings)[i];

            describe(key, function(){
                context("translation", function(){
                    it("is an object", function(){
                        expect(language_strings[key]["translation"]).to.be.an("object")
                    });

                    it("has "+expected_strings+" strings", function(){
                        expect(Object.keys(language_strings[key]["translation"]).length).to.eql(expected_strings)
                    })
                })
            })
        }
    });

    describe("en-GB and en-US", function(){
        it("has the same translations", function(){
            expect(language_strings["en-GB"]).to.deep.equal(language_strings["en-US"]);
        });
    });
});
