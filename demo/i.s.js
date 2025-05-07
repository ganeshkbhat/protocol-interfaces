// "Class" implementation for HTTPServer using prototypical inheritance
const http = require('http');
const https = require('https');
const net = require('net');

const { ProtocolServer } = require('../index.js');

function HTTPServer() {
    ProtocolServer.call(this, 'HTTP');
    this.on('init', this.httpInit);
    this.on('connect', this.httpConnect);
    this.on('receive', this.httpReceiveMessage);
}

// Inherit prototype methods from ProtocolServer
HTTPServer.prototype = Object.create(ProtocolServer.prototype);
HTTPServer.prototype.constructor = HTTPServer;

HTTPServer.prototype.httpInit = function (config) {
    console.log('HTTP Server specific initialization:', config);
    try {
        this.config = config;
        this.server = net.createServer(this.handleConnection.bind(this));
    } catch (error) {
        console.error('Error during HTTP init:', error);
        this.call('error', error, 'httpInit', config);
        throw error;
    }
};

HTTPServer.prototype.httpConnect = function (socket) {
    console.log('New HTTP connection established.');
    try {
        // HTTP-specific connection setup
    } catch (error) {
        console.error('Error during HTTP connect:', error);
        this.call('error', error, 'httpConnect', socket);
    }
};

HTTPServer.prototype.httpReceiveMessage = function (socket, data) {
    console.log('HTTP received data:', data.toString());
    try {
        // HTTP-specific data handling
    } catch (error) {
        console.error('Error during HTTP receive:', error);
        this.call('error', error, 'httpReceiveMessage', socket, data);
    }
};

HTTPServer.prototype.processMessage = async function (socket, data) {
    const request = data.toString();
    console.log('Processing HTTP request:', request);
    try {
        // Your HTTP request parsing and handling logic here
        const response = `HTTP/1.1 200 OK\r\nContent-Length: 13\r\n\r\nHello, World!`;
        return response;
    } catch (error) {
        console.error('Error processing HTTP message:', error);
        this.call('error', error, 'processMessage', socket, data);
        throw error;
    }
};

HTTPServer.prototype.listen = async function (port, address = '0.0.0.0') {
    try {
        await ProtocolServer.prototype.listen.call(this, port, address);
        this.server.listen(port, address, () => {
            console.log(`HTTP server listening on ${address}:${port}`);
        });
    } catch (error) {
        console.error('Error during HTTP listen:', error);
        this.call('error', error, 'listen', port, address);
        throw error;
    }
};

HTTPServer.prototype.shutdown = async function () {
    try {
        await ProtocolServer.prototype.shutdown.call(this);
        if (this.server) {
            this.server.close(() => {
                console.log('HTTP server closed.');
            });
        }
    } catch (error) {
        console.error('Error during HTTP shutdown:', error);
        this.call('error', error, 'shutdown');
        throw error;
    }
};


function TCPClient() {
    ProtocolClient.call(this, 'TCP');
}

TCPClient.prototype = Object.create(ProtocolClient.prototype);
TCPClient.prototype.constructor = TCPClient;

TCPClient.prototype._connectToServer = async function (serverAddress, serverPort) {
    return new Promise((resolve, reject) => {
        const client = net.connect(serverPort, serverAddress, () => {
            resolve(client);
        });

        client.on('error', (err) => {
            reject(err);
        });
    });
};

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
    // TCP Client Example
    const tcpClient = new TCPClient();

    tcpClient.on('connect', (connection) => {
        console.log('TCP Client: Connected to server!');
    });

    tcpClient.on('handshake', (connection) => {
        console.log('TCP Client: Handshake completed!');
        tcpClient.send(Buffer.from('Hello from TCP Client!'));
    });

    tcpClient.on('send', (connection, message) => {
        console.log('TCP Client: Message sent:', message.toString());
    });

    tcpClient.on('receive', (connection, data) => {
        console.log('TCP Client: Received data:', data.toString());
        if (data.toString() === 'World from TCP Server!') {
            tcpClient.disconnect();
        } else if (!tcpClient._handshakeCompleted) {
            tcpClient._handshakeCompleted = true;
            tcpClient.handshake();
        }
    });

    tcpClient.on('disconnect', (connection) => {
        console.log('TCP Client: Disconnected from server.');
    });

    tcpClient.onError((err, eventName, ...args) => {
        console.error(`[TCP Client] Error in event "${eventName}":`, err, ...args);
    });

    try {
        await tcpClient.connect('127.0.0.1', 3000);
        if (!tcpClient._handshakeCompleted) {
            tcpClient._handshakeCompleted = true;
            await tcpClient.handshake();
        }
    } catch (error) {
        console.error('TCP Client failed to start:', error);
    }

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

module.exports = { HTTPServer, HTTPClient, TCPClient };

