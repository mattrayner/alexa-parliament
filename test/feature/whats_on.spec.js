const expect = require("chai").expect;         // Expectations
const assert = require("chai").assert;         // Assertions
const winston = require("winston");            // Async logging
const clearRequire = require("clear-require"); // Ablility to clear our require as needed.
const mockery = require("mockery");            // Mock external network requests
const MockDate = require('mockdate');
const mock = require("mock-require");
const sinon = require("sinon");
const Mitm = require("mitm");
const fs = require("fs");
const Bluebird = require("bluebird");
const nock = require('nock');

const KappaLambda = require('kappa-lambda');
const lambdaFile = '../../../index.js';
const kappaLambda = new KappaLambda(lambdaFile);

const helpers = require("../support/test_helpers").feature_helpers;

winston.level = "error";

let event;
let kappaResponse;

describe("Parliament Alexa", function () {
    beforeEach(() => {
        MockDate.set('2017-03-21');
    });
    afterEach(() => {
        MockDate.reset();

        nock.cleanAll();
    });

    describe("WhatsOnIntent", function(){
        context('With Parliament sitting as normal', function(){
            beforeEach(() => {
                nock('http://service.calendar.parliament.uk')
                    .get('/calendar/events/nonsitting.json?date=today')
                    .reply(200, JSON.parse('[]'));
            });

            context("with no house passed", function(){
                beforeEach(function(cb){
                    let file_path = __dirname + "/../fixtures/external_data/events_both_houses.json";
                    let response = fs.readFileSync(file_path, "utf8");

                    nock('http://service.calendar.parliament.uk')
                        .get('/calendar/events/list.json?date=30days')
                        .reply(200, JSON.parse(response.trim()));
                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                    kappaLambda.execute(event, cb);
                });

                it("should return outputSpeech matching string", function () {
                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 55 events on at the Houses of Parliament today. 23 in the House of Commons and 32 in the House of Lords. Would you like to hear more? </speak>');
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
                    expect(kappaLambda.done.response.card.content).to.have.string('There are 55 events on at the Houses of Parliament today. 23 in the House of Commons and 32 in the House of Lords.');
                });

                describe("Sending an AMAZON.YesIntent in response", function(){
                    beforeEach(function(cb){
                        event = helpers.getEvent("AMAZON.YesIntent.json");
                        event.session.attributes = kappaLambda.done.sessionAttributes;

                        kappaLambda.execute(event, cb);
                    });

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> In the house of commons, There are 7 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, Oral questions</prosody></s>, <s>Health, including Topical Questions.</s></p> <p><s><prosody pitch="low">Urgent question</prosody></s>, <s>Allegations of money laundering against British banks<break time="0.25s" />.</s></p> <p><s><prosody pitch="low">Ten Minute Rule Motion</prosody></s>, <s>Short and holiday-let Accommodation (Notification of Local Authorities).</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Intellectual Property (Unjustified Threats) Bill [HL] - Report stage.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Intellectual Property (Unjustified Threats) Bill [HL] - 3rd reading.</s></p> <p><s><prosody pitch="low">Debate</prosody></s>, <s>Fuel poverty.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Public health guidance and baby loss.</s></p> There are 5 Westminster Hall events. <p><s><prosody pitch="low">From 09:30, until 11:00,  Westminster Hall debate</prosody></s>, <s>Relationship between the DVLA and private car parking companies.</s></p> <p><s><prosody pitch="low">From 11:00, until 11:30,  Westminster Hall debate</prosody></s>, <s>60th anniversary of the Treaty of Rome.</s></p> <p><s><prosody pitch="low">From 14:30, until 16:00,  Westminster Hall debate</prosody></s>, <s>UN international day for the elimination of racial discrimination.</s></p> <p><s><prosody pitch="low">From 16:00, until 16:30,  Westminster Hall debate</prosody></s>, <s>Pensions in the nuclear decommissioning industry.</s></p> <p><s><prosody pitch="low">From 16:30, until 17:30,  Westminster Hall debate</prosody></s>, <s>Stoke on Trent City of Culture 2021.</s></p> There are 7 Select and Joint Committees events. Including 7 Oral Evidence Session events.<break time="0.5s" /> In the house of lords, There are 9 Main Chamber events. <p><s><prosody pitch="low">Starting at 14:30, Oral questions</prosody></s>, <s>Commitment to global forest programmes to improve governance and reduce deforestation.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Pension rights of spouses and civil partners of police officers killed in the line of duty.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Public health in Occupied Territories of Palestine and international action to keep Gaza Strip habitable.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Government\'s response to the Education Policy Institute report on the new funding formula for schools .</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Parking Places (Variation of Charges) Bill - 3rd reading.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Broadcasting (Radio Multiplex Services)  Bill - 3rd reading.</s></p> <p><s><prosody pitch="low">Debate</prosody></s>, <s>Armed Forces Act (Continuation) Order 2017 and the current challenges to the international rules-based order, the preparedness of the UK’s Armed Forces and the NATO Alliance and the promotion of defence and security interests.</s></p> <p><s><prosody pitch="low">Short debate</prosody></s>, <s>European Union Select Committee Report: \'Brexit: Gibraltar\'.</s></p> <p><s><prosody pitch="low">Starting at 22:00, Estimated rising time</prosody></s></p> There are 11 Select and Joint Committees events. Including, 7 Private Meeting events, 3 Oral Evidence Session events, and 1 Committee Visit event.<break time="0.5s" /> That is all. </speak>');
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
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Welcome to Parliament. Say, \'what\'s on\', to find out whats happening today at the Houses of Parliament. Say, who\'s my MP, to find out information about your MP. Or say, \'help\', for more information. </speak>');
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
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Welcome to Parliament. Say, \'what\'s on\', to find out whats happening today at the Houses of Parliament. Say, who\'s my MP, to find out information about your MP. Or say, \'help\', for more information. </speak>');
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
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of commons, There are 7 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, Oral questions</prosody></s>, <s>Health, including Topical Questions.</s></p> <p><s><prosody pitch="low">Urgent question</prosody></s>, <s>Allegations of money laundering against British banks<break time="0.25s" />.</s></p> <p><s><prosody pitch="low">Ten Minute Rule Motion</prosody></s>, <s>Short and holiday-let Accommodation (Notification of Local Authorities).</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Intellectual Property (Unjustified Threats) Bill [HL] - Report stage.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Intellectual Property (Unjustified Threats) Bill [HL] - 3rd reading.</s></p> <p><s><prosody pitch="low">Debate</prosody></s>, <s>Fuel poverty.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Public health guidance and baby loss.</s></p> There are 5 Westminster Hall events. <p><s><prosody pitch="low">From 09:30, until 11:00,  Westminster Hall debate</prosody></s>, <s>Relationship between the DVLA and private car parking companies.</s></p> <p><s><prosody pitch="low">From 11:00, until 11:30,  Westminster Hall debate</prosody></s>, <s>60th anniversary of the Treaty of Rome.</s></p> <p><s><prosody pitch="low">From 14:30, until 16:00,  Westminster Hall debate</prosody></s>, <s>UN international day for the elimination of racial discrimination.</s></p> <p><s><prosody pitch="low">From 16:00, until 16:30,  Westminster Hall debate</prosody></s>, <s>Pensions in the nuclear decommissioning industry.</s></p> <p><s><prosody pitch="low">From 16:30, until 17:30,  Westminster Hall debate</prosody></s>, <s>Stoke on Trent City of Culture 2021.</s></p> There are 7 Select and Joint Committees events. Including 7 Oral Evidence Session events.<break time="0.5s" /> In the house of lords, There are 9 Main Chamber events. <p><s><prosody pitch="low">Starting at 14:30, Oral questions</prosody></s>, <s>Commitment to global forest programmes to improve governance and reduce deforestation.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Pension rights of spouses and civil partners of police officers killed in the line of duty.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Public health in Occupied Territories of Palestine and international action to keep Gaza Strip habitable.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Government's response to the Education Policy Institute report on the new funding formula for schools .</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Parking Places (Variation of Charges) Bill - 3rd reading.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Broadcasting (Radio Multiplex Services)  Bill - 3rd reading.</s></p> <p><s><prosody pitch="low">Debate</prosody></s>, <s>Armed Forces Act (Continuation) Order 2017 and the current challenges to the international rules-based order, the preparedness of the UK’s Armed Forces and the NATO Alliance and the promotion of defence and security interests.</s></p> <p><s><prosody pitch="low">Short debate</prosody></s>, <s>European Union Select Committee Report: 'Brexit: Gibraltar'.</s></p> <p><s><prosody pitch="low">Starting at 22:00, Estimated rising time</prosody></s></p> There are 11 Select and Joint Committees events. Including, 7 Private Meeting events, 3 Oral Evidence Session events, and 1 Committee Visit event.<break time="0.5s" /> That is all. </speak>`);
                        });

                        it("should have shouldEndSession equal to true", function () {
                            assert.equal(kappaLambda.done.response.shouldEndSession, true);
                        });
                    });
                });

                context("with events in only one house", function(){
                    beforeEach(() => {
                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse('[]'));
                    });

                    context("commons", function(){
                        beforeEach(function(cb){
                            MockDate.set('2017-04-18');

                            let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                            let response = fs.readFileSync(file_path, "utf8");

                            nock('http://service.calendar.parliament.uk')
                                .get('/calendar/events/list.json?date=30days')
                                .reply(200, JSON.parse(response.trim()));

                            event = helpers.getEvent("WhatsOnIntent/no_slots.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 18 events on at the Houses of Parliament today. They are all in the House of Commons. Would you like to hear more? </speak>');
                        });

                        describe("Sending an AMAZON.YesIntent in response", function() {
                            beforeEach(function (cb) {
                                event = helpers.getEvent("AMAZON.YesIntent.json");
                                event.session.attributes = kappaLambda.done.sessionAttributes;

                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of commons, There are 6 Main Chamber events. <p><s><prosody pitch="low">Starting at 14:30, Oral questions</prosody></s>, <s>Chancellor of the Exchequer, including Topical Questions.</s></p> <p><s><prosody pitch="low">Business Statement</prosody></s>, <s>Business Statement from the Leader of the House.</s></p> <p><s><prosody pitch="low">Statement</prosody></s>, <s>Syria and North Korea.</s></p> <p><s><prosody pitch="low">Ten Minute Rule Motion</prosody></s>, <s>Parish Council Governance (Principles of Public Life).</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Finance (No. 2) Bill - 2nd reading.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Mitigating support for Employment Support Allowance Work Related Activity Group.</s></p> There are 5 Westminster Hall events. <p><s><prosody pitch="low">From 11:30, until 13:00,  Westminster Hall debate</prosody></s>, <s>The Child Maintenance Service.</s></p> <p><s><prosody pitch="low">From 13:00, until 13:30,  Westminster Hall debate</prosody></s>, <s>The relationship between the Serious Fraud Office and other agencies.</s></p> <p><s><prosody pitch="low">From 16:30, until 18:00,  Westminster Hall debate</prosody></s>, <s>The Future Accommodation Model.</s></p> <p><s><prosody pitch="low">From 18:00, until 18:30,  Westminster Hall debate</prosody></s>, <s>The role of employers in improving work outcomes for people with long-term health problems.</s></p> <p><s><prosody pitch="low">From 18:30, until 19:30,  Westminster Hall debate</prosody></s>, <s>The regulatory role of the Royal Institution of Chartered Surveyors in Law of Property Act receiverships.</s></p> There are 4 Select and Joint Committees events. Including 4 Oral Evidence Session events.<break time="0.5s" /> That is all. </speak>`);
                            });
                        });
                    });

                    context("lords", function(){
                        beforeEach(function(cb){
                            MockDate.set('2017-04-05');

                            let file_path = __dirname + "/../fixtures/external_data/events_lords.json";
                            let response = fs.readFileSync(file_path, "utf8");

                            nock('http://service.calendar.parliament.uk')
                                .get('/calendar/events/list.json?date=30days')
                                .reply(200, JSON.parse(response.trim()));

                            event = helpers.getEvent("WhatsOnIntent/no_slots.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 16 events on at the Houses of Parliament today. They are all in the House of Lords. Would you like to hear more? </speak>');
                        });

                        describe("Sending an AMAZON.YesIntent in response", function() {
                            beforeEach(function (cb) {
                                event = helpers.getEvent("AMAZON.YesIntent.json");
                                event.session.attributes = kappaLambda.done.sessionAttributes;

                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of lords, There are 10 Main Chamber events. <p><s><prosody pitch="low">Starting at 15:00, Oral questions</prosody></s>, <s>Sustainability of the National Health Service and adult social care.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Local authority submissions for the Department of Work and Pensions Family Offer programme.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Ensuring that young people also have the interpersonal skills required to succeed in the workplace <break time="0.25s" />.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Proposed contractual arrangements between HS2 and CH2M.</s></p> <p><s><prosody pitch="low">Private Notice Question</prosody></s>, <s>Government response to chemical attack carried out by the Syrian Government on civilians in the town of Khan Sheikhoun .</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Health Service Medical Supplies (Costs) Bill - Consideration of Commons amendments - Lord O’Shaughnessy.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Pension Schemes Bill [HL] - Consideration of Commons amendments.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Digital Economy  Bill - 3rd reading.</s></p> <p><s><prosody pitch="low">Orders and regulations</prosody></s>, <s>Higher Education (Basic Amount) (England) Regulations 2016 and Higher Education (Higher Amount) (England) Regulations 2016 - motion to regret.</s></p> <p><s><prosody pitch="low">Starting at 20:00, Estimated rising time</prosody></s></p> There are 6 Select and Joint Committees events. Including, 2 Oral Evidence Session events, and 4 Private Meeting events.<break time="0.5s" /> That is all. </speak>`);
                            });
                        });
                    });
                });

                context("with no events", function(){
                    context("with multiple future events", function(){
                        beforeEach(function(cb){
                            MockDate.set('2017-04-05');

                            let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                            let response = fs.readFileSync(file_path, "utf8");

                            nock('http://service.calendar.parliament.uk')
                                .get('/calendar/events/list.json?date=30days')
                                .reply(200, JSON.parse(response.trim()));

                            event = helpers.getEvent("WhatsOnIntent/no_slots.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> There are no events on at the Houses of Parliament today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>`);
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
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                            });
                        });
                    });

                    context("with a single future event", function(){
                        beforeEach(function(cb){
                            MockDate.set('2017-04-05');

                            let file_path = __dirname + "/../fixtures/external_data/events_future_single.json";
                            let response = fs.readFileSync(file_path, "utf8");

                            nock('http://service.calendar.parliament.uk')
                                .get('/calendar/events/list.json?date=30days')
                                .reply(200, JSON.parse(response.trim()));

                            event = helpers.getEvent("WhatsOnIntent/no_slots.json");
                            event.session.attributes = kappaLambda.done.sessionAttributes;

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> There are no events on at the Houses of Parliament today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>, in the House of Commons.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>`);
                        });

                        it("should have shouldEndSession equal to true", function () {
                            assert.equal(kappaLambda.done.response.shouldEndSession, true);
                        });
                    });

                    context("with no future events", function(){
                        beforeEach(function(cb){
                            MockDate.set('2017-04-05');

                            let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                            let response = fs.readFileSync(file_path, "utf8");

                            nock('http://service.calendar.parliament.uk')
                                .get('/calendar/events/list.json?date=30days')
                                .reply(200, JSON.parse(response.trim()));

                            event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the Houses of Parliament today. </speak>');
                        });
                    })
                });

                context("with a 404 response", function(){
                    beforeEach(function(cb){
                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/list.json?date=30days')
                            .reply(404, '');

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
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> Something went wrong. Please try again. </speak>');
                        });
                    });
                });
            });

            context("with a house passed", function(){
                context("invalid house", function(){
                    beforeEach(function(cb){
                        MockDate.set('2017-04-18');

                        let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/list.json?date=30days&house=commons')
                            .reply(200, JSON.parse(response.trim()));

                        event = helpers.getEvent("WhatsOnIntent/error_slot.json");
                        kappaLambda.execute(event, cb);
                    })

                    it("should return outputSpeech matching string", function () {
                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> I heard, foo. Did you mean, \'commons\', \'lords\', or, \'both\'? </speak>');
                    });

                    it("should return reprompt speech matching string", function () {
                        expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Did you mean, \'commons\', \'lords\', or, \'both\'? </speak>');
                    });

                    describe("responding with HouseIntent", function(){
                        context("with a valid house slot", function(){
                            beforeEach(function(cb){
                                event = helpers.getEvent("HouseIntent/valid_slot.json");
                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 18 events on at the House of Commons today. Would you like to hear more? </speak>');
                            });

                            it("should return reprompt speech matching string", function () {
                                expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Would you like to hear more? </speak>');
                            });
                        });

                        context("with an invalid house slot", function(){
                            beforeEach(function(cb){
                                event = helpers.getEvent("HouseIntent/invalid_slot.json");
                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> I heard, foo. Did you mean, \'commons\', \'lords\', or, \'both\'? </speak>');
                            });

                            it("should return reprompt speech matching string", function () {
                                expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Did you mean, \'commons\', \'lords\', or, \'both\'? </speak>');
                            });
                        });
                    })
                });

                context("house of lords", function(){
                    context("with events", function(){
                        beforeEach(function(cb){
                            MockDate.set('2017-04-05');

                            let file_path = __dirname + "/../fixtures/external_data/events_lords.json";
                            let response = fs.readFileSync(file_path, "utf8");

                            nock('http://service.calendar.parliament.uk')
                                .get('/calendar/events/list.json?date=30days&house=lords')
                                .reply(200, JSON.parse(response.trim()));

                            event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 16 events on at the House of Lords today. Would you like to hear more? </speak>');
                        });

                        context("with 'Lords' slot value", function () {
                            beforeEach(function(cb){
                                MockDate.set('2017-04-05');

                                let file_path = __dirname + "/../fixtures/external_data/events_lords.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=lords')
                                    .reply(200, JSON.parse(response.trim()));

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
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of lords, There are 10 Main Chamber events. <p><s><prosody pitch="low">Starting at 15:00, Oral questions</prosody></s>, <s>Sustainability of the National Health Service and adult social care.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Local authority submissions for the Department of Work and Pensions Family Offer programme.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Ensuring that young people also have the interpersonal skills required to succeed in the workplace <break time="0.25s" />.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Proposed contractual arrangements between HS2 and CH2M.</s></p> <p><s><prosody pitch="low">Private Notice Question</prosody></s>, <s>Government response to chemical attack carried out by the Syrian Government on civilians in the town of Khan Sheikhoun .</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Health Service Medical Supplies (Costs) Bill - Consideration of Commons amendments - Lord O’Shaughnessy.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Pension Schemes Bill [HL] - Consideration of Commons amendments.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Digital Economy  Bill - 3rd reading.</s></p> <p><s><prosody pitch="low">Orders and regulations</prosody></s>, <s>Higher Education (Basic Amount) (England) Regulations 2016 and Higher Education (Higher Amount) (England) Regulations 2016 - motion to regret.</s></p> <p><s><prosody pitch="low">Starting at 20:00, Estimated rising time</prosody></s></p> There are 6 Select and Joint Committees events. Including, 2 Oral Evidence Session events, and 4 Private Meeting events.<break time="0.5s" /> That is all. </speak>`);
                            });
                        });
                    });

                    context("with no events", function(){
                        beforeEach(function(cb){
                            MockDate.set('2017-04-05');

                            let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                            let response = fs.readFileSync(file_path, "utf8");

                            nock('http://service.calendar.parliament.uk')
                                .get('/calendar/events/list.json?date=30days&house=lords')
                                .reply(200, JSON.parse(response.trim()));

                            event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> There are no events on at the House of Lords today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>`);
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
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                            });
                        });

                        context("with no future events", function(){
                            beforeEach(function(cb){
                                MockDate.set('2017-04-05');

                                let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=lords')
                                    .reply(200, JSON.parse(response.trim()));

                                event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the House of Lords today. </speak>');
                            });
                        });

                        context("with a single future event", function(){
                            beforeEach(function(cb){
                                MockDate.set('2017-04-05');

                                let file_path = __dirname + "/../fixtures/external_data/events_future_single_lords.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=lords')
                                    .reply(200, JSON.parse(response.trim()));

                                event = helpers.getEvent("WhatsOnIntent/lords_slot.json");
                                event.session.attributes = kappaLambda.done.sessionAttributes;

                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> There are no events on at the House of Lords today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>`);
                            });

                            it("should have shouldEndSession equal to true", function () {
                                assert.equal(kappaLambda.done.response.shouldEndSession, true);
                            });
                        });
                    });
                });

                context("house of commons", function(){
                    context("with events", function(){
                        beforeEach(function(cb){
                            MockDate.set('2017-04-18');

                            let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                            let response = fs.readFileSync(file_path, "utf8");

                            nock('http://service.calendar.parliament.uk')
                                .get('/calendar/events/list.json?date=30days&house=commons')
                                .reply(200, JSON.parse(response.trim()));

                            event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are 18 events on at the House of Commons today. Would you like to hear more? </speak>');
                        });

                        context("with 'Commons' slot value", function () {
                            beforeEach(function(cb){
                                MockDate.set('2017-04-18');

                                let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=commons')
                                    .reply(200, JSON.parse(response.trim()));

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
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of commons, There are 6 Main Chamber events. <p><s><prosody pitch="low">Starting at 14:30, Oral questions</prosody></s>, <s>Chancellor of the Exchequer, including Topical Questions.</s></p> <p><s><prosody pitch="low">Business Statement</prosody></s>, <s>Business Statement from the Leader of the House.</s></p> <p><s><prosody pitch="low">Statement</prosody></s>, <s>Syria and North Korea.</s></p> <p><s><prosody pitch="low">Ten Minute Rule Motion</prosody></s>, <s>Parish Council Governance (Principles of Public Life).</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Finance (No. 2) Bill - 2nd reading.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Mitigating support for Employment Support Allowance Work Related Activity Group.</s></p> There are 5 Westminster Hall events. <p><s><prosody pitch="low">From 11:30, until 13:00,  Westminster Hall debate</prosody></s>, <s>The Child Maintenance Service.</s></p> <p><s><prosody pitch="low">From 13:00, until 13:30,  Westminster Hall debate</prosody></s>, <s>The relationship between the Serious Fraud Office and other agencies.</s></p> <p><s><prosody pitch="low">From 16:30, until 18:00,  Westminster Hall debate</prosody></s>, <s>The Future Accommodation Model.</s></p> <p><s><prosody pitch="low">From 18:00, until 18:30,  Westminster Hall debate</prosody></s>, <s>The role of employers in improving work outcomes for people with long-term health problems.</s></p> <p><s><prosody pitch="low">From 18:30, until 19:30,  Westminster Hall debate</prosody></s>, <s>The regulatory role of the Royal Institution of Chartered Surveyors in Law of Property Act receiverships.</s></p> There are 4 Select and Joint Committees events. Including 4 Oral Evidence Session events.<break time="0.5s" /> That is all. </speak>`);
                            });
                        });
                    });

                    context("with no events", function(){
                        beforeEach(function(cb){
                            MockDate.set('2017-04-18');

                            let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                            let response = fs.readFileSync(file_path, "utf8");

                            nock('http://service.calendar.parliament.uk')
                                .get('/calendar/events/list.json?date=30days&house=commons')
                                .reply(200, JSON.parse(response.trim()));

                            event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                            kappaLambda.execute(event, cb);
                        });

                        it("should return outputSpeech matching string", function () {
                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> There are no events on at the House of Commons today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>`);
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
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> That is all. </speak>`);
                            });
                        });

                        context("with no future events", function(){
                            beforeEach(function(cb){
                                MockDate.set('2017-04-18');

                                let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=commons')
                                    .reply(200, JSON.parse(response.trim()));

                                event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> There are no events on at the House of Commons today. </speak>');
                            });
                        });

                        context("with a single future event", function(){
                            beforeEach(function(cb){
                                MockDate.set('2017-04-18');

                                let file_path = __dirname + "/../fixtures/external_data/events_future_single.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=commons')
                                    .reply(200, JSON.parse(response.trim()));

                                event = helpers.getEvent("WhatsOnIntent/commons_slot.json");
                                event.session.attributes = kappaLambda.done.sessionAttributes;

                                kappaLambda.execute(event, cb);
                            });

                            it("should return outputSpeech matching string", function () {
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> There are no events on at the House of Commons today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>`);
                            });

                            it("should have shouldEndSession equal to true", function () {
                                assert.equal(kappaLambda.done.response.shouldEndSession, true);
                            });
                        });
                    });
                });
            });
        });

        context('With Parliament not sitting', function(){
            context('Both houses not sitting', function(){
                context('Recess', function(){
                    beforeEach(() => {
                        let file_path = __dirname + "/../fixtures/external_data/whats_on/nonsitting/recess_both.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse(response.trim()));
                    });

                    describe('Requesting events for both houses', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Recess, and there are no events today. </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Recess, and there are no events today.');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future_single.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Recess, and there are no events today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>, in the House of Commons.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Recess, and there are no events today. The next event will be on Tuesday 13-06, in the House of Commons. On 13-06, there will be 1 Main Chamber event. Starting at 14:30, Business, Election of Commons Speaker.');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                context('multiple future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    afterEach(() => {
                                        kappaResponse = Object.assign({}, kappaLambda.done);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Recess, and there are no events today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Recess, and there are no events today. The next event will be on Wednesday 21-06.');
                                    });

                                    it('returns the expected reprompt message', function(){
                                        console.log(kappaLambda.done.response);
                                        expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Would you like to hear more? </speak>');
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });

                                    describe('Responding with AMAZON.YesIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.YesIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.NoIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.HelpIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.HelpIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('does not end the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                        });
                                    });

                                    describe('Responding with AMAZON.StopIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with MyMPIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("MyMPIntent/without_consent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                        });

                                        it('returns an AskForPermissionsConsent card', function(){
                                            expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });
                                });
                            });
                        });

                        context('With events', function(){
                            describe('In both houses', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_both_houses.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, function(){
                                        kappaResponse = kappaLambda.done;

                                        cb();
                                    });
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Recess. There are 55 events today. 23 in the House of Commons and 32 in the House of Lords. Would you like to hear more? </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Recess. There are 55 events today. 23 in the House of Commons and 32 in the House of Lords.');
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });

                                describe('Responding with AMAZON.YesIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.YesIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.NoIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.HelpIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.HelpIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });
                                });

                                describe('Responding with AMAZON.StopIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with MyMPIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("MyMPIntent/without_consent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                    });

                                    it('returns an AskForPermissionsConsent card', function(){
                                        expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });
                            });

                            describe('In commons only', function(){
                                beforeEach((cb) => {
                                    MockDate.set('2017-04-18');

                                    let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, function(){
                                        kappaResponse = kappaLambda.done;

                                        cb();
                                    });
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Recess. There are 18 events today. They are all in the House of Commons. Would you like to hear more? </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Recess. There are 18 events today. They are all in the House of Commons.');
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });

                                describe('Responding with AMAZON.YesIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.YesIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of commons, There are 6 Main Chamber events. <p><s><prosody pitch="low">Starting at 14:30, Oral questions</prosody></s>, <s>Chancellor of the Exchequer, including Topical Questions.</s></p> <p><s><prosody pitch="low">Business Statement</prosody></s>, <s>Business Statement from the Leader of the House.</s></p> <p><s><prosody pitch="low">Statement</prosody></s>, <s>Syria and North Korea.</s></p> <p><s><prosody pitch="low">Ten Minute Rule Motion</prosody></s>, <s>Parish Council Governance (Principles of Public Life).</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Finance (No. 2) Bill - 2nd reading.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Mitigating support for Employment Support Allowance Work Related Activity Group.</s></p> There are 5 Westminster Hall events. <p><s><prosody pitch="low">From 11:30, until 13:00,  Westminster Hall debate</prosody></s>, <s>The Child Maintenance Service.</s></p> <p><s><prosody pitch="low">From 13:00, until 13:30,  Westminster Hall debate</prosody></s>, <s>The relationship between the Serious Fraud Office and other agencies.</s></p> <p><s><prosody pitch="low">From 16:30, until 18:00,  Westminster Hall debate</prosody></s>, <s>The Future Accommodation Model.</s></p> <p><s><prosody pitch="low">From 18:00, until 18:30,  Westminster Hall debate</prosody></s>, <s>The role of employers in improving work outcomes for people with long-term health problems.</s></p> <p><s><prosody pitch="low">From 18:30, until 19:30,  Westminster Hall debate</prosody></s>, <s>The regulatory role of the Royal Institution of Chartered Surveyors in Law of Property Act receiverships.</s></p> There are 4 Select and Joint Committees events. Including 4 Oral Evidence Session events.<break time="0.5s" /> That is all. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.NoIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.HelpIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.HelpIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });
                                });

                                describe('Responding with AMAZON.StopIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with MyMPIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("MyMPIntent/without_consent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                    });

                                    it('returns an AskForPermissionsConsent card', function(){
                                        expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });
                            });

                            describe('In lords only', function(){
                                beforeEach((cb) => {
                                    MockDate.set('2017-04-05');

                                    let file_path = __dirname + "/../fixtures/external_data/events_lords.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, function(){
                                        kappaResponse = kappaLambda.done;

                                        cb();
                                    });
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Recess. There are 16 events today. They are all in the House of Lords. Would you like to hear more? </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Recess. There are 16 events today. They are all in the House of Lords.');
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });

                                describe('Responding with AMAZON.YesIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.YesIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of lords, There are 10 Main Chamber events. <p><s><prosody pitch="low">Starting at 15:00, Oral questions</prosody></s>, <s>Sustainability of the National Health Service and adult social care.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Local authority submissions for the Department of Work and Pensions Family Offer programme.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Ensuring that young people also have the interpersonal skills required to succeed in the workplace <break time="0.25s" />.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Proposed contractual arrangements between HS2 and CH2M.</s></p> <p><s><prosody pitch="low">Private Notice Question</prosody></s>, <s>Government response to chemical attack carried out by the Syrian Government on civilians in the town of Khan Sheikhoun .</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Health Service Medical Supplies (Costs) Bill - Consideration of Commons amendments - Lord O’Shaughnessy.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Pension Schemes Bill [HL] - Consideration of Commons amendments.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Digital Economy  Bill - 3rd reading.</s></p> <p><s><prosody pitch="low">Orders and regulations</prosody></s>, <s>Higher Education (Basic Amount) (England) Regulations 2016 and Higher Education (Higher Amount) (England) Regulations 2016 - motion to regret.</s></p> <p><s><prosody pitch="low">Starting at 20:00, Estimated rising time</prosody></s></p> There are 6 Select and Joint Committees events. Including, 2 Oral Evidence Session events, and 4 Private Meeting events.<break time="0.5s" /> That is all. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.NoIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.HelpIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.HelpIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });
                                });

                                describe('Responding with AMAZON.StopIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with MyMPIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("MyMPIntent/without_consent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                    });

                                    it('returns an AskForPermissionsConsent card', function(){
                                        expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });
                            });
                        });
                    });

                    describe('Requesting events for commons only', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days&house=commons')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Recess, and there are no events today. </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Recess, and there are no events today.');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future_single.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=commons')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Recess, and there are no events today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Recess, and there are no events today. The next event will be on Tuesday 13-06. On 13-06, there will be 1 Main Chamber event. Starting at 14:30, Business, Election of Commons Speaker.');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                context('multiple future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=commons')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                        kappaLambda.execute(event, function(){
                                            kappaResponse = kappaLambda.done;

                                            cb();
                                        });
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Recess, and there are no events today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Recess, and there are no events today. The next event will be on Wednesday 21-06. Would you like to hear more?');
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });

                                    describe('Responding with AMAZON.YesIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.YesIntent.json");
                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> That is all. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.NoIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.HelpIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.HelpIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('does not end the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                        });
                                    });

                                    describe('Responding with AMAZON.StopIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with MyMPIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("MyMPIntent/without_consent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                        });

                                        it('returns an AskForPermissionsConsent card', function(){
                                            expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });
                                });
                            });
                        });

                        describe('With events', function(){
                            beforeEach((cb) => {
                                MockDate.set('2017-04-18');

                                let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=commons')
                                    .reply(200, JSON.parse(response.trim()));
                                event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                kappaLambda.execute(event, function(){
                                    kappaResponse = kappaLambda.done;

                                    cb();
                                });
                            });

                            it('returns the expected SSML', function(){
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Recess. There are 18 events today. Would you like to hear more? </speak>');
                            });

                            it('returns the expected card title', function(){
                                expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                            });

                            it('returns the expected card content', function(){
                                expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Recess. There are 18 events today.');
                            });

                            it('does not end the session', function(){
                                expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                            });

                            describe('Responding with AMAZON.YesIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.YesIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> That is all. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.NoIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.HelpIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.HelpIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });
                            });

                            describe('Responding with AMAZON.StopIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with MyMPIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("MyMPIntent/without_consent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                });

                                it('returns an AskForPermissionsConsent card', function(){
                                    expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });
                        });
                    });

                    describe('Requesting events for lords only', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days&house=lords')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Recess, and there are no events today. </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Recess, and there are no events today.');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future_single_lords.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=lords')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Recess, and there are no events today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Recess, and there are no events today. The next event will be on Tuesday 13-06. On 13-06, there will be 1 Main Chamber event. Starting at 14:30, Business, Election of Commons Speaker.');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                context('multiple future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=lords')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                        kappaLambda.execute(event, function(){
                                            kappaResponse = kappaLambda.done;

                                            cb();
                                        });
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Recess, and there are no events today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Recess, and there are no events today. The next event will be on Wednesday 21-06. Would you like to hear more?');
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });

                                    describe('Responding with AMAZON.YesIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.YesIntent.json");
                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.NoIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.HelpIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.HelpIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('does not end the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                        });
                                    });

                                    describe('Responding with AMAZON.StopIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with MyMPIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("MyMPIntent/without_consent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                        });

                                        it('returns an AskForPermissionsConsent card', function(){
                                            expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });
                                });
                            });
                        });

                        describe('With events', function(){
                            beforeEach((cb) => {
                                MockDate.set('2017-04-05');

                                let file_path = __dirname + "/../fixtures/external_data/events_lords.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=lords')
                                    .reply(200, JSON.parse(response.trim()));
                                event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                kappaLambda.execute(event, function(){
                                    kappaResponse = kappaLambda.done;

                                    cb();
                                });
                            });

                            it('returns the expected SSML', function(){
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Recess. There are 16 events today. Would you like to hear more? </speak>');
                            });

                            it('returns the expected card title', function(){
                                expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                            });

                            it('returns the expected card content', function(){
                                expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Recess. There are 16 events today.');
                            });

                            it('does not end the session', function(){
                                expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                            });

                            describe('Responding with AMAZON.YesIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.YesIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.NoIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.HelpIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.HelpIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });
                            });

                            describe('Responding with AMAZON.StopIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with MyMPIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("MyMPIntent/without_consent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                });

                                it('returns an AskForPermissionsConsent card', function(){
                                    expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });
                        });
                    });
                });

                context('Disollution', function(){
                    beforeEach(() => {
                        let file_path = __dirname + "/../fixtures/external_data/whats_on/nonsitting/dissolution_both.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse(response.trim()));
                    });

                    describe('Requesting events for both houses', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Dissolution, and there are no events today. </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Dissolution, and there are no events today.');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future_single.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Dissolution, and there are no events today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>, in the House of Commons.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Dissolution, and there are no events today. The next event will be on Tuesday 13-06, in the House of Commons. On 13-06, there will be 1 Main Chamber event. Starting at 14:30, Business, Election of Commons Speaker.');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                context('multiple future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    afterEach(() => {
                                        kappaResponse = Object.assign({}, kappaLambda.done);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Dissolution, and there are no events today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Dissolution, and there are no events today. The next event will be on Wednesday 21-06.');
                                    });

                                    it('returns the expected reprompt message', function(){
                                        console.log(kappaLambda.done.response);
                                        expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Would you like to hear more? </speak>');
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });

                                    describe('Responding with AMAZON.YesIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.YesIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.NoIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.HelpIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.HelpIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('does not end the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                        });
                                    });

                                    describe('Responding with AMAZON.StopIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with MyMPIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("MyMPIntent/without_consent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                        });

                                        it('returns an AskForPermissionsConsent card', function(){
                                            expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });
                                });
                            });
                        });

                        context('With events', function(){
                            describe('In both houses', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_both_houses.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, function(){
                                        kappaResponse = kappaLambda.done;

                                        cb();
                                    });
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Dissolution. There are 55 events today. 23 in the House of Commons and 32 in the House of Lords. Would you like to hear more? </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Dissolution. There are 55 events today. 23 in the House of Commons and 32 in the House of Lords.');
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });

                                describe('Responding with AMAZON.YesIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.YesIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.NoIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.HelpIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.HelpIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });
                                });

                                describe('Responding with AMAZON.StopIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with MyMPIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("MyMPIntent/without_consent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                    });

                                    it('returns an AskForPermissionsConsent card', function(){
                                        expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });
                            });

                            describe('In commons only', function(){
                                beforeEach((cb) => {
                                    MockDate.set('2017-04-18');

                                    let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, function(){
                                        kappaResponse = kappaLambda.done;

                                        cb();
                                    });
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Dissolution. There are 18 events today. They are all in the House of Commons. Would you like to hear more? </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Dissolution. There are 18 events today. They are all in the House of Commons.');
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });

                                describe('Responding with AMAZON.YesIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.YesIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of commons, There are 6 Main Chamber events. <p><s><prosody pitch="low">Starting at 14:30, Oral questions</prosody></s>, <s>Chancellor of the Exchequer, including Topical Questions.</s></p> <p><s><prosody pitch="low">Business Statement</prosody></s>, <s>Business Statement from the Leader of the House.</s></p> <p><s><prosody pitch="low">Statement</prosody></s>, <s>Syria and North Korea.</s></p> <p><s><prosody pitch="low">Ten Minute Rule Motion</prosody></s>, <s>Parish Council Governance (Principles of Public Life).</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Finance (No. 2) Bill - 2nd reading.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Mitigating support for Employment Support Allowance Work Related Activity Group.</s></p> There are 5 Westminster Hall events. <p><s><prosody pitch="low">From 11:30, until 13:00,  Westminster Hall debate</prosody></s>, <s>The Child Maintenance Service.</s></p> <p><s><prosody pitch="low">From 13:00, until 13:30,  Westminster Hall debate</prosody></s>, <s>The relationship between the Serious Fraud Office and other agencies.</s></p> <p><s><prosody pitch="low">From 16:30, until 18:00,  Westminster Hall debate</prosody></s>, <s>The Future Accommodation Model.</s></p> <p><s><prosody pitch="low">From 18:00, until 18:30,  Westminster Hall debate</prosody></s>, <s>The role of employers in improving work outcomes for people with long-term health problems.</s></p> <p><s><prosody pitch="low">From 18:30, until 19:30,  Westminster Hall debate</prosody></s>, <s>The regulatory role of the Royal Institution of Chartered Surveyors in Law of Property Act receiverships.</s></p> There are 4 Select and Joint Committees events. Including 4 Oral Evidence Session events.<break time="0.5s" /> That is all. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.NoIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.HelpIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.HelpIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });
                                });

                                describe('Responding with AMAZON.StopIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with MyMPIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("MyMPIntent/without_consent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                    });

                                    it('returns an AskForPermissionsConsent card', function(){
                                        expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });
                            });

                            describe('In lords only', function(){
                                beforeEach((cb) => {
                                    MockDate.set('2017-04-05');

                                    let file_path = __dirname + "/../fixtures/external_data/events_lords.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, function(){
                                        kappaResponse = kappaLambda.done;

                                        cb();
                                    });
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Dissolution. There are 16 events today. They are all in the House of Lords. Would you like to hear more? </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Dissolution. There are 16 events today. They are all in the House of Lords.');
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });

                                describe('Responding with AMAZON.YesIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.YesIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of lords, There are 10 Main Chamber events. <p><s><prosody pitch="low">Starting at 15:00, Oral questions</prosody></s>, <s>Sustainability of the National Health Service and adult social care.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Local authority submissions for the Department of Work and Pensions Family Offer programme.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Ensuring that young people also have the interpersonal skills required to succeed in the workplace <break time="0.25s" />.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Proposed contractual arrangements between HS2 and CH2M.</s></p> <p><s><prosody pitch="low">Private Notice Question</prosody></s>, <s>Government response to chemical attack carried out by the Syrian Government on civilians in the town of Khan Sheikhoun .</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Health Service Medical Supplies (Costs) Bill - Consideration of Commons amendments - Lord O’Shaughnessy.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Pension Schemes Bill [HL] - Consideration of Commons amendments.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Digital Economy  Bill - 3rd reading.</s></p> <p><s><prosody pitch="low">Orders and regulations</prosody></s>, <s>Higher Education (Basic Amount) (England) Regulations 2016 and Higher Education (Higher Amount) (England) Regulations 2016 - motion to regret.</s></p> <p><s><prosody pitch="low">Starting at 20:00, Estimated rising time</prosody></s></p> There are 6 Select and Joint Committees events. Including, 2 Oral Evidence Session events, and 4 Private Meeting events.<break time="0.5s" /> That is all. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.NoIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.HelpIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.HelpIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });
                                });

                                describe('Responding with AMAZON.StopIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with MyMPIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("MyMPIntent/without_consent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                    });

                                    it('returns an AskForPermissionsConsent card', function(){
                                        expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });
                            });
                        });
                    });

                    describe('Requesting events for commons only', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days&house=commons')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Dissolution, and there are no events today. </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Dissolution, and there are no events today.');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future_single.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=commons')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Dissolution, and there are no events today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Dissolution, and there are no events today. The next event will be on Tuesday 13-06. On 13-06, there will be 1 Main Chamber event. Starting at 14:30, Business, Election of Commons Speaker.');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                context('multiple future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=commons')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                        kappaLambda.execute(event, function(){
                                            kappaResponse = kappaLambda.done;

                                            cb();
                                        });
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Dissolution, and there are no events today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Dissolution, and there are no events today. The next event will be on Wednesday 21-06. Would you like to hear more?');
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });

                                    describe('Responding with AMAZON.YesIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.YesIntent.json");
                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> That is all. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.NoIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.HelpIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.HelpIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('does not end the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                        });
                                    });

                                    describe('Responding with AMAZON.StopIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with MyMPIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("MyMPIntent/without_consent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                        });

                                        it('returns an AskForPermissionsConsent card', function(){
                                            expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });
                                });
                            });
                        });

                        describe('With events', function(){
                            beforeEach((cb) => {
                                MockDate.set('2017-04-18');

                                let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=commons')
                                    .reply(200, JSON.parse(response.trim()));
                                event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                kappaLambda.execute(event, function(){
                                    kappaResponse = kappaLambda.done;

                                    cb();
                                });
                            });

                            it('returns the expected SSML', function(){
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Dissolution. There are 18 events today. Would you like to hear more? </speak>');
                            });

                            it('returns the expected card title', function(){
                                expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                            });

                            it('returns the expected card content', function(){
                                expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Dissolution. There are 18 events today.');
                            });

                            it('does not end the session', function(){
                                expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                            });

                            describe('Responding with AMAZON.YesIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.YesIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> That is all. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.NoIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.HelpIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.HelpIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });
                            });

                            describe('Responding with AMAZON.StopIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with MyMPIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("MyMPIntent/without_consent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                });

                                it('returns an AskForPermissionsConsent card', function(){
                                    expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });
                        });
                    });

                    describe('Requesting events for lords only', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days&house=lords')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Dissolution, and there are no events today. </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Dissolution, and there are no events today.');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future_single_lords.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=lords')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Dissolution, and there are no events today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Dissolution, and there are no events today. The next event will be on Tuesday 13-06. On 13-06, there will be 1 Main Chamber event. Starting at 14:30, Business, Election of Commons Speaker.');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                context('multiple future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=lords')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                        kappaLambda.execute(event, function(){
                                            kappaResponse = kappaLambda.done;

                                            cb();
                                        });
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Dissolution, and there are no events today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Dissolution, and there are no events today. The next event will be on Wednesday 21-06. Would you like to hear more?');
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });

                                    describe('Responding with AMAZON.YesIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.YesIntent.json");
                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.NoIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.HelpIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.HelpIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('does not end the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                        });
                                    });

                                    describe('Responding with AMAZON.StopIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with MyMPIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("MyMPIntent/without_consent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                        });

                                        it('returns an AskForPermissionsConsent card', function(){
                                            expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });
                                });
                            });
                        });

                        describe('With events', function(){
                            beforeEach((cb) => {
                                MockDate.set('2017-04-05');

                                let file_path = __dirname + "/../fixtures/external_data/events_lords.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=lords')
                                    .reply(200, JSON.parse(response.trim()));
                                event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                kappaLambda.execute(event, function(){
                                    kappaResponse = kappaLambda.done;

                                    cb();
                                });
                            });

                            it('returns the expected SSML', function(){
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Dissolution. There are 16 events today. Would you like to hear more? </speak>');
                            });

                            it('returns the expected card title', function(){
                                expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                            });

                            it('returns the expected card content', function(){
                                expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Dissolution. There are 16 events today.');
                            });

                            it('does not end the session', function(){
                                expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                            });

                            describe('Responding with AMAZON.YesIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.YesIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.NoIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.HelpIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.HelpIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });
                            });

                            describe('Responding with AMAZON.StopIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with MyMPIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("MyMPIntent/without_consent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                });

                                it('returns an AskForPermissionsConsent card', function(){
                                    expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });
                        });
                    });
                });

                context('Named Recess', function(){
                    beforeEach(() => {
                        let file_path = __dirname + "/../fixtures/external_data/whats_on/nonsitting/named_recess_both.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse(response.trim()));
                    });

                    describe('Requesting events for both houses', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Conference Recess, and there are no events today. </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Conference Recess, and there are no events today.');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future_single.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Conference Recess, and there are no events today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>, in the House of Commons.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Conference Recess, and there are no events today. The next event will be on Tuesday 13-06, in the House of Commons. On 13-06, there will be 1 Main Chamber event. Starting at 14:30, Business, Election of Commons Speaker.');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                context('multiple future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    afterEach(() => {
                                        kappaResponse = Object.assign({}, kappaLambda.done);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Conference Recess, and there are no events today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Conference Recess, and there are no events today. The next event will be on Wednesday 21-06.');
                                    });

                                    it('returns the expected reprompt message', function(){
                                        console.log(kappaLambda.done.response);
                                        expect(kappaLambda.done.response.reprompt.outputSpeech.ssml).to.have.string('<speak> Would you like to hear more? </speak>');
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });

                                    describe('Responding with AMAZON.YesIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.YesIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.NoIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.HelpIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.HelpIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('does not end the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                        });
                                    });

                                    describe('Responding with AMAZON.StopIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with MyMPIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("MyMPIntent/without_consent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                        });

                                        it('returns an AskForPermissionsConsent card', function(){
                                            expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });
                                });
                            });
                        });

                        context('With events', function(){
                            describe('In both houses', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_both_houses.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, function(){
                                        kappaResponse = kappaLambda.done;

                                        cb();
                                    });
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Conference Recess. There are 55 events today. 23 in the House of Commons and 32 in the House of Lords. Would you like to hear more? </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Conference Recess. There are 55 events today. 23 in the House of Commons and 32 in the House of Lords.');
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });

                                describe('Responding with AMAZON.YesIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.YesIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.NoIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.HelpIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.HelpIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });
                                });

                                describe('Responding with AMAZON.StopIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with MyMPIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("MyMPIntent/without_consent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                    });

                                    it('returns an AskForPermissionsConsent card', function(){
                                        expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });
                            });

                            describe('In commons only', function(){
                                beforeEach((cb) => {
                                    MockDate.set('2017-04-18');

                                    let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, function(){
                                        kappaResponse = kappaLambda.done;

                                        cb();
                                    });
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Conference Recess. There are 18 events today. They are all in the House of Commons. Would you like to hear more? </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Conference Recess. There are 18 events today. They are all in the House of Commons.');
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });

                                describe('Responding with AMAZON.YesIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.YesIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of commons, There are 6 Main Chamber events. <p><s><prosody pitch="low">Starting at 14:30, Oral questions</prosody></s>, <s>Chancellor of the Exchequer, including Topical Questions.</s></p> <p><s><prosody pitch="low">Business Statement</prosody></s>, <s>Business Statement from the Leader of the House.</s></p> <p><s><prosody pitch="low">Statement</prosody></s>, <s>Syria and North Korea.</s></p> <p><s><prosody pitch="low">Ten Minute Rule Motion</prosody></s>, <s>Parish Council Governance (Principles of Public Life).</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Finance (No. 2) Bill - 2nd reading.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Mitigating support for Employment Support Allowance Work Related Activity Group.</s></p> There are 5 Westminster Hall events. <p><s><prosody pitch="low">From 11:30, until 13:00,  Westminster Hall debate</prosody></s>, <s>The Child Maintenance Service.</s></p> <p><s><prosody pitch="low">From 13:00, until 13:30,  Westminster Hall debate</prosody></s>, <s>The relationship between the Serious Fraud Office and other agencies.</s></p> <p><s><prosody pitch="low">From 16:30, until 18:00,  Westminster Hall debate</prosody></s>, <s>The Future Accommodation Model.</s></p> <p><s><prosody pitch="low">From 18:00, until 18:30,  Westminster Hall debate</prosody></s>, <s>The role of employers in improving work outcomes for people with long-term health problems.</s></p> <p><s><prosody pitch="low">From 18:30, until 19:30,  Westminster Hall debate</prosody></s>, <s>The regulatory role of the Royal Institution of Chartered Surveyors in Law of Property Act receiverships.</s></p> There are 4 Select and Joint Committees events. Including 4 Oral Evidence Session events.<break time="0.5s" /> That is all. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.NoIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.HelpIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.HelpIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });
                                });

                                describe('Responding with AMAZON.StopIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with MyMPIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("MyMPIntent/without_consent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                    });

                                    it('returns an AskForPermissionsConsent card', function(){
                                        expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });
                            });

                            describe('In lords only', function(){
                                beforeEach((cb) => {
                                    MockDate.set('2017-04-05');

                                    let file_path = __dirname + "/../fixtures/external_data/events_lords.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/no_slots.json");

                                    kappaLambda.execute(event, function(){
                                        kappaResponse = kappaLambda.done;

                                        cb();
                                    });
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The Houses of Parliament are currently in Conference Recess. There are 16 events today. They are all in the House of Lords. Would you like to hear more? </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The Houses of Parliament are currently in Conference Recess. There are 16 events today. They are all in the House of Lords.');
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });

                                describe('Responding with AMAZON.YesIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.YesIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> In the house of lords, There are 10 Main Chamber events. <p><s><prosody pitch="low">Starting at 15:00, Oral questions</prosody></s>, <s>Sustainability of the National Health Service and adult social care.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Local authority submissions for the Department of Work and Pensions Family Offer programme.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Ensuring that young people also have the interpersonal skills required to succeed in the workplace <break time="0.25s" />.</s></p> <p><s><prosody pitch="low">Oral questions</prosody></s>, <s>Proposed contractual arrangements between HS2 and CH2M.</s></p> <p><s><prosody pitch="low">Private Notice Question</prosody></s>, <s>Government response to chemical attack carried out by the Syrian Government on civilians in the town of Khan Sheikhoun .</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Health Service Medical Supplies (Costs) Bill - Consideration of Commons amendments - Lord O’Shaughnessy.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Pension Schemes Bill [HL] - Consideration of Commons amendments.</s></p> <p><s><prosody pitch="low">Legislation</prosody></s>, <s>Digital Economy  Bill - 3rd reading.</s></p> <p><s><prosody pitch="low">Orders and regulations</prosody></s>, <s>Higher Education (Basic Amount) (England) Regulations 2016 and Higher Education (Higher Amount) (England) Regulations 2016 - motion to regret.</s></p> <p><s><prosody pitch="low">Starting at 20:00, Estimated rising time</prosody></s></p> There are 6 Select and Joint Committees events. Including, 2 Oral Evidence Session events, and 4 Private Meeting events.<break time="0.5s" /> That is all. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.NoIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with AMAZON.HelpIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.HelpIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });
                                });

                                describe('Responding with AMAZON.StopIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("AMAZON.NoIntent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                    });

                                    it('does not return a card', function(){
                                        expect(kappaLambda.done.response.card).to.equal(undefined);
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                describe('Responding with MyMPIntent', function(){
                                    beforeEach((cb) => {
                                        event = helpers.getEvent("MyMPIntent/without_consent.json");

                                        event.session.attributes = kappaResponse.sessionAttributes;

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                    });

                                    it('returns an AskForPermissionsConsent card', function(){
                                        expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });
                            });
                        });
                    });

                    describe('Requesting events for commons only', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days&house=commons')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Conference Recess, and there are no events today. </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Conference Recess, and there are no events today.');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future_single.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=commons')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Conference Recess, and there are no events today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Conference Recess, and there are no events today. The next event will be on Tuesday 13-06. On 13-06, there will be 1 Main Chamber event. Starting at 14:30, Business, Election of Commons Speaker.');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                context('multiple future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=commons')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                        kappaLambda.execute(event, function(){
                                            kappaResponse = kappaLambda.done;

                                            cb();
                                        });
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Conference Recess, and there are no events today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Conference Recess, and there are no events today. The next event will be on Wednesday 21-06. Would you like to hear more?');
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });

                                    describe('Responding with AMAZON.YesIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.YesIntent.json");
                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> That is all. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.NoIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.HelpIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.HelpIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('does not end the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                        });
                                    });

                                    describe('Responding with AMAZON.StopIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with MyMPIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("MyMPIntent/without_consent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                        });

                                        it('returns an AskForPermissionsConsent card', function(){
                                            expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });
                                });
                            });
                        });

                        describe('With events', function(){
                            beforeEach((cb) => {
                                MockDate.set('2017-04-18');

                                let file_path = __dirname + "/../fixtures/external_data/events_commons.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=commons')
                                    .reply(200, JSON.parse(response.trim()));
                                event = helpers.getEvent("WhatsOnIntent/commons_slot.json");

                                kappaLambda.execute(event, function(){
                                    kappaResponse = kappaLambda.done;

                                    cb();
                                });
                            });

                            it('returns the expected SSML', function(){
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Commons is currently in Conference Recess. There are 18 events today. Would you like to hear more? </speak>');
                            });

                            it('returns the expected card title', function(){
                                expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                            });

                            it('returns the expected card content', function(){
                                expect(kappaLambda.done.response.card.content).to.have.string('The House of Commons is currently in Conference Recess. There are 18 events today.');
                            });

                            it('does not end the session', function(){
                                expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                            });

                            describe('Responding with AMAZON.YesIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.YesIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of commons, there will be 4 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:25, State Opening of Parliament</prosody></s>, <s>State Opening of Parliament.</s></p> <p><s><prosody pitch="low">Starting at 13:45, Business</prosody></s>, <s>Swearing in of Members of the Commons.</s></p> <p><s><prosody pitch="low">Starting at 14:30, Debate on the Address</prosody></s>, <s>Queen's Speech Debate.</s></p> <p><s><prosody pitch="low">Adjournment</prosody></s>, <s>Cost of telephone calls to the Department for Work and Pensions.</s></p><break time="0.5s" /> That is all. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.NoIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.HelpIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.HelpIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });
                            });

                            describe('Responding with AMAZON.StopIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with MyMPIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("MyMPIntent/without_consent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                });

                                it('returns an AskForPermissionsConsent card', function(){
                                    expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });
                        });
                    });

                    describe('Requesting events for lords only', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                beforeEach((cb) => {
                                    let file_path = __dirname + "/../fixtures/external_data/events_none.json";
                                    let response = fs.readFileSync(file_path, "utf8");

                                    nock('http://service.calendar.parliament.uk')
                                        .get('/calendar/events/list.json?date=30days&house=lords')
                                        .reply(200, JSON.parse(response.trim()));
                                    event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Conference Recess, and there are no events today. </speak>');
                                });

                                it('returns the expected card title', function(){
                                    expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                });

                                it('returns the expected card content', function(){
                                    expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Conference Recess, and there are no events today.');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future_single_lords.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=lords')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                        kappaLambda.execute(event, cb);
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Conference Recess, and there are no events today. The next event will be on Tuesday <say-as interpret-as="date" format="dm">13-06</say-as>.<break time="1.5s"/> On <say-as interpret-as="date" format="dm">13-06</say-as>, there will be 1 Main Chamber event. <p><s><prosody pitch="low">Starting at 14:30, Business</prosody></s>, <s>Election of Commons Speaker.</s></p> </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Conference Recess, and there are no events today. The next event will be on Tuesday 13-06. On 13-06, there will be 1 Main Chamber event. Starting at 14:30, Business, Election of Commons Speaker.');
                                    });

                                    it('ends the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                    });
                                });

                                context('multiple future event', function(){
                                    beforeEach((cb) => {
                                        let file_path = __dirname + "/../fixtures/external_data/events_future.json";
                                        let response = fs.readFileSync(file_path, "utf8");

                                        nock('http://service.calendar.parliament.uk')
                                            .get('/calendar/events/list.json?date=30days&house=lords')
                                            .reply(200, JSON.parse(response.trim()));
                                        event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                        kappaLambda.execute(event, function(){
                                            kappaResponse = kappaLambda.done;

                                            cb();
                                        });
                                    });

                                    it('returns the expected SSML', function(){
                                        expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Conference Recess, and there are no events today. The next event will be on Wednesday <say-as interpret-as="date" format="dm">21-06</say-as>. Would you like to hear more? </speak>');
                                    });

                                    it('returns the expected card title', function(){
                                        expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                                    });

                                    it('returns the expected card content', function(){
                                        expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Conference Recess, and there are no events today. The next event will be on Wednesday 21-06. Would you like to hear more?');
                                    });

                                    it('does not end the session', function(){
                                        expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                    });

                                    describe('Responding with AMAZON.YesIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.YesIntent.json");
                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.NoIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with AMAZON.HelpIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.HelpIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('does not end the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                        });
                                    });

                                    describe('Responding with AMAZON.StopIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("AMAZON.NoIntent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                        });

                                        it('does not return a card', function(){
                                            expect(kappaLambda.done.response.card).to.equal(undefined);
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });

                                    describe('Responding with MyMPIntent', function(){
                                        beforeEach((cb) => {
                                            event = helpers.getEvent("MyMPIntent/without_consent.json");

                                            event.session.attributes = kappaResponse.sessionAttributes;

                                            kappaLambda.execute(event, cb);
                                        });

                                        it('returns the expected SSML', function(){
                                            expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                        });

                                        it('returns an AskForPermissionsConsent card', function(){
                                            expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                        });

                                        it('ends the session', function(){
                                            expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                        });
                                    });
                                });
                            });
                        });

                        describe('With events', function(){
                            beforeEach((cb) => {
                                MockDate.set('2017-04-05');

                                let file_path = __dirname + "/../fixtures/external_data/events_lords.json";
                                let response = fs.readFileSync(file_path, "utf8");

                                nock('http://service.calendar.parliament.uk')
                                    .get('/calendar/events/list.json?date=30days&house=lords')
                                    .reply(200, JSON.parse(response.trim()));
                                event = helpers.getEvent("WhatsOnIntent/lords_slot.json");

                                kappaLambda.execute(event, function(){
                                    kappaResponse = kappaLambda.done;

                                    cb();
                                });
                            });

                            it('returns the expected SSML', function(){
                                expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string('<speak> The House of Lords is currently in Conference Recess. There are 16 events today. Would you like to hear more? </speak>');
                            });

                            it('returns the expected card title', function(){
                                expect(kappaLambda.done.response.card.title).to.have.string("What's on at Parliament");
                            });

                            it('returns the expected card content', function(){
                                expect(kappaLambda.done.response.card.content).to.have.string('The House of Lords is currently in Conference Recess. There are 16 events today.');
                            });

                            it('does not end the session', function(){
                                expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                            });

                            describe('Responding with AMAZON.YesIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.YesIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> On <say-as interpret-as="date" format="dm">21-06</say-as>.<break time="0.5s" /> In the house of lords, there will be 2 Main Chamber events. <p><s><prosody pitch="low">Starting at 11:30, State Opening of Parliament</prosody></s></p> <p><s><prosody pitch="low">Starting at 15:30, Motion for Humble Address</prosody></s></p><break time="0.5s" /> That is all. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.NoIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with AMAZON.HelpIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.HelpIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> You can either say, 'yes', to hear more. Or, 'no', to cancel. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('does not end the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(false);
                                });
                            });

                            describe('Responding with AMAZON.StopIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("AMAZON.NoIntent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Okay. </speak>`);
                                });

                                it('does not return a card', function(){
                                    expect(kappaLambda.done.response.card).to.equal(undefined);
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });

                            describe('Responding with MyMPIntent', function(){
                                beforeEach((cb) => {
                                    event = helpers.getEvent("MyMPIntent/without_consent.json");

                                    event.session.attributes = kappaResponse.sessionAttributes;

                                    kappaLambda.execute(event, cb);
                                });

                                it('returns the expected SSML', function(){
                                    expect(kappaLambda.done.response.outputSpeech.ssml).to.have.string(`<speak> Please enable Location permissions in the Amazon Alexa app. </speak>`);
                                });

                                it('returns an AskForPermissionsConsent card', function(){
                                    expect(kappaLambda.done.response.card.type).to.equal('AskForPermissionsConsent');
                                });

                                it('ends the session', function(){
                                    expect(kappaLambda.done.response.shouldEndSession).to.equal(true);
                                });
                            });
                        });
                    });
                });
            });

            context('Commons not sitting', function(){
                context('Recess', function(){
                    beforeEach(() => {
                        let file_path = __dirname + "/../fixtures/external_data/whats_on/nonsitting/recess_both.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse(response.trim()));
                    });

                    describe('Requesting events for both houses', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                it('is tested');
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    it('is tested');
                                });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        context('With events', function(){
                            describe('In both houses', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In commons only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In lords only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });
                        });
                    });

                    describe('Requesting events for commons only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });

                    describe('Requesting events for lords only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });
                });

                context('Disollution', function(){
                    beforeEach(() => {
                        let file_path = __dirname + "/../fixtures/external_data/whats_on/nonsitting/dissolution_both.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse(response.trim()));
                    });

                    describe('Requesting events for both houses', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                it('is tested');
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    it('is tested');
                                });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        context('With events', function(){
                            describe('In both houses', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In commons only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In lords only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });
                        });
                    });

                    describe('Requesting events for commons only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });

                    describe('Requesting events for lords only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });
                });

                context('Named Recess', function(){
                    beforeEach(() => {
                        let file_path = __dirname + "/../fixtures/external_data/whats_on/nonsitting/named_recess_both.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse(response.trim()));
                    });

                    describe('Requesting events for both houses', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                it('is tested');
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    it('is tested');
                                });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        context('With events', function(){
                            describe('In both houses', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In commons only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In lords only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });
                        });
                    });

                    describe('Requesting events for commons only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });

                    describe('Requesting events for lords only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });
                });
            });

            context('Lords not sitting', function(){
                context('Recess', function(){
                    beforeEach(() => {
                        let file_path = __dirname + "/../fixtures/external_data/whats_on/nonsitting/recess_both.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse(response.trim()));
                    });

                    describe('Requesting events for both houses', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                it('is tested');
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    it('is tested');
                                });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        context('With events', function(){
                            describe('In both houses', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In commons only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In lords only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });
                        });
                    });

                    describe('Requesting events for commons only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });

                    describe('Requesting events for lords only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });
                });

                context('Disollution', function(){
                    beforeEach(() => {
                        let file_path = __dirname + "/../fixtures/external_data/whats_on/nonsitting/dissolution_both.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse(response.trim()));
                    });

                    describe('Requesting events for both houses', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                it('is tested');
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    it('is tested');
                                });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        context('With events', function(){
                            describe('In both houses', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In commons only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In lords only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });
                        });
                    });

                    describe('Requesting events for commons only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });

                    describe('Requesting events for lords only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });
                });

                context('Named Recess', function(){
                    beforeEach(() => {
                        let file_path = __dirname + "/../fixtures/external_data/whats_on/nonsitting/named_recess_both.json";
                        let response = fs.readFileSync(file_path, "utf8");

                        nock('http://service.calendar.parliament.uk')
                            .get('/calendar/events/nonsitting.json?date=today')
                            .reply(200, JSON.parse(response.trim()));
                    });

                    describe('Requesting events for both houses', function(){
                        context('No events', function(){
                            context('No future events', function(){
                                it('is tested');
                            });

                            context('Future events', function(){
                                context('one future event', function(){
                                    it('is tested');
                                });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        context('With events', function(){
                            describe('In both houses', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In commons only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });

                            describe('In lords only', function(){
                                describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                describe('Responding with MyMPIntent', function(){ it('is tested'); });
                            });
                        });
                    });

                    describe('Requesting events for commons only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });

                    describe('Requesting events for lords only', function(){
                        context('No events', function(){
                            context('No future events', function(){ it('is tested'); });

                            context('Future events', function(){
                                context('one future event', function(){ it('is tested'); });

                                context('multiple future event', function(){
                                    describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                                    describe('Responding with AMAZON.StopIntent', function(){ it('is tested'); });
                                    describe('Responding with MyMPIntent', function(){ it('is tested'); });
                                });
                            });
                        });

                        describe('With events', function(){
                            describe('Responding with AMAZON.YesIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.NoIntent', function(){ it('is tested'); });
                            describe('Responding with AMAZON.HelpIntent', function(){ it('is tested'); });
                            describe('Responding with MyMPIntent', function(){ it('is tested'); });
                        });
                    });
                });
            });
        })
    });
});
