const rp = require('request-promise')
const cheerio = require('cheerio')

module.exports = {
    'WhatsOnIntent': function(callback, done) {
        let options = {
            uri: 'http://calendar.parliament.uk/'
        };

        handlers = this

        rp(options)
            .then(function(body) {
                let string = ['At parliament today, there are events in ']

                const $ = cheerio.load(body)

                console.log('Iterating over panels')

                $('#results-container .tab-content .panel').each(function(i, elem) {
                    // string.push($(this).text())

                    let panel_title = $(this).children('.parl-calendar-eventgrouping.panel-heading').children('.parl-calendar-eventgrouping-title').text()

                    let no_content_message_present = ($(this).children('.panel-body').children('p.parl-calendar-event-no-results') > 0)

                    if(!no_content_message_present) {
                        console.log('Panel has content '+panel_title)

                        string.push(panel_title)
                        string.push('has')

                        let rows = $(this).children('.panel-body').children().children('table').children('tr')

                        string.push(rows.length)
                        string.push(rows.length == 1 ? 'event' : 'events')

                        console.log('Going into rows')

                        $(rows).each(function(i,elem) {
                            console.log('In row')

                            let content_column = $(this).children('td.col-xs-9')
                            string.push($(content_column).children('p.parl-calendar-event-title').text().trim())
                            string.push($(content_column).children('p.parl-calendar-event-description').text().trim())
                        })
                    }

                });

                console.log('ABOUT TO EMIT')

                handlers.emit(':tellWithCard', string.join(' '), handlers.t('WHATS_ON_CARD_TITLE'), handlers.t('WHATS_ON_CARD_BODY'));

                console.log('FINISHED EMIT')

                if(callback)
                    callback(done)
            }).catch(function(err) {
                handlers.emit(':tell', handlers.t('WHATS_ON_ERROR'))

                if(callback)
                    callback(done)
        })
    },

    'AMAZON.HelpIntent': function() {
        var message = this.t('HELP_TEXT')
        this.emit(':ask', message, message)
    },

    'LaunchRequest': function () {
        this.emit(':tell', this.t('LAUNCH_TEXT'));
    }
};
