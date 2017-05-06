module.exports = {
    'WhatsOnIntent': function() {
        this.emit(':tellWithCard', "What's on at Parliaemnt.", this.t('WHATS_ON_CARD_TITLE'), this.t('WHATS_ON_CARD_BODY'))
    },

    'AMAZON.HelpIntent': function() {
        var message = this.t('HELP_TEXT');
        this.emit(':ask', message, message);
    }
};
