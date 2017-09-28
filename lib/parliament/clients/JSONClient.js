'use strict';

const Https = require('follow-redirects').https;
const Http = require('follow-redirects').http;
const winston = require('winston');

/**
 * This is a small wrapper client for a JSON API.
 */
class JSONClient {

    /**
     * Retrieve an instance of the Ntriple API client.
     * @param endpoint the endpoint of the Ntriple APIs.
     */
    constructor(endpoint, https=true) {
        winston.log("Creating JSONClient instance.");
        this.endpoint = endpoint;
        this.https = https;
    }

    /**
     * This will make a request to the JSON API using the endpoint
     * the JSON Client was initialized with.
     * This will return a promise which fulfills to a JSON Object.
     * @return {Promise} promise for the request in flight.
     */
    getJSON(path) {
        const options = this.__getRequestOptions(path);

        return new Promise((fulfill, reject) => {
            this.__handleJSONApiRequest(options, fulfill, reject);
        });
    }

    /**
     * This is a helper method that makes requests to the Address API and handles the response
     * in a generic manner. It will also resolve promise methods.
     * @param requestOptions
     * @param fulfill
     * @param reject
     * @private
     */
    __handleJSONApiRequest(requestOptions, fulfill, reject) {
        winston.log('getting:');
        winston.log(requestOptions);

        let connection = this.https ? Https : Http;
        connection.get(requestOptions, (response) => {
            let data_string = '';

            winston.log(`JSON API responded with a status code of : ${response.statusCode}`);

            // Report back a 500 so it can be handled in the app
            if (('' + response.statusCode).match(/^5\d\d$/))
                fulfill({ statusCode: response.statusCode, json: null });

            response.on('data', (chunk) => {
                winston.log(`Received data from: ${response.responseUrl}`);

                data_string += chunk;
            });

            response.on('end', () => {
                winston.log(`Finished receiving data from: ${response.responseUrl}`);

                let responseObject = {
                    statusCode: response.statusCode,
                    json: null
                };

                // Early exit if there is no data to parse
                if(data_string.trim().length <= 0) {
                    fulfill(responseObject);
                    return;
                }

                try {
                    let jsonObject = JSON.parse(data_string);
                    responseObject.json = jsonObject;
                } catch (e) {
                    winston.log('error parsing data_string into JSON:');
                    winston.log('---- Error: ----');
                    winston.error(e);
                    winston.log('---- Data:  ----');
                    winston.log(data_string);

                    reject();
                    return
                }

                fulfill(responseObject);
            })
        }).on('error', (e) => {
            winston.error(e);
            reject();
        });
    }

    /**
     * Private helper method for retrieving request options.
     * @param path the path that you want to hit against the API provided by the skill event.
     * @return {{hostname: string, path: *, method: string, headers: {Authorization: string}}}
     * @private
     */
    __getRequestOptions(path) {
        return {
            hostname: this.endpoint,
            path: path,
            method: 'GET',
            'headers': {
                'alexa-parliament': 'true'
            }
        };
    }
}

module.exports = JSONClient;