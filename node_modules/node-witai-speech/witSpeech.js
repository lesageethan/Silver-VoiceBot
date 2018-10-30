const request = require('request');
const _ = require('underscore');
const VERSION = "20170217";
const API_ENDPOINT = 'https://api.wit.ai/speech';


/**
 * Adds header field required to authorize the applicaiton
 * 
 * @param {any} access_token 
 * @param {any} others 
 * @returns 
 */
const accessHeaders = function (access_token, others) {
    return _.extend(others || {}, {
        'Authorization': 'Bearer ' + access_token,
        'Accept': 'application/vnd.wit.' + VERSION
    });
};

/**
 * Returns the meaning extracted from a audio stream
 * @param access_token your access token of wit.ai instance
 * @param stream The audio file to stream over WIT.AI
 * @param content_type The content-type for this audio stream (audio/wav, ...)
 * @param [options] extra object to be passed to wit in json format. Can include any of 'context', 'verbose', 'n'
 * @param callback callback that takes 2 arguments err and the response body
 */
const extractSpeechIntent = function (access_token, stream, content_type, options, callback) {
    if (!callback) {
        callback = options;
        options = undefined;
    }

    // Set up the query (empty b/c not sending 'q')
    query_params = _.extend({}, options);

    // Request options
    const request_options = {
        url: API_ENDPOINT,
        qs: query_params, // may be empty object
        method: 'POST',
        json: true,
        headers: accessHeaders(access_token, { 'Content-Type': content_type })
    };

    // Pipe the request
    stream.pipe(request(request_options, function (error, response, body) {
        if (response && response.statusCode != 200) {
            error = "Invalid response received from server: " + response.statusCode
        }
        callback(error, body);
    }));
};

module.exports = {
    extractSpeechIntent
}