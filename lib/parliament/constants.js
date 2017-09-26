'use strict';

module.exports = Object.freeze({

    // App-ID
    appId : 'amzn1.ask.skill.d9431bea-6b44-4cea-b4ff-d4781bd09504',

    //  DynamoDB Table name
    dynamoDBTableName : 'ParliamentAlexaSkill',

    /*
     *  States:
     *  START_MODE : Welcome state when the skill has started.
     *  WHATS_ON :  When the user has asked whats on and begun down that track
     *  STREAMING : What's
     */
    states : {
        START_MODE : '',
        WHATS_ON : '_WHATS_ON',
        STREAMING : '_STREAMING'
    }
});