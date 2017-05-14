const expect = require('chai').expect
const sinon = require('sinon')
const request = require('request')
const mockery = require('mockery')
const fs = require('fs')
const Bluebird = require('bluebird')

const handlers = require('../../lib/parliament/handlers')
const language_strings = require('../../lib/parliament/language_strings')

describe('The handlers module', function(){
    it('is an object', function() {
        expect(handlers).to.be.an('object')
    })

    it('has the expected intents', function(){
        expect(Object.keys(handlers)).to.eql([ 'WhatsOnIntent', 'AMAZON.HelpIntent', 'LaunchRequest' ])
    })

    describe('intents', function () {

        beforeEach(function(){
            handlers.t = function(key) { return language_strings['en-GB']['translation'][key] }
            handlers.emit = function(arguments) {  }
        })

        afterEach(function(){
            handlers.t = undefined
            handlers.emit = undefined
        })

        describe('WhatsOnIntent', function (){
            context('with content', function(){
                context('for the commons commons', function(){
                    before(function (done) {
                        console.log('BEFORE')

                        var filename = "commons_content.html";
                        mockery.enable({
                            warnOnReplace: false,
                            warnOnUnregistered: false,
                            useCleanCache: true
                        })

                        mockery.registerMock('request-promise', function () {
                            console.log('MOCKED')

                            var response = fs.readFileSync(__dirname + '/../fixtures/' + filename, 'utf8');
                            return Bluebird.resolve(response.trim());
                        })

                        mocked_handlers = require('../../lib/parliament/handlers')
                        mocked_handlers.t = function(key) { return language_strings['en-GB']['translation'][key] }
                        mocked_handlers.emit = function(arguments) {  }

                        done()
                    })

                    after(function (done) {
                        console.log('AFTER')
                        mockery.disable()
                        mockery.deregisterAll()

                        done()
                    })

                    it('emits as expected', function(done){
                        let spy = sinon.spy(mocked_handlers, 'emit')

                        mocked_handlers['WhatsOnIntent'](function(done){
                            console.log('here')
                            expect(spy).to.have.been.calledWith(':tellWithCard', 'At parliament today, there are events in  false  has 0 events false  has 0 events false  has 0 events false  has 0 events false  has 0 events', 'WHATS_ON_CARD_TITLE', 'WHATS_ON_CARD_BODY')

                            done()
                        }, done)
                    })
                })
            })

        })

        describe('AMAZON.HelpIntent', function(){
            it('emits as expected', function(){
                let spy = sinon.spy(handlers, 'emit')

                handlers['AMAZON.HelpIntent']()

                expect(spy).to.have.been.calledWith(':ask', "I can tell you what's going on at Parliament today. Simply ask 'what's on'.", "I can tell you what's going on at Parliament today. Simply ask 'what's on'.")
            })
        })

        describe('LaunchRequest', function(){
            it('emits as expected', function(){
                let spy = sinon.spy(handlers, 'emit')

                handlers['LaunchRequest']()

                expect(spy).to.have.been.calledWith(':tell', 'Welcome to Parliament')
            })
        })
    })
})
