const expect = require("chai").expect;         // Expectations
const assert = require("chai").assert;         // Assertions
const winston = require("winston");            // Async logging
const clearRequire = require("clear-require"); // Ablility to clear our require as needed.
const mockery = require("mockery");            // Mock external network requests
const mock = require("mock-require");
const sinon = require("sinon");

const KappaLambda = require('kappa-lambda');
const lambdaFile = '../../../index.js';
const kappaLambda = new KappaLambda(lambdaFile);

const helpers = require("../support/test_helpers").feature_helpers;

winston.level = "error";

describe("Parliament Alexa", function () {
    describe("LaunchRequest", function () {
        beforeEach(function(cb){
            event = helpers.getEvent("LaunchRequest.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Welcome to Parliament. Say, \'what\'s on\', to find out whats happening today at the Houses of Parliament. Or say, \'help\', for more information. </speak>');
        });

        it("should return reprompt outputSpeech matching string", function () {
            expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Try saying, \'what\'s on\'. </speak>');
        });

        it("should have shouldEndSession equal to false", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, false);
        });
    });

    describe("AMAZON.HelpIntent", function () {
        before(function(cb){
            event = helpers.getEvent("AMAZON.HelpIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Parliament for Alexa, can tell you what\'s on today at the Houses of Parliament. Try saying, \'what\'s on\', to hear about the events at both houses. Alternatively, say, \'whats on at the commons\', or, \'whats on in the lords\', to hear about the events at a specific house. </speak>');
        });

        it("should return reprompt outputSpeech matching string", function () {
            expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Try saying, \'what\'s on\'. </speak>');
        });

        it("should have shouldEndSession equal to false", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, false);
        });
    });

    describe("AMAZON.YesIntent", function () {
        before(function(cb){
            event = helpers.getEvent("AMAZON.YesIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak>  </speak>');
        });

        it("should have shouldEndSession equal to true", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, true);
        });
    });

    describe("AMAZON.NoIntent", function () {
        before(function(cb){
            event = helpers.getEvent("AMAZON.NoIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak>  </speak>');
        });

        it("should have shouldEndSession equal to true", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, true);
        });
    });

    describe("AMAZON.CancelIntent", function () {
        before(function(cb){
            event = helpers.getEvent("AMAZON.CancelIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak>  </speak>');
        });

        it("should have shouldEndSession equal to true", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, true);
        });
    });

    describe("AMAZON.StopIntent", function () {
        before(function(cb){
            event = helpers.getEvent("AMAZON.StopIntent.json");

            kappaLambda.execute(event, cb);
        });

        it("should return outputSpeech matching string", function () {
            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak>  </speak>');
        });

        it("should have shouldEndSession equal to true", function () {
            assert.equal(kappaLambda.done.response.shouldEndSession, true);
        });
    });

    describe("WhatsOnIntent", function(){
        context("with no house passed", function(){
            helpers.mocked_handlers("events_both_houses.json");

            beforeEach(function(cb){
                event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                kappaLambda.execute(event, cb);
            });

            it("should return outputSpeech matching string", function () {
                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 55 events on at the Houses of Parliament today. 23 In the House of Commons and 32 in the House of Lords. Would you like to hear more? </speak>');
            });

            it("should return reprompt outputSpeech matching string", function () {
                expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Would you like to hear more? </speak>');
            });

            it("should have shouldEndSession equal to false", function () {
                assert.equal(kappaLambda.done.response.shouldEndSession, false);
            });

            it("should return the expected card title", function () {
                expect(kappaLambda.done.response.card.title).to.have.string('What\'s on at Parliament?');
            });

            it("should return the expected card content", function () {
                expect(kappaLambda.done.response.card.content).to.have.string('There are 55 events on at the Houses of Parliament today. 23 In the House of Commons and 32 in the House of Lords.');
            });

            describe("Sending an AMAZON.YesIntent in response", function(){
                beforeEach(function(cb){
                    event = helpers.getEvent("AMAZON.YesIntent.json");
                    event.session.attributes = kappaLambda.done.sessionAttributes;

                    kappaLambda.execute(event, cb);
                });

                it("should return outputSpeech matching string", function () {
                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> in the House of Commons There are 7 Main Chamber events <p><s><prosody pitch="low"> Starting at 11:30 , Oral questions </prosody></s>Health, including Topical Questions</p> <p><s><prosody pitch="low"> Urgent question </prosody></s>Allegations of money laundering against British banks</p> <p><s><prosody pitch="low"> Ten Minute Rule Motion </prosody></s>Short and holiday-let Accommodation (Notification of Local Authorities)</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Intellectual Property (Unjustified Threats) Bill [HL] - Report stage</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Intellectual Property (Unjustified Threats) Bill [HL] - 3rd reading</p> <p><s><prosody pitch="low"> Debate </prosody></s>Fuel poverty</p> <p><s><prosody pitch="low"> Adjournment </prosody></s>Public health guidance and baby loss</p> <break strength="strong" /> There are 5 Westminster Hall events <p><s><prosody pitch="low"> From 09:30 till 11:00 - Westminster Hall debate </prosody></s>Relationship between the DVLA and private car parking companies</p> <p><s><prosody pitch="low"> From 11:00 till 11:30 - Westminster Hall debate </prosody></s>60th anniversary of the Treaty of Rome</p> <p><s><prosody pitch="low"> From 14:30 till 16:00 - Westminster Hall debate </prosody></s>UN international day for the elimination of racial discrimination</p> <p><s><prosody pitch="low"> From 16:00 till 16:30 - Westminster Hall debate </prosody></s>Pensions in the nuclear decommissioning industry</p> <p><s><prosody pitch="low"> From 16:30 till 17:30 - Westminster Hall debate </prosody></s>Stoke on Trent City of Culture 2021</p> <break strength="strong" /> <break strength="x-strong" /> in the House of Lords There are 9 Main Chamber events <p><s><prosody pitch="low"> Starting at 14:30 , Oral questions </prosody></s>Commitment to global forest programmes to improve governance and reduce deforestation</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Pension rights of spouses and civil partners of police officers killed in the line of duty</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Public health in Occupied Territories of Palestine and international action to keep Gaza Strip habitable</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Government\'s response to the Education Policy Institute report on the new funding formula for schools </p> <p><s><prosody pitch="low"> Legislation </prosody></s>Parking Places (Variation of Charges) Bill - 3rd reading</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Broadcasting (Radio Multiplex Services)  Bill - 3rd reading</p> <p><s><prosody pitch="low"> Debate </prosody></s>Armed Forces Act (Continuation) Order 2017 and the current challenges to the international rules-based order, the preparedness of the UK’s Armed Forces and the NATO Alliance and the promotion of defence and security interests</p> <p><s><prosody pitch="low"> Short debate </prosody></s>European Union Select Committee Report: \'Brexit: Gibraltar\'</p> <p><s><prosody pitch="low"> Starting at 22:00 , Estimated rising time </prosody></s><break strength="strong" /></p> <break strength="strong" /> <break strength="x-strong" /> That\'s all for today. </speak>');
                });

                it("should have shouldEndSession equal to true", function () {
                    assert.equal(kappaLambda.done.response.shouldEndSession, true);
                });
            });

            describe("Sending an AMAZON.NoIntent in response", function(){
                beforeEach(function(cb){
                    event = helpers.getEvent("AMAZON.NoIntent.json");
                    event.session.attributes = kappaLambda.done.sessionAttributes;

                    kappaLambda.execute(event, cb);
                });

                it("should return outputSpeech matching string", function () {
                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Okay. </speak>');
                });

                it("should have shouldEndSession equal to true", function () {
                    assert.equal(kappaLambda.done.response.shouldEndSession, true);
                });

                describe("Sending an LaunchRequest in response", function(){
                    beforeEach(function(cb){
                        event = helpers.getEvent("LaunchRequest.json");
                        event.session.attributes = kappaLambda.done.sessionAttributes;

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Welcome to Parliament. Say, \'what\'s on\', to find out whats happening today at the Houses of Parliament. Or say, \'help\', for more information. </speak>');
                    });

                    it("should have shouldEndSession equal to true", function () {
                        assert.equal(kappaLambda.done.response.shouldEndSession, false);
                    });
                });
            });

            describe("Sending an AMAZON.CancelIntent in response", function(){
                beforeEach(function(cb){
                    event = helpers.getEvent("AMAZON.CancelIntent.json");
                    event.session.attributes = kappaLambda.done.sessionAttributes;

                    kappaLambda.execute(event, cb);
                });

                it("should return outputSpeech matching string", function () {
                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Okay. </speak>');
                });

                it("should have shouldEndSession equal to true", function () {
                    assert.equal(kappaLambda.done.response.shouldEndSession, true);
                });
            });

            describe("Sending an AMAZON.StopIntent in response", function(){
                beforeEach(function(cb){
                    event = helpers.getEvent("AMAZON.StopIntent.json");
                    event.session.attributes = kappaLambda.done.sessionAttributes;

                    kappaLambda.execute(event, cb);
                });

                it("should return outputSpeech matching string", function () {
                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Okay. </speak>');
                });

                it("should have shouldEndSession equal to true", function () {
                    assert.equal(kappaLambda.done.response.shouldEndSession, true);
                });
            });

            describe("Sending an LaunchRequest in response", function(){
                beforeEach(function(cb){
                    event = helpers.getEvent("LaunchRequest.json");
                    event.session.attributes = kappaLambda.done.sessionAttributes;

                    kappaLambda.execute(event, cb);
                });

                it("should return outputSpeech matching string", function () {
                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Welcome to Parliament. Say, \'what\'s on\', to find out whats happening today at the Houses of Parliament. Or say, \'help\', for more information. </speak>');
                });

                it("should have shouldEndSession equal to true", function () {
                    assert.equal(kappaLambda.done.response.shouldEndSession, false);
                });
            });

            describe("Sending an AMAZON.HelpIntent in response", function(){
                beforeEach(function(cb){
                    event = helpers.getEvent("AMAZON.HelpIntent.json");
                    event.session.attributes = kappaLambda.done.sessionAttributes;

                    kappaLambda.execute(event, cb);
                });

                it("should return outputSpeech matching string", function () {
                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> You can either say, \'yes\', to hear more. Or, \'no\', to cancel. </speak>');
                });

                it("should have the same reprompt and outputSpeech string", function () {
                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(kappaLambda.done.response.reprompt.outputSpeech.ssml);
                });

                it("should have shouldEndSession equal to true", function () {
                    assert.equal(kappaLambda.done.response.shouldEndSession, false);
                });

                describe("Sending an AMAZON.YesIntent in response", function(){
                    beforeEach(function(cb){
                        event = helpers.getEvent("AMAZON.YesIntent.json");
                        event.session.attributes = kappaLambda.done.sessionAttributes;

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> in the House of Commons There are 7 Main Chamber events <p><s><prosody pitch="low"> Starting at 11:30 , Oral questions </prosody></s>Health, including Topical Questions</p> <p><s><prosody pitch="low"> Urgent question </prosody></s>Allegations of money laundering against British banks</p> <p><s><prosody pitch="low"> Ten Minute Rule Motion </prosody></s>Short and holiday-let Accommodation (Notification of Local Authorities)</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Intellectual Property (Unjustified Threats) Bill [HL] - Report stage</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Intellectual Property (Unjustified Threats) Bill [HL] - 3rd reading</p> <p><s><prosody pitch="low"> Debate </prosody></s>Fuel poverty</p> <p><s><prosody pitch="low"> Adjournment </prosody></s>Public health guidance and baby loss</p> <break strength="strong" /> There are 5 Westminster Hall events <p><s><prosody pitch="low"> From 09:30 till 11:00 - Westminster Hall debate </prosody></s>Relationship between the DVLA and private car parking companies</p> <p><s><prosody pitch="low"> From 11:00 till 11:30 - Westminster Hall debate </prosody></s>60th anniversary of the Treaty of Rome</p> <p><s><prosody pitch="low"> From 14:30 till 16:00 - Westminster Hall debate </prosody></s>UN international day for the elimination of racial discrimination</p> <p><s><prosody pitch="low"> From 16:00 till 16:30 - Westminster Hall debate </prosody></s>Pensions in the nuclear decommissioning industry</p> <p><s><prosody pitch="low"> From 16:30 till 17:30 - Westminster Hall debate </prosody></s>Stoke on Trent City of Culture 2021</p> <break strength="strong" /> <break strength="x-strong" /> in the House of Lords There are 9 Main Chamber events <p><s><prosody pitch="low"> Starting at 14:30 , Oral questions </prosody></s>Commitment to global forest programmes to improve governance and reduce deforestation</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Pension rights of spouses and civil partners of police officers killed in the line of duty</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Public health in Occupied Territories of Palestine and international action to keep Gaza Strip habitable</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Government\'s response to the Education Policy Institute report on the new funding formula for schools </p> <p><s><prosody pitch="low"> Legislation </prosody></s>Parking Places (Variation of Charges) Bill - 3rd reading</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Broadcasting (Radio Multiplex Services)  Bill - 3rd reading</p> <p><s><prosody pitch="low"> Debate </prosody></s>Armed Forces Act (Continuation) Order 2017 and the current challenges to the international rules-based order, the preparedness of the UK’s Armed Forces and the NATO Alliance and the promotion of defence and security interests</p> <p><s><prosody pitch="low"> Short debate </prosody></s>European Union Select Committee Report: \'Brexit: Gibraltar\'</p> <p><s><prosody pitch="low"> Starting at 22:00 , Estimated rising time </prosody></s><break strength="strong" /></p> <break strength="strong" /> <break strength="x-strong" /> That\'s all for today. </speak>');
                    });

                    it("should have shouldEndSession equal to true", function () {
                        assert.equal(kappaLambda.done.response.shouldEndSession, true);
                    });
                });
            });

            context("with events in only one house", function(){
                context("commons", function(){
                    beforeEach(function(){
                        helpers.reset_mockery();
                    });

                    helpers.mocked_handlers("events_commons.json");

                    beforeEach(function(cb){
                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");
                        event.session.attributes = kappaLambda.done.sessionAttributes;

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 18 events on at the Houses of Parliament today. they are all in the House of Commons. Would you like to hear more? </speak>');
                    });

                    describe("Sending an AMAZON.YesIntent in response", function() {
                        beforeEach(function (cb) {
                            event = helpers.getEvent("AMAZON.YesIntent.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> in the House of Commons There are 6 Main Chamber events <p><s><prosody pitch="low"> Starting at 14:30 , Oral questions </prosody></s>Chancellor of the Exchequer, including Topical Questions</p> <p><s><prosody pitch="low"> Business Statement </prosody></s>Business Statement from the Leader of the House</p> <p><s><prosody pitch="low"> Statement </prosody></s>Syria and North Korea</p> <p><s><prosody pitch="low"> Ten Minute Rule Motion </prosody></s>Parish Council Governance (Principles of Public Life)</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Finance (No. 2) Bill - 2nd reading</p> <p><s><prosody pitch="low"> Adjournment </prosody></s>Mitigating support for Employment Support Allowance Work Related Activity Group</p> <break strength="strong" /> There are 5 Westminster Hall events <p><s><prosody pitch="low"> From 11:30 till 13:00 - Westminster Hall debate </prosody></s>The Child Maintenance Service</p> <p><s><prosody pitch="low"> From 13:00 till 13:30 - Westminster Hall debate </prosody></s>The relationship between the Serious Fraud Office and other agencies</p> <p><s><prosody pitch="low"> From 16:30 till 18:00 - Westminster Hall debate </prosody></s>The Future Accommodation Model</p> <p><s><prosody pitch="low"> From 18:00 till 18:30 - Westminster Hall debate </prosody></s>The role of employers in improving work outcomes for people with long-term health problems</p> <p><s><prosody pitch="low"> From 18:30 till 19:30 - Westminster Hall debate </prosody></s>The regulatory role of the Royal Institution of Chartered Surveyors in Law of Property Act receiverships</p> <break strength="strong" /> <break strength="x-strong" /> in the House of Lords There are no events <break strength="x-strong" /> That\'s all for today. </speak>');
                        });
                    });
                });

                context("lords", function(){
                    beforeEach(function(){
                        helpers.reset_mockery();
                    });

                    helpers.mocked_handlers("events_lords.json");

                    beforeEach(function(cb){
                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");
                        event.session.attributes = kappaLambda.done.sessionAttributes;

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 16 events on at the Houses of Parliament today. they are all in the House of Lords. Would you like to hear more? </speak>');
                    });

                    describe("Sending an AMAZON.YesIntent in response", function() {
                        beforeEach(function (cb) {
                            event = helpers.getEvent("AMAZON.YesIntent.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> in the House of Commons There are no events <break strength="x-strong" /> in the House of Lords There are 10 Main Chamber events <p><s><prosody pitch="low"> Starting at 15:00 , Oral questions </prosody></s>Sustainability of the National Health Service and adult social care</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Local authority submissions for the Department of Work and Pensions Family Offer programme</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Ensuring that young people also have the interpersonal skills required to succeed in the workplace </p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Proposed contractual arrangements between HS2 and CH2M</p> <p><s><prosody pitch="low"> Private Notice Question </prosody></s>Government response to chemical attack carried out by the Syrian Government on civilians in the town of Khan Sheikhoun </p> <p><s><prosody pitch="low"> Legislation </prosody></s>Health Service Medical Supplies (Costs) Bill - Consideration of Commons amendments - Lord O’Shaughnessy</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Pension Schemes Bill [HL] - Consideration of Commons amendments</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Digital Economy  Bill - 3rd reading</p> <p><s><prosody pitch="low"> Orders and regulations </prosody></s>Higher Education (Basic Amount) (England) Regulations 2016 and Higher Education (Higher Amount) (England) Regulations 2016 - motion to regret</p> <p><s><prosody pitch="low"> Starting at 20:00 , Estimated rising time </prosody></s><break strength="strong" /></p> <break strength="strong" /> <break strength="x-strong" /> That\'s all for today. </speak>');
                        });
                    });
                });
            });

            context("with no events", function(){
                context("with multiple future events", function(){
                    beforeEach(function(){
                        helpers.reset_mockery();
                    });

                    helpers.mocked_handlers("events_none.json", "events_future.json");

                    beforeEach(function(cb){
                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");
                        event.session.attributes = kappaLambda.done.sessionAttributes;

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the Houses of Parliament today. The next event will be on Wednesday <say-as interpret-as="date" format="ymd">2017-06-21</say-as>. Starting at 11:25. Would you like to hear more? </speak>');
                    });

                    it("should have shouldEndSession equal to false", function () {
                        assert.equal(kappaLambda.done.response.shouldEndSession, false);
                    });

                    describe("Sending an AMAZON.YesIntent in response", function() {
                        beforeEach(function (cb) {
                            event = helpers.getEvent("AMAZON.YesIntent.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching the expected string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> in the House of Commons There are 4 Main Chamber events <p><s><prosody pitch="low"> Starting at 11:25 , State Opening of Parliament </prosody></s>State Opening of Parliament</p> <p><s><prosody pitch="low"> Starting at 13:45 , Business </prosody></s>Swearing in of Members of the Commons</p> <p><s><prosody pitch="low"> Starting at 14:30 , Debate on the Address </prosody></s>Queen\'s Speech Debate</p> <p><s><prosody pitch="low"> Adjournment </prosody></s>Cost of telephone calls to the Department for Work and Pensions</p> <break strength="strong" /> <break strength="x-strong" /> in the House of Lords There are 2 Main Chamber events <p><s><prosody pitch="low"> Starting at 11:30 , State Opening of Parliament </prosody></s> </p> <p><s><prosody pitch="low"> Starting at 15:30 , Motion for Humble Address </prosody></s><break strength="strong" /></p> <break strength="strong" /> <break strength="x-strong" /> </speak>');
                        });
                    });
                });

                context("with a single future event", function(){
                    beforeEach(function(){
                        helpers.reset_mockery();
                    });

                    helpers.mocked_handlers("events_none.json", "events_future_single.json");

                    beforeEach(function(cb){
                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");
                        event.session.attributes = kappaLambda.done.sessionAttributes;

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the Houses of Parliament today. The next event will be on Tuesday <say-as interpret-as="date" format="ymd">2017-06-13</say-as>. on <say-as interpret-as="date" format="ymd">2017-06-13</say-as>. in the House of Commons There is 1 Main Chamber event <p><s><prosody pitch="low"> Starting at 14:30 , Business </prosody></s>Election of Commons Speaker</p> <break strength="strong" /> <break strength="x-strong" /> </speak>');
                    });

                    it("should have shouldEndSession equal to true", function () {
                        assert.equal(kappaLambda.done.response.shouldEndSession, true);
                    });
                });

                context("with no future events", function(){
                    beforeEach(function(){
                        helpers.reset_mockery();
                    });

                    helpers.mocked_handlers("events_none.json", "events_none.json");

                    beforeEach(function(cb){
                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the Houses of Parliament today. </speak>');
                    });
                })
            });

            context("with a 404 response", function(){
                beforeEach(function(){
                    helpers.reset_mockery();
                });

                helpers.mocked_handlers("404.html");

                beforeEach(function(cb){
                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");
                    event.session.attributes = kappaLambda.done.sessionAttributes;

                    kappaLambda.execute(event, cb);
                });

                it("should return outputSpeech matching string", function () {
                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Something went wrong, please try again later. </speak>');
                });

                it("should have shouldEndSession equal to true", function () {
                    assert.equal(kappaLambda.done.response.shouldEndSession, true);
                });

                describe("Sending an AMAZON.YesIntent in response", function() {
                    beforeEach(function (cb) {
                        event = helpers.getEvent("AMAZON.YesIntent.json");
                        event.session.attributes = kappaLambda.done.sessionAttributes;

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Something went wrong, please try again later. </speak>');
                    });
                });
            });
        });

        context("with a house passed", function(){
            context("house of lords", function(){
                context("with events", function(){
                    beforeEach(function(){
                        helpers.reset_mockery();
                    });

                    helpers.mocked_handlers("events_lords.json");

                    beforeEach(function(cb){
                        event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 16 events on at the House of Lords today. Would you like to hear more? </speak>');
                    });

                    context("with 'Lords' slot value", function () {
                        beforeEach(function(cb){
                            event = helpers.getEvent("WhatsOnIntent/lords_slot.json");
                            event.request.intent.slots.house.value = 'Lords';

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 16 events on at the House of Lords today. Would you like to hear more? </speak>');
                        });
                    });

                    describe("Sending an AMAZON.YesIntent in response", function() {
                        beforeEach(function (cb) {
                            event = helpers.getEvent("AMAZON.YesIntent.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 10 Main Chamber events <p><s><prosody pitch="low"> Starting at 15:00 , Oral questions </prosody></s>Sustainability of the National Health Service and adult social care</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Local authority submissions for the Department of Work and Pensions Family Offer programme</p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Ensuring that young people also have the interpersonal skills required to succeed in the workplace </p> <p><s><prosody pitch="low"> Oral questions </prosody></s>Proposed contractual arrangements between HS2 and CH2M</p> <p><s><prosody pitch="low"> Private Notice Question </prosody></s>Government response to chemical attack carried out by the Syrian Government on civilians in the town of Khan Sheikhoun </p> <p><s><prosody pitch="low"> Legislation </prosody></s>Health Service Medical Supplies (Costs) Bill - Consideration of Commons amendments - Lord O’Shaughnessy</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Pension Schemes Bill [HL] - Consideration of Commons amendments</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Digital Economy  Bill - 3rd reading</p> <p><s><prosody pitch="low"> Orders and regulations </prosody></s>Higher Education (Basic Amount) (England) Regulations 2016 and Higher Education (Higher Amount) (England) Regulations 2016 - motion to regret</p> <p><s><prosody pitch="low"> Starting at 20:00 , Estimated rising time </prosody></s><break strength="strong" /></p> <break strength="strong" /> <break strength="x-strong" /> That\'s all for today. </speak>');
                        });
                    });
                });

                context("with no events", function(){
                    beforeEach(function(){
                        helpers.reset_mockery();
                    });

                    helpers.mocked_handlers("events_none.json", "events_future.json");

                    beforeEach(function(cb){
                        event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the House of Lords today. The next event will be on Wednesday <say-as interpret-as="date" format="ymd">2017-06-21</say-as>. Starting at 11:25. Would you like to hear more? </speak>');
                    });

                    it("should have shouldEndSession equal to false", function () {
                        assert.equal(kappaLambda.done.response.shouldEndSession, false);
                    });

                    describe("Sending an AMAZON.YesIntent in response", function() {
                        beforeEach(function (cb) {
                            event = helpers.getEvent("AMAZON.YesIntent.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching an empty string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 2 Main Chamber events <p><s><prosody pitch="low"> Starting at 11:30 , State Opening of Parliament </prosody></s> </p> <p><s><prosody pitch="low"> Starting at 15:30 , Motion for Humble Address </prosody></s><break strength="strong" /></p> <break strength="strong" /> <break strength="x-strong" /> </speak>');
                        });
                    });

                    context("with no future events", function(){
                        beforeEach(function(){
                            helpers.reset_mockery();
                        });

                        helpers.mocked_handlers("events_none.json", "events_none.json");

                        beforeEach(function(cb){
                            event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the House of Lords today. </speak>');
                        });
                    });

                    context("with a single future event", function(){
                        beforeEach(function(){
                            helpers.reset_mockery();
                        });

                        helpers.mocked_handlers("events_none.json", "events_future_single_lords.json");

                        beforeEach(function(cb){
                            event = helpers.getEvent("WhatsOnIntent/lords_slot.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the House of Lords today. The next event will be on Tuesday <say-as interpret-as="date" format="ymd">2017-06-13</say-as>. on <say-as interpret-as="date" format="ymd">2017-06-13</say-as>. in the House of Lords There is 1 Main Chamber event <p><s><prosody pitch="low"> Starting at 14:30 , Business </prosody></s>Election of Commons Speaker</p> <break strength="strong" /> <break strength="x-strong" /> </speak>');
                        });

                        it("should have shouldEndSession equal to true", function () {
                            assert.equal(kappaLambda.done.response.shouldEndSession, true);
                        });
                    });
                });
            });

            context("house of commons", function(){
                context("with events", function(){
                    beforeEach(function(){
                        helpers.reset_mockery();
                    });

                    helpers.mocked_handlers("events_commons.json");

                    beforeEach(function(cb){
                        event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 18 events on at the House of Commons today. Would you like to hear more? </speak>');
                    });

                    context("with 'Commons' slot value", function () {
                        beforeEach(function(cb){
                            event = helpers.getEvent("WhatsOnIntent/commons_slot.json");
                            event.request.intent.slots.house.value = 'Commons';

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 18 events on at the House of Commons today. Would you like to hear more? </speak>');
                        });
                    });

                    describe("Sending an AMAZON.YesIntent in response", function() {
                        beforeEach(function (cb) {
                            event = helpers.getEvent("AMAZON.YesIntent.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 6 Main Chamber events <p><s><prosody pitch="low"> Starting at 14:30 , Oral questions </prosody></s>Chancellor of the Exchequer, including Topical Questions</p> <p><s><prosody pitch="low"> Business Statement </prosody></s>Business Statement from the Leader of the House</p> <p><s><prosody pitch="low"> Statement </prosody></s>Syria and North Korea</p> <p><s><prosody pitch="low"> Ten Minute Rule Motion </prosody></s>Parish Council Governance (Principles of Public Life)</p> <p><s><prosody pitch="low"> Legislation </prosody></s>Finance (No. 2) Bill - 2nd reading</p> <p><s><prosody pitch="low"> Adjournment </prosody></s>Mitigating support for Employment Support Allowance Work Related Activity Group</p> <break strength="strong" /> There are 5 Westminster Hall events <p><s><prosody pitch="low"> From 11:30 till 13:00 - Westminster Hall debate </prosody></s>The Child Maintenance Service</p> <p><s><prosody pitch="low"> From 13:00 till 13:30 - Westminster Hall debate </prosody></s>The relationship between the Serious Fraud Office and other agencies</p> <p><s><prosody pitch="low"> From 16:30 till 18:00 - Westminster Hall debate </prosody></s>The Future Accommodation Model</p> <p><s><prosody pitch="low"> From 18:00 till 18:30 - Westminster Hall debate </prosody></s>The role of employers in improving work outcomes for people with long-term health problems</p> <p><s><prosody pitch="low"> From 18:30 till 19:30 - Westminster Hall debate </prosody></s>The regulatory role of the Royal Institution of Chartered Surveyors in Law of Property Act receiverships</p> <break strength="strong" /> <break strength="x-strong" /> That\'s all for today. </speak>');
                        });
                    });
                });

                context("with no events", function(){
                    beforeEach(function(){
                        helpers.reset_mockery();
                    });

                    helpers.mocked_handlers("events_none.json", "events_future.json");

                    beforeEach(function(cb){
                        event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the House of Commons today. The next event will be on Wednesday <say-as interpret-as="date" format="ymd">2017-06-21</say-as>. Starting at 11:25. Would you like to hear more? </speak>');
                    });

                    it("should have shouldEndSession equal to false", function () {
                        assert.equal(kappaLambda.done.response.shouldEndSession, false);
                    });

                    describe("Sending an AMAZON.YesIntent in response", function() {
                        beforeEach(function (cb) {
                            event = helpers.getEvent("AMAZON.YesIntent.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech with the next day's events", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 4 Main Chamber events <p><s><prosody pitch="low"> Starting at 11:25 , State Opening of Parliament </prosody></s>State Opening of Parliament</p> <p><s><prosody pitch="low"> Starting at 13:45 , Business </prosody></s>Swearing in of Members of the Commons</p> <p><s><prosody pitch="low"> Starting at 14:30 , Debate on the Address </prosody></s>Queen\'s Speech Debate</p> <p><s><prosody pitch="low"> Adjournment </prosody></s>Cost of telephone calls to the Department for Work and Pensions</p> <break strength="strong" /> <break strength="x-strong" /> </speak>');
                        });
                    });

                    context("with no future events", function(){
                        beforeEach(function(){
                            helpers.reset_mockery();
                        });

                        helpers.mocked_handlers("events_none.json", "events_none.json");

                        beforeEach(function(cb){
                            event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the House of Commons today. </speak>');
                        });
                    });

                    context("with a single future event", function(){
                        beforeEach(function(){
                            helpers.reset_mockery();
                        });

                        helpers.mocked_handlers("events_none.json", "events_future_single.json");

                        beforeEach(function(cb){
                            event = helpers.getEvent("WhatsOnIntent/commons_slot.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the House of Commons today. The next event will be on Tuesday <say-as interpret-as="date" format="ymd">2017-06-13</say-as>. on <say-as interpret-as="date" format="ymd">2017-06-13</say-as>. in the House of Commons There is 1 Main Chamber event <p><s><prosody pitch="low"> Starting at 14:30 , Business </prosody></s>Election of Commons Speaker</p> <break strength="strong" /> <break strength="x-strong" /> </speak>');
                        });

                        it("should have shouldEndSession equal to true", function () {
                            assert.equal(kappaLambda.done.response.shouldEndSession, true);
                        });
                    });
                });
            });
        });
    });
});
