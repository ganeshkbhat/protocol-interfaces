// "Class" implementation for HTTPServer using prototypical inheritance
const http = require('http');
const https = require('https');
const net = require('net');

const { ProtocolServer } = require('../index.js');

// HTTP Client (function implementation using prototypical inheritance)
function HTTPClient(options = {}) {
    ProtocolClient.call(this, 'HTTP');
    this.options = {
        method: 'GET',
        ...options,
    };
}

HTTPClient.prototype = Object.create(ProtocolClient.prototype);
HTTPClient.prototype.constructor = HTTPClient;

HTTPClient.prototype._connectToServer = async function (serverAddress, serverPort) {
    // HTTP doesn't have a persistent connection at the socket level in the same way as TCP.
    // Each request is a new "connection" in a sense, though keep-alive can reuse underlying sockets.
    // We'll perform the request within the send method.
    return Promise.resolve(); // Resolve immediately as the connection is per-request
};

HTTPClient.prototype.send = async function (requestOptions = {}, requestBody) {
    const options = {
        ...this.options,
        ...requestOptions,
        hostname: this.options.hostname || requestOptions.hostname,
        port: this.options.port || requestOptions.port,
        path: this.options.path || requestOptions.path || '/',
        protocol: this.options.protocol || requestOptions.protocol || 'http:',
    };

    const protocol = options.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
        const req = protocol.request(options, (res) => {
            this.connection = req.socket; // Store the socket for potential reuse (keep-alive)
            this.call('connect', req.socket); // Simulate connect event

            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
                this.call('receive', req.socket, chunk);
            });

            res.on('end', () => {
                this.call('disconnect', req.socket); // Simulate disconnect event
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: responseData,
                });
                this.connection = null;
            });

            res.on('error', (err) => {
                this.call('error', err, 'responseError', req.socket);
                reject(err);
                this.connection = null;
            });
        });

        req.on('error', (err) => {
            this.call('error', err, 'requestError', null);
            reject(err);
            this.connection = null;
        });

        this.call('send', null, { options, body: requestBody }); // No persistent connection yet

        if (requestBody) {
            req.write(requestBody);
        }
        req.end();
    });
};

HTTPClient.prototype.handshake = async function () {
    console.log('HTTP Client: No explicit handshake.');
    await this.call('handshake', this.connection);
};

HTTPClient.prototype.disconnect = async function () {
    console.log('HTTP Client: Disconnecting (ending request).');
    if (this.connection) {
        this.connection.end(); // Attempt to close the underlying socket (if keep-alive is not active)
        this.connection.destroy();
        this.connection = null;
        await this.call('disconnect', this.connection);
    } else {
        await this.call('disconnect', null);
    }
};

HTTPClient.prototype.sendRequest = async function (options, body) {
    return this.send(options, body);
};

// Example usage (same as before, but using the function implementations):
async function runClients() {


    // HTTP Client Example
    const httpClient = new HTTPClient({
        hostname: 'jsonplaceholder.typicode.com',
        port: 443,
        protocol: 'https:',
        path: '/todos/1',
        method: 'GET',
    });

    httpClient.on('connect', (socket) => {
        console.log('HTTP Client: Socket connected.');
    });

    httpClient.on('send', (socket, message) => {
        console.log('HTTP Client: Sending request:', message.options.method, message.options.path);
        if (message.body) {
            console.log('HTTP Client: Sending body:', message.body);
        }
    });

    httpClient.on('receive', (socket, data) => {
        // console.log('HTTP Client: Received data chunk:', data.toString());
    });

    httpClient.on('disconnect', (socket) => {
        console.log('HTTP Client: Socket disconnected.');
    });

    httpClient.onError((err, eventName, ...args) => {
        console.error(`[HTTP Client] Error in event "${eventName}":`, err, ...args);
    });

    try {
        const response = await httpClient.sendRequest();
        console.log('HTTP Client: Response Status Code:', response.statusCode);
        console.log('HTTP Client: Response Headers:', response.headers);
        console.log('HTTP Client: Response Data:', response.data);
        await httpClient.disconnect();
    } catch (error) {
        console.error('HTTP Client request failed:', error);
    }

    // Example POST request
    const postClient = new HTTPClient({
        hostname: 'jsonplaceholder.typicode.com',
        port: 443,
        protocol: 'https:',
        path: '/posts',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    try {
        const postData = JSON.stringify({
            title: 'foo',
            body: 'bar',
            userId: 1,
        });
        const postResponse = await postClient.sendRequest({}, postData);
        console.log('\nHTTP Client (POST) Response Status Code:', postResponse.statusCode);
        console.log('HTTP Client (POST) Response Data:', postResponse.data);
        await postClient.disconnect();
    } catch (error) {
        console.error('HTTP Client (POST) request failed:', error);
    }
}

// runClients();

module.exports = { HTTPClient };

