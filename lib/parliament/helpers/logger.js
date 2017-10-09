'use strict';

let Winston = require('winston');

module.exports = new Winston.Logger({
    level: (process.env.TEST == 'true') ? 'error' : 'verbose',
    transports: [
        new Winston.transports.Console({
            timestamp: true
        })
        // new Winston.transports.File({
        //     filename: 'app.log',
        //     timestamp: true
        // })
    ]
});
