// "Class" implementation for HTTPServer using prototypical inheritance
const http = require('http');
const https = require('https');
const net = require('net');

const { ProtocolServer } = require('../index.js');


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

}

// runClients();

module.exports = { TCPClient };

