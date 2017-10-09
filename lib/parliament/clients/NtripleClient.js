'use strict';

const N3 = require('n3');
const Https = require('follow-redirects').https;
const winston = require('../helpers/logger');

/**
 * This is a small wrapper client for the Parliament N-triple API.
 */
class NtripleClient {

    /**
     * Retrieve an instance of the Ntriple API client.
     * @param endpoint the endpoint of the Ntriple APIs.
     */
    constructor(endpoint) {
        winston.log("Creating NtripleClient instance.");
        this.endpoint = endpoint;
    }

    /**
     * This will make a request to the Ntriple API using the endpoint
     * the NTriple Client was initialized with.
     * This will return a promise which fulfills to a N3 Store.
     * @return {Promise} promise for the request in flight.
     */
    getTripleStore(path) {
        const options = this.__getRequestOptions(path);

        return new Promise((fulfill, reject) => {
            this.__handleNtripleAPIRequest(options, fulfill, reject);
        });
    }

    /**
     * This is a helper method that makes requests to the Ntriple API and handles the response
     * in a generic manner. It will also resolve promise methods.
     * @param requestOptions
     * @param fulfill
     * @param reject
     * @private
     */
    __handleNtripleAPIRequest(requestOptions, fulfill, reject) {
        winston.log('getting:');
        winston.log(requestOptions);

        Https.get(requestOptions, (response) => {
            let data_string = '';

            winston.log(`NTriple API responded with a status code of : ${response.statusCode}`);

            // Report back a 500 so it can be handled in the app
            if (('' + response.statusCode).match(/^5\d\d$/))
                fulfill({ statusCode: response.statusCode, store: null });

            response.on('data', (chunk) => {
                winston.log(`Received data from: ${response.responseUrl}`);

                data_string += chunk;
            });

            response.on('end', () => {
                winston.log(`Finished receiving data from: ${response.responseUrl}`);

                let parser = N3.Parser();
                let store = N3.Store();

                let responseObject = {
                    statusCode: response.statusCode,
                    store: store
                };

                parser.parse(data_string, function(error, triple, prefixes){
                    if(triple) {
                        store.addTriple(triple);
                    } else {
                        winston.log('Parsing completed; Triple store contains %d triples.', store.size);

                        responseObject.store = store;

                        fulfill(responseObject);
                    }
                });
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
                'alexa-parliament': 'true',
                accept: 'application/n-triples'
            }
        };
    }
}

module.exports = NtripleClient;