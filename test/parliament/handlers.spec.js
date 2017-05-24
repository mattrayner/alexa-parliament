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
            handlers.request = { intent: null };
        });

        afterEach(function(){
            handlers.t = undefined;
            handlers.emit = undefined;
            handlers.attributes = undefined;
        });

        describe("WhatsOnIntent", function (){
            context("with content", function(){
                context("for both commons and lords", function(){
                    // Mock handlers with content for both commons and lords
                    helpers.mocked_handlers("events_both_houses.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["WhatsOnIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 55 events on at the Houses of Parliament today. 23 In the House of Commons and 32 in the House of Lords. Would you like to hear more?", "Would you like to hear more?", "What's on at Parliament?", "There are 55 events on at the Houses of Parliament today. 23 In the House of Commons and 32 in the House of Lords. Would you like to hear more?");

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
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 18 events on at the Houses of Parliament today. they are all in the House of Commons. Would you like to hear more?", "Would you like to hear more?", "What's on at Parliament?", "There are 18 events on at the Houses of Parliament today. they are all in the House of Commons. Would you like to hear more?");

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
                            expect(spy).to.have.been.calledWith(":askWithCard", "There are 16 events on at the Houses of Parliament today. they are all in the House of Lords. Would you like to hear more?", "Would you like to hear more?", "What's on at Parliament?", "There are 16 events on at the Houses of Parliament today. they are all in the House of Lords. Would you like to hear more?");

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
                        expect(spy).to.have.been.calledWith(":tellWithCard", "There are no events on at the Houses of Parliament today.", "What's on at Parliament?", "There are no events on at the Houses of Parliament today.");

                        done();
                    }, done);
                });
            });

            context("with a slot", function(){
                context("with a commons slot", function(){
                    context("with data", function(){
                        // Mock handlers with content for commons only
                        helpers.mocked_handlers("events_commons.json");

                        it("emits as expected", function(done){
                            let spy = sinon.spy(mocked_handlers, "emit");

                            mocked_handlers.event= { request: { intent: { slots: { house: { value: "commons" } } } } };

                            mocked_handlers["WhatsOnIntent"](function(done){
                                expect(spy).to.have.been.calledWith(":askWithCard", "There are 18 events on at the House of Commons today. Would you like to hear more?", "Would you like to hear more?", "What's on at Parliament?", "There are 18 events on at the House of Commons today. Would you like to hear more?");

                                done();
                            }, done);
                        });
                    });

                    context("without data", function(){
                        // Mock handlers with content for commons only
                        helpers.mocked_handlers("events_none.json");

                        it("emits as expected", function(done){
                            let spy = sinon.spy(mocked_handlers, "emit");

                            mocked_handlers.event= { request: { intent: { slots: { house: { value: "commons" } } } } };

                            mocked_handlers["WhatsOnIntent"](function(done){
                                expect(spy).to.have.been.calledWith(":tellWithCard", "There are no events on at the House of Commons today.", "What's on at Parliament?", "There are no events on at the House of Commons today.");

                                done();
                            }, done);
                        });
                    });
                });

                context("with a lords slot", function(){
                    context("with data", function(){
                        // Mock handlers with content for commons only
                        helpers.mocked_handlers("events_lords.json");

                        it("emits as expected", function(done){
                            let spy = sinon.spy(mocked_handlers, "emit");

                            mocked_handlers.event= { request: { intent: { slots: { house: { value: "lords" } } } } };

                            mocked_handlers["WhatsOnIntent"](function(done){
                                expect(spy).to.have.been.calledWith(":askWithCard", "There are 16 events on at the House of Lords today. Would you like to hear more?", "Would you like to hear more?", "What's on at Parliament?", "There are 16 events on at the House of Lords today. Would you like to hear more?");

                                done();
                            }, done);
                        });
                    });

                    context("without data", function(){
                        // Mock handlers with content for commons only
                        helpers.mocked_handlers("events_none.json");

                        it("emits as expected", function(done){
                            let spy = sinon.spy(mocked_handlers, "emit");

                            mocked_handlers.event= { request: { intent: { slots: { house: { value: "lords" } } } } };

                            mocked_handlers["WhatsOnIntent"](function(done){
                                expect(spy).to.have.been.calledWith(":tellWithCard", "There are no events on at the House of Lords today.", "What's on at Parliament?", "There are no events on at the House of Lords today.");

                                done();
                            }, done);
                        });
                    });
                });
            });

            context("with a network error", function(){
                // Mock handlers with 404
                helpers.mocked_handlers("404.html");

                it("emits the error message", function(done){
                    let spy = sinon.spy(mocked_handlers, "emit");

                    mocked_handlers["WhatsOnIntent"](function(done){
                        expect(spy).to.have.been.calledWith(":tell", "Something went wrong, please try again later.");

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
            context("with no houseOfInterest set", function(){
                context("with content for both houses", function(){
                    helpers.mocked_handlers("events_both_houses.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["AMAZON.YesIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tell", `in the House of Commons There are 7 Main Chamber events <p><s><prosody pitch="low"> starting at 11:30 , Oral questions </prosody></s>Health, including Topical Questions</p> <p><s><prosody pitch="low"> Urgent question </prosody></s>Allegations of money laundering against British banks</p> <p><s><prosody pitch="low"> Ten Minute Rule Motion </prosody></s>Short and holiday-let Accommodation (Notification of Local Authorities)</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Intellectual Property (Unjustified Threats) Bill [HL] - Report stage</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Intellectual Property (Unjustified Threats) Bill [HL] - 3rd reading</p> <p><s><prosody pitch="low"> Debate </prosody></s>Fuel poverty</p> <p><s><prosody pitch="low"> Adjournment </prosody></s>Public health guidance and baby loss</p> <break strength="strong" /> There are 5 Westminster Hall events <p><s><prosody pitch="low"> From 09:30 till 11:00 - Westminster Hall debate </prosody></s>Relationship between the DVLA and private car parking companies</p> <p><s><prosody pitch="low"> From 11:00 till 11:30 - Westminster Hall debate </prosody></s>60th anniversary of the Treaty of Rome</p> <p><s><prosody pitch="low"> From 14:30 till 16:00 - Westminster Hall debate </prosody></s>UN international day for the elimination of racial discrimination</p> <p><s><prosody pitch="low"> From 16:00 till 16:30 - Westminster Hall debate </prosody></s>Pensions in the nuclear decommissioning industry</p> <p><s><prosody pitch="low"> From 16:30 till 17:30 - Westminster Hall debate </prosody></s>Stoke on Trent City of Culture 2021</p> <break strength="strong" /> <break strength="x-strong" /> in the House of Lords There are 9 Main Chamber events <p><s><prosody pitch="low"> starting at 14:30 , Oral questions </prosody></s>Commitment to global forest programmes to improve governance and reduce deforestation</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Pension rights of spouses and civil partners of police officers killed in the line of duty</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Public health in Occupied Territories of Palestine and international action to keep Gaza Strip habitable</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Government's response to the Education Policy Institute report on the new funding formula for schools </p> <p><s><prosody pitch="low"> Legislation </prosody></s>Parking Places (Variation of Charges) Bill - 3rd reading</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Broadcasting (Radio Multiplex Services)  Bill - 3rd reading</p> <p><s><prosody pitch="low"> Debate </prosody></s>Armed Forces Act (Continuation) Order 2017 and the current challenges to the international rules-based order, the preparedness of the UK’s Armed Forces and the NATO Alliance and the promotion of defence and security interests</p> <p><s><prosody pitch="low"> Short debate </prosody></s>European Union Select Committee Report: 'Brexit: Gibraltar'</p> <p><s><prosody pitch="low"> starting at 22:00 , Estimated rising time </prosody></s><break strength="strong" /></p> <break strength="strong" /> <break strength="x-strong" /> That's all for today.`);

                            done();
                        }, done);
                    })
                })

                context("with content for commons only", function(){
                    helpers.mocked_handlers("events_commons.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["AMAZON.YesIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tell", `in the House of Commons There are 6 Main Chamber events <p><s><prosody pitch="low"> starting at 14:30 , Oral questions </prosody></s>Chancellor of the Exchequer, including Topical Questions</p> <p><s><prosody pitch="low"> Business Statement </prosody></s>Business Statement from the Leader of the House</p> <p><s><prosody pitch="low"> Statement </prosody></s>Syria and North Korea</p> <p><s><prosody pitch="low"> Ten Minute Rule Motion </prosody></s>Parish Council Governance (Principles of Public Life)</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Finance (No. 2) Bill - 2nd reading</p> <p><s><prosody pitch="low"> Adjournment </prosody></s>Mitigating support for Employment Support Allowance Work Related Activity Group</p> <break strength="strong" /> There are 5 Westminster Hall events <p><s><prosody pitch="low"> From 11:30 till 13:00 - Westminster Hall debate </prosody></s>The Child Maintenance Service</p> <p><s><prosody pitch="low"> From 13:00 till 13:30 - Westminster Hall debate </prosody></s>The relationship between the Serious Fraud Office and other agencies</p> <p><s><prosody pitch="low"> From 16:30 till 18:00 - Westminster Hall debate </prosody></s>The Future Accommodation Model</p> <p><s><prosody pitch="low"> From 18:00 till 18:30 - Westminster Hall debate </prosody></s>The role of employers in improving work outcomes for people with long-term health problems</p> <p><s><prosody pitch="low"> From 18:30 till 19:30 - Westminster Hall debate </prosody></s>The regulatory role of the Royal Institution of Chartered Surveyors in Law of Property Act receiverships</p> <break strength="strong" /> <break strength="x-strong" /> in the House of Lords There are no events <break strength="x-strong" /> That's all for today.`);

                            done();
                        }, done);
                    })
                })

                context("with content for lords only", function(){
                    helpers.mocked_handlers("events_lords.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["AMAZON.YesIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tell", `in the House of Commons There are no events <break strength="x-strong" /> in the House of Lords There are 10 Main Chamber events <p><s><prosody pitch="low"> starting at 15:00 , Oral questions </prosody></s>Sustainability of the National Health Service and adult social care</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Local authority submissions for the Department of Work and Pensions Family Offer programme</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Ensuring that young people also have the interpersonal skills required to succeed in the workplace </p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Proposed contractual arrangements between HS2 and CH2M</p> <p><s><prosody pitch="low"> Private Notice Question </prosody></s>Government response to chemical attack carried out by the Syrian Government on civilians in the town of Khan Sheikhoun </p> <p><s><prosody pitch="low"> Legislation </prosody></s>Health Service Medical Supplies (Costs) Bill - Consideration of Commons amendments - Lord O’Shaughnessy</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Pension Schemes Bill [HL] - Consideration of Commons amendments</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Digital Economy  Bill - 3rd reading</p> <p><s><prosody pitch="low"> Orders and regulations </prosody></s>Higher Education (Basic Amount) (England) Regulations 2016 and Higher Education (Higher Amount) (England) Regulations 2016 - motion to regret</p> <p><s><prosody pitch="low"> starting at 20:00 , Estimated rising time </prosody></s><break strength="strong" /></p> <break strength="strong" /> <break strength="x-strong" /> That's all for today.`);

                            done();
                        }, done);
                    })
                })

                context("with no content", function(){
                    helpers.mocked_handlers("events_none.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["AMAZON.YesIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tell", `in the House of Commons There are no events <break strength="x-strong" /> in the House of Lords There are no events <break strength="x-strong" /> That's all for today.`);

                            done();
                        }, done);
                    })
                })

                context("with a network error", function(){
                    helpers.mocked_handlers("404.html");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers["AMAZON.YesIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tell", `Something went wrong, please try again later.`);

                            done();
                        }, done);
                    })
                })
            })

            context("with houseOfInterest set as commons", function(){
                context("with content", function(){
                    helpers.mocked_handlers("events_commons.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers.attributes.houseOfInterest = "commons";

                        mocked_handlers["AMAZON.YesIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tell", `There are 6 Main Chamber events <p><s><prosody pitch="low"> starting at 14:30 , Oral questions </prosody></s>Chancellor of the Exchequer, including Topical Questions</p> <p><s><prosody pitch="low"> Business Statement </prosody></s>Business Statement from the Leader of the House</p> <p><s><prosody pitch="low"> Statement </prosody></s>Syria and North Korea</p> <p><s><prosody pitch="low"> Ten Minute Rule Motion </prosody></s>Parish Council Governance (Principles of Public Life)</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Finance (No. 2) Bill - 2nd reading</p> <p><s><prosody pitch="low"> Adjournment </prosody></s>Mitigating support for Employment Support Allowance Work Related Activity Group</p> <break strength="strong" /> There are 5 Westminster Hall events <p><s><prosody pitch="low"> From 11:30 till 13:00 - Westminster Hall debate </prosody></s>The Child Maintenance Service</p> <p><s><prosody pitch="low"> From 13:00 till 13:30 - Westminster Hall debate </prosody></s>The relationship between the Serious Fraud Office and other agencies</p> <p><s><prosody pitch="low"> From 16:30 till 18:00 - Westminster Hall debate </prosody></s>The Future Accommodation Model</p> <p><s><prosody pitch="low"> From 18:00 till 18:30 - Westminster Hall debate </prosody></s>The role of employers in improving work outcomes for people with long-term health problems</p> <p><s><prosody pitch="low"> From 18:30 till 19:30 - Westminster Hall debate </prosody></s>The regulatory role of the Royal Institution of Chartered Surveyors in Law of Property Act receiverships</p> <break strength="strong" /> <break strength="x-strong" /> That's all for today.`);

                            done();
                        }, done);
                    })
                })

                context("with no content", function(){
                    helpers.mocked_handlers("events_none.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers.attributes.houseOfInterest = "commons";

                        mocked_handlers["AMAZON.YesIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tell", `There are no events <break strength="x-strong" /> That's all for today.`);

                            done();
                        }, done);
                    })
                })
            })

            context("with houseOfInterest set as lords", function(){
                context("with content", function(){
                    helpers.mocked_handlers("events_lords.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers.attributes.houseOfInterest = "lords";

                        mocked_handlers["AMAZON.YesIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tell", `There are 10 Main Chamber events <p><s><prosody pitch="low"> starting at 15:00 , Oral questions </prosody></s>Sustainability of the National Health Service and adult social care</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Local authority submissions for the Department of Work and Pensions Family Offer programme</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Ensuring that young people also have the interpersonal skills required to succeed in the workplace </p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Proposed contractual arrangements between HS2 and CH2M</p> <p><s><prosody pitch="low"> Private Notice Question </prosody></s>Government response to chemical attack carried out by the Syrian Government on civilians in the town of Khan Sheikhoun </p> <p><s><prosody pitch="low"> Legislation </prosody></s>Health Service Medical Supplies (Costs) Bill - Consideration of Commons amendments - Lord O’Shaughnessy</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Pension Schemes Bill [HL] - Consideration of Commons amendments</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Digital Economy  Bill - 3rd reading</p> <p><s><prosody pitch="low"> Orders and regulations </prosody></s>Higher Education (Basic Amount) (England) Regulations 2016 and Higher Education (Higher Amount) (England) Regulations 2016 - motion to regret</p> <p><s><prosody pitch="low"> starting at 20:00 , Estimated rising time </prosody></s><break strength="strong" /></p> <break strength="strong" /> <break strength="x-strong" /> That's all for today.`);

                            done();
                        }, done);
                    })
                })

                context("with no content", function(){
                    helpers.mocked_handlers("events_none.json");

                    it("emits as expected", function(done){
                        let spy = sinon.spy(mocked_handlers, "emit");

                        mocked_handlers.attributes.houseOfInterest = "lords";

                        mocked_handlers["AMAZON.YesIntent"](function(done){
                            expect(spy).to.have.been.calledWith(":tell", `There are no events <break strength="x-strong" /> That's all for today.`);

                            done();
                        }, done);
                    })
                })
            })
        });

        describe("AMAZON.NoIntent", function(){
            it("emits as expected", function(){
                let spy = sinon.spy(handlers, "emit");

                handlers["AMAZON.NoIntent"]();

                expect(spy).to.have.been.calledWith(":tell", "Okay.");
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

                expect(spy).to.have.been.calledWith(":tell", "Okay.");
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
