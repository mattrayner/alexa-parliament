'use strict';

const Https = require('https');

/**
 * This is a small wrapper client for a JSON API.
 */
class AlexaJSONClient {

    /**
     * Retrieve an instance of the Ntriple API client.
     * @param endpoint the endpoint of the Ntriple APIs.
     */
    constructor(endpoint) {
        console.log("Creating AlexaJSONClient instance.");
        this.endpoint = endpoint;
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
        console.log('getting:');
        console.log(requestOptions);

        Https.get(requestOptions, (response) => {
            console.log(`Device Address API responded with a status code of : ${response.statusCode}`);

            response.on('data', (data) => {
                let responsePayloadObject = JSON.parse(data);

                const deviceAddressResponse = {
                    statusCode: response.statusCode,
                    address: responsePayloadObject
                };

                fulfill(deviceAddressResponse);
            });
        }).on('error', (e) => {
            console.error(e);
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

module.exports = AlexaJSONClient;