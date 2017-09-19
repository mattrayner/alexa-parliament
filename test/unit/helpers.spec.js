// Include our testing frameworks
const expect = require("chai").expect; // Expectations
const mockery = require("mockery");

// Include the subject of our tests
const helpers = require("../../lib/parliament/helpers");

const language_strings = require("../../lib/parliament/language_strings");

const test_helpers = require("../support/test_helpers").unit_helpers;

describe("The helpers module", function(){
    it("is an object", function() {
        expect(helpers).to.be.an("object");
    });

    describe("getEvents", function(){
    //    Implement
    });

    describe("getHouseIntentData", function(){
        context("with intent data", function(){
            context("with allowed intent data", function(){
                context("with parliament or both", function(){
                    it("returns null", function(){
                        let intent;

                        intent = { slots: { house: { value: "parliament" } } };
                        expect(helpers.getHouseIntentData(intent)).to.equal(null);


                        intent = { slots: { house: { value: "both" } } };
                        expect(helpers.getHouseIntentData(intent)).to.equal(null);
                    });
                });

                context("with a house", function(){
                    it("returns as expected", function(){
                        let intent = { slots: { house: { value: "commons" } } };
                        expect(helpers.getHouseIntentData(intent)).to.equal("commons");
                    });

                    describe("strips apostrophies", function(){
                        it("returns as expected", function(){
                            let intent = { slots: { house: { value: "common's" } } };
                            expect(helpers.getHouseIntentData(intent)).to.equal("commons");
                        });
                    })
                })
            });

            context("with invalid intent data", function(){
                it("raises an error", function(){
                    let intent = { slots: { house: { value: "foo" } } };
                    let raised_error = false

                    try {
                        helpers.getHouseIntentData(intent)
                    } catch(error) {
                        raised_error = true
                        expect(error.message).to.equal('Slot value \'foo\' was not one of: parliament,commons,lords,both');
                        expect(error.intent).to.equal("foo")
                    }
                    expect(raised_error).to.equal(true)
                });
            })
        });

        context("without intent data", function(){
            it("returns null", function(){
                let intent = {};

                expect(helpers.getHouseIntentData(intent)).to.equal(null);
            });
        });
    });

    describe("getCalendarUriOptions", function(){
        test_helpers.mocked_helpers();

        context("without a houseOfInterest", function(){
            it('returns the expected object', function(){
                expect(mocked_helpers.getCalendarUriOptions()).to.deep.equal({
                    main: {
                        uri: "http://service.calendar.parliament.uk/calendar/events/list.json?startdate=2017-02-22&enddate=2017-02-22"
                    },
                    future: {
                        uri: "http://service.calendar.parliament.uk/calendar/events/list.json?date=30days"
                    }
                });
            });
        });

        context("wit a houseOfInterest", function(){
            it('returns the expected object', function(){
                expect(mocked_helpers.getCalendarUriOptions("foo")).to.deep.equal({
                    main: {
                        uri: "http://service.calendar.parliament.uk/calendar/events/list.json?startdate=2017-02-22&enddate=2017-02-22&house=foo"
                    },
                    future: {
                        uri: "http://service.calendar.parliament.uk/calendar/events/list.json?date=30days&house=foo"
                    }
                });
            });
        });
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
