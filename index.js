/**
 * 
 * Package: 
 * Author: Desktop-CGI, Ganesh B
 * Email: desktopcgi@gmail.com
 * Description: Nodejs 
 * Install: 
 * Github: https://github.com/
 * npmjs Link: 
 * File: index.js
 * File Description: 
 * 
*/

/* eslint no-console: 0 */

'use strict';

const net = require('net');
const dgram = require('dgram');

function ProtocolInterface(config) {
    this.config = config;

    // Protocol Interface protocol init method
    this.init = function () {
        return new Error("protocolInterface: Init not implemented");
    }

    // Protocol Interface protocol connect method
    this.connect = function () {
        return new Error("protocolInterface: Connect not implemented");
    }

    // Protocol Interface protocol disconnect method
    this.disconnect = function () {
        return new Error("protocolInterface: Disconnect not implemented");
    }

    // Protocol Interface protocol serve method
    this.serve = function () {
        return new Error("protocolInterface: Serve not implemented");
    }

    // Protocol Interface protocol process messages method
    this.process = function () {
        return new Error("protocolInterface: Server Processor not implemented");
    }

    // Protocol Interface protocol send message method
    this.send = function () {
        return new Error("protocolInterface: Send Message not implemented");
    }

    // Protocol Interface protocol receive message method
    this.receive = function () {
        return new Error("protocolInterface: Receive Message not implemented");
    }
}

// function ProtocolServer(protocolName) {
//     this.protocolName = protocolName;
//     this.eventHandlers = {
//         init: [],
//         listening: [],
//         handshake: [],
//         connect: [],
//         receive: [],
//         processMessage: [],
//         respond: [],
//         disconnect: [],
//         shutdown: [],
//         error: [], // Dedicated error event
//     };

//     // Default error handler
//     this._defaultErrorHandler = (err, eventName, ...args) => {
//         console.warn(`[${this.protocolName}] Error in event "${eventName}":`, err, ...args);
//     };

//     // Attach the default error handler initially
//     this.onError(this._defaultErrorHandler);
// }

// ProtocolServer.prototype.on = function (event, handler) {
//     if (this.eventHandlers[event]) {
//         // Remove the default error handler if this is the first handler being registered
//         // for a non-error event
//         if (event !== 'error' && this.eventHandlers[event].length === 0 && this.eventHandlers.error.includes(this._defaultErrorHandler)) {
//             this.eventHandlers.error = this.eventHandlers.error.filter(h => h !== this._defaultErrorHandler);
//         }
//         this.eventHandlers[event].push(handler);
//     } else {
//         console.warn(`Event "${event}" is not a supported lifecycle event for ${this.protocolName}.`);
//     }
// };

// ProtocolServer.prototype.onError = function (handler) {
//     // Remove the default handler if a custom one is being registered for 'error'
//     if (this.eventHandlers.error.includes(this._defaultErrorHandler)) {
//         this.eventHandlers.error = this.eventHandlers.error.filter(h => h !== this._defaultErrorHandler);
//     }
//     this.on('error', handler);
// };

// ProtocolServer.prototype.call = async function (event, ...args) {
//     if (this.eventHandlers[event]) {
//         for (const handler of this.eventHandlers[event]) {
//             try {
//                 await handler.apply(this, args);
//             } catch (error) {
//                 console.error(`Error during ${event} event in ${this.protocolName}:`, error);
//                 this.call('error', error, event, ...args); // Emit an 'error' event
//             }
//         }
//     } else {
//         console.warn(`No handlers registered for event "${event}" in ${this.protocolName}.`);
//         this.call('error', new Error(`No handlers defined for event "${event}"`), event, ...args);
//     }
// };

// ProtocolServer.prototype.init = async function (config) {
//     console.log(`${this.protocolName} server initializing...`);
//     try {
//         await this.call('init', config);
//         console.log(`${this.protocolName} server initialized.`);
//     } catch (error) {
//         // Error during init is already caught in 'call'
//     }
// };

// ProtocolServer.prototype.listen = async function (port, address) {
//     try {
//         if (this.protocolName !== 'udp') {
//             console.log(`${this.protocolName} server listening on ${address}:${port}...`);
//             await this.call('listening', port, address);
//         } else {
//             console.log(`${this.protocolName} server bound to ${address}:${port}...`);
//             await this.call('listening', port, address); // 'listening' makes sense for UDP as well
//         }
//     } catch (error) {
//         // Error during listening is already caught in 'call'
//     }
// };

// ProtocolServer.prototype.handleConnection = async function (socket) {
//     const self = this; // Preserve 'this' context
//     console.log(`${this.protocolName} client connected.`);
//     try {
//         await this.call('connect', socket);

//         socket.on('data', async (data) => {
//             try {
//                 console.log(`${self.protocolName} received data:`, data);
//                 await self.call('receive', socket, data);

//                 const processedData = await self.processMessage(socket, data);
//                 if (processedData !== undefined) {
//                     await self.call('processMessage', socket, data, processedData);
//                     await self.respond(socket, processedData);
//                 }
//             } catch (error) {
//                 console.error(`${self.protocolName} error handling data:`, error);
//                 self.call('error', error, 'receive', socket, data);
//             }
//         });

//         socket.on('end', async () => {
//             try {
//                 console.log(`${self.protocolName} client disconnected.`);
//                 await self.call('disconnect', socket);
//             } catch (error) {
//                 console.error(`${self.protocolName} error during disconnect:`, error);
//                 self.call('error', error, 'disconnect', socket);
//             }
//         });

//         socket.on('error', (err) => {
//             console.error(`${self.protocolName} socket error:`, err);
//             self.call('error', err, 'socketError', socket); // Using 'socketError' for clarity
//         });
//     } catch (error) {
//         console.error(`${this.protocolName} error during connection handling:`, error);
//         self.call('error', error, 'connect', socket);
//     }
// };

// ProtocolServer.prototype.handleHandshake = async function (socket) {
//     console.log(`${this.protocolName} performing handshake...`);
//     try {
//         await this.call('handshake', socket);
//         console.log(`${this.protocolName} handshake complete.`);
//     } catch (error) {
//         console.error(`${this.protocolName} error during handshake:`, error);
//         this.call('error', error, 'handshake', socket);
//     }
// };

// ProtocolServer.prototype.receive = async function (socket, message) {
//     try {
//         console.log(`${this.protocolName} received message:`, message);
//         await this.call('receive', socket, message);
//     } catch (error) {
//         console.error(`${this.protocolName} error during receive:`, error);
//         this.call('error', error, 'receive', socket, message);
//     }
// };

// ProtocolServer.prototype.processMessage = async function (socket, message) {
//     console.log(`${this.protocolName} processing message:`, message);
//     try {
//         await this.call('processMessage', socket, message);
//         return undefined; // By default, no response
//     } catch (error) {
//         console.error(`${this.protocolName} error processing message:`, error);
//         this.call('error', error, 'processMessage', socket, message);
//         throw error; // Re-throw to potentially stop further processing
//     }
// };

// ProtocolServer.prototype.respond = async function (socket, response) {
//     console.log(`${this.protocolName} sending response:`, response);
//     try {
//         await this.call('respond', socket, response);
//         if (socket && socket.writable) {
//             socket.write(response);
//         } else if (socket) {
//             // For UDP, 'socket' might be the dgram socket, and we'd need to use send
//             console.warn(`${this.protocolName}: Cannot send response on this socket.`);
//         }
//     } catch (error) {
//         console.error(`${this.protocolName} error during respond:`, error);
//         this.call('error', error, 'respond', socket, response);
//     }
// };

// ProtocolServer.prototype.disconnect = async function (socket) {
//     console.log(`${this.protocolName} disconnecting client.`);
//     try {
//         await this.call('disconnect', socket);
//         if (socket) {
//             socket.end();
//             socket.destroy();
//         }
//     } catch (error) {
//         console.error(`${this.protocolName} error during disconnect:`, error);
//         this.call('error', error, 'disconnect', socket);
//     }
// };

// ProtocolServer.prototype.shutdown = async function () {
//     console.log(`${this.protocolName} server shutting down...`);
//     try {
//         await this.call('shutdown');
//         console.log(`${this.protocolName} server shut down.`);
//     } catch (error) {
//         console.error(`${this.protocolName} error during shutdown:`, error);
//         this.call('error', error, 'shutdown');
//     }
// };

// ProtocolServer (Function Implementation)
function ProtocolServer(protocolName) {
    this.protocolName = protocolName;
    this.eventHandlers = {
        init: [],
        listening: [],
        handshake: [],
        connect: [],
        receive: [],
        processMessage: [],
        respond: [],
        disconnect: [],
        shutdown: [],
        error: [],
    };
    this._defaultErrorHandler = (err, eventName, ...args) => {
        console.warn(`[${this.protocolName} Server] Error in event "${eventName}":`, err, ...args);
    };
    this.onError(this._defaultErrorHandler);
}

ProtocolServer.prototype.on = function (event, handler) {
    if (this.eventHandlers[event]) {
        if (event !== 'error' && this.eventHandlers[event].length === 0 && this.eventHandlers.error.includes(this._defaultErrorHandler)) {
            this.eventHandlers.error = this.eventHandlers.error.filter(h => h !== this._defaultErrorHandler);
        }
        this.eventHandlers[event].push(handler);
    } else {
        console.warn(`Event "${event}" is not a supported lifecycle event for ${this.protocolName}.`);
    }
};

ProtocolServer.prototype.onError = function (handler) {
    if (this.eventHandlers.error.includes(this._defaultErrorHandler)) {
        this.eventHandlers.error = this.eventHandlers.error.filter(h => h !== this._defaultErrorHandler);
    }
    this.on('error', handler);
};

ProtocolServer.prototype.call = async function (event, ...args) {
    if (this.eventHandlers[event]) {
        for (const handler of this.eventHandlers[event]) {
            try {
                await handler.apply(this, args);
            } catch (error) {
                console.error(`[${this.protocolName} Server] Error during ${event} event:`, error);
                this.call('error', error, event, ...args);
            }
        }
    } else {
        console.warn(`No handlers registered for event "${event}" in ${this.protocolName}.`);
        this.call('error', new Error(`No handlers defined for event "${event}"`), event, ...args);
    }
};

ProtocolServer.prototype.init = async function (config) {
    console.log(`${this.protocolName} server initializing...`);
    try {
        await this.call('init', config);
        console.log(`${this.protocolName} server initialized.`);
    } catch (error) {
        //errors are handled by the this.call
    }
};

ProtocolServer.prototype.listen = async function (port, address) {
    try {
        if (this.protocolName !== 'UDP') {
            console.log(`${this.protocolName} server listening on ${address}:${port}...`);
            await this.call('listening', port, address);
        } else {
            console.log(`${this.protocolName} server bound to ${address}:${port}...`);
            await this.call('listening', port, address); // 'listening' makes sense for UDP as well
        }
    } catch (error) {
        //errors are handled by this.call
    }
};

ProtocolServer.prototype.handleConnection = async function (socket) {
    const self = this; // Preserve 'this' context
    console.log(`${this.protocolName} client connected.`);
    try {
        await this.call('connect', socket);

        socket.on('data', async (data) => {
            try {
                console.log(`${self.protocolName} received data:`, data);
                await self.call('receive', socket, data);

                const processedData = await self.processMessage(socket, data);
                if (processedData !== undefined) {
                    await self.call('processMessage', socket, data, processedData);
                    await self.respond(socket, processedData);
                }
            } catch (error) {
                console.error(`${self.protocolName} error handling data:`, error);
                self.call('error', error, 'receive', socket, data);
            }
        });

        socket.on('end', async () => {
            try {
                console.log(`${self.protocolName} client disconnected.`);
                await self.call('disconnect', socket);
            } catch (error) {
                console.error(`${self.protocolName} error during disconnect:`, error);
                self.call('error', error, 'disconnect', socket);
            }
        });

        socket.on('error', (err) => {
            console.error(`${self.protocolName} socket error:`, err);
            self.call('error', err, 'socketError', socket); // Using 'socketError' for clarity
        });
    } catch (error) {
        console.error(`${this.protocolName} error during connection handling:`, error);
        self.call('error', error, 'connect', socket);
    }
};

ProtocolServer.prototype.handleHandshake = async function (socket) {
    console.log(`${this.protocolName} performing handshake...`);
    try {
        await this.call('handshake', socket);
        console.log(`${this.protocolName} handshake complete.`);
    } catch (error) {
        console.error(`${this.protocolName} error during handshake:`, error);
        this.call('error', error, 'handshake', socket);
    }
};

ProtocolServer.prototype.receive = async function (socket, message) {
    try {
        console.log(`${this.protocolName} received message:`, message);
        await this.call('receive', socket, message);
    } catch (error) {
        console.error(`${this.protocolName} error during receive:`, error);
        this.call('error', error, 'receive', socket, message);
    }
};

ProtocolServer.prototype.processMessage = async function (socket, message) {
    console.log(`${this.protocolName} processing message:`, message);
    try {
        await this.call('processMessage', socket, message);
        return undefined; // By default, no response
    } catch (error) {
        console.error(`${this.protocolName} error processing message:`, error);
        this.call('error', error, 'processMessage', socket, message);
        throw error; // Re-throw to potentially stop further processing
    }
};

ProtocolServer.prototype.respond = async function (socket, response, rinfo) {
    console.log(`${this.protocolName} sending response:`, response);
    try {
        await this.call('respond', socket, response, rinfo);
        if (socket && socket.writable) {
            socket.write(response);
        } else if (socket && rinfo) { //handle the rinfo
            const buffer = Buffer.from(response);
            socket.send(buffer, 0, buffer.length, rinfo.port, rinfo.address, (err) => {
                if (err) {
                    console.error(`[${this.protocolName}] error sending udp response:`, err);
                    this.call('error', err, 'respond', socket, response, rinfo);
                }
            });
        }
        else {
            console.warn(`${this.protocolName}: Cannot send response on this socket.`);
        }
    } catch (error) {
        console.error(`${this.protocolName} error during respond:`, error);
        this.call('error', error, 'respond', socket, response, rinfo);
    }
};

ProtocolServer.prototype.disconnect = async function (socket) {
    console.log(`${this.protocolName} disconnecting client.`);
    try {
        await this.call('disconnect', socket);
        if (socket) {
            socket.end();
            socket.destroy();
        }
    } catch (error) {
        console.error(`${this.protocolName} error during disconnect:`, error);
        this.call('error', error, 'disconnect', socket);
    }
};

ProtocolServer.prototype.shutdown = async function () {
    console.log(`${this.protocolName} server shutting down...`);
    try {
        await this.call('shutdown');
        console.log(`${this.protocolName} server shut down.`);
    } catch (error) {
        console.error(`${this.protocolName} error during shutdown:`, error);
        this.call('error', error, 'shutdown');
    }
};


function ProtocolClient(protocolName) {
    this.protocolName = protocolName;
    this.eventHandlers = {
        connect: [],
        handshake: [],
        send: [],
        receive: [],
        disconnect: [],
        error: [],
    };
    this.connection = null; // To hold the connection object (e.g., socket)
    this._defaultErrorHandler = (err, eventName, ...args) => {
        console.warn(`[${this.protocolName} Client] Error in event "${eventName}":`, err, ...args);
    };
    this.onError(this._defaultErrorHandler);
}

ProtocolClient.prototype.on = function (event, handler) {
    if (this.eventHandlers[event]) {
        if (event !== 'error' && this.eventHandlers[event].length === 0 && this.eventHandlers.error.includes(this._defaultErrorHandler)) {
            this.eventHandlers.error = this.eventHandlers.error.filter(h => h !== this._defaultErrorHandler);
        }
        this.eventHandlers[event].push(handler);
    } else {
        console.warn(`Event "${event}" is not a supported client event for ${this.protocolName}.`);
    }
};

ProtocolClient.prototype.onError = function (handler) {
    if (this.eventHandlers.error.includes(this._defaultErrorHandler)) {
        this.eventHandlers.error = this.eventHandlers.error.filter(h => h !== this._defaultErrorHandler);
    }
    this.on('error', handler);
};

ProtocolClient.prototype.call = async function (event, ...args) {
    if (this.eventHandlers[event]) {
        for (const handler of this.eventHandlers[event]) {
            try {
                await handler.apply(this, args);
            } catch (error) {
                console.error(`[${this.protocolName} Client] Error during ${event} event:`, error);
                this.call('error', error, event, ...args);
            }
        }
    } else {
        console.warn(`[${this.protocolName} Client] No handlers registered for event "${event}".`);
        this.call('error', new Error(`No handlers defined for client event "${event}"`), event, ...args);
    }
};

ProtocolClient.prototype.connect = async function (serverAddress, serverPort) {
    console.log(`${this.protocolName} client connecting to ${serverAddress}:${serverPort}...`);
    try {
        this.connection = await this._connectToServer(serverAddress, serverPort);
        console.log(`${this.protocolName} client connected.`);
        await this.call('connect', this.connection);
        this._setupConnectionListeners(this.connection);
    } catch (error) {
        console.error(`[${this.protocolName} Client] Connection error:`, error);
        await this.call('error', error, 'connect', serverAddress, serverPort);
        throw error;
    }
};

// Abstract method to be implemented by specific protocols
ProtocolClient.prototype._connectToServer = async function (serverAddress, serverPort) {
    throw new Error('_connectToServer method must be implemented by subclasses.');
};

ProtocolClient.prototype._setupConnectionListeners = function (connection) {
    const self = this;
    connection.on('data', async (data) => {
        console.log(`${self.protocolName} client received data:`, data);
        await self.call('receive', connection, data);
    });

    connection.on('end', async () => {
        console.log(`${self.protocolName} client disconnected from server.`);
        await self.call('disconnect', connection);
        self.connection = null;
    });

    connection.on('error', async (err) => {
        console.error(`[${self.protocolName} Client] Connection error:`, err);
        await self.call('error', err, 'connectionError', connection);
        self.connection = null;
    });
};

ProtocolClient.prototype.handshake = async function () {
    console.log(`${this.protocolName} client performing handshake...`);
    try {
        await this.call('handshake', this.connection);
        console.log(`${this.protocolName} client handshake complete.`);
    } catch (error) {
        console.error(`[${this.protocolName} Client] Handshake error:`, error);
        await this.call('error', error, 'handshake', this.connection);
        throw error;
    }
};

ProtocolClient.prototype.send = async function (message) {
    console.log(`${this.protocolName} client sending message:`, message);
    try {
        await this.call('send', this.connection, message);
        if (this.connection && this.connection.writable) {
            this.connection.write(message);
        } else {
            console.warn(`[${this.protocolName} Client] Connection is not writable.`);
            this.call('error', new Error('Connection not writable'), 'send', this.connection, message);
        }
    } catch (error) {
        console.error(`[${this.protocolName} Client] Error sending message:`, error);
        await this.call('error', error, 'send', this.connection, message);
        throw error;
    }
};

ProtocolClient.prototype.receive = async function (message) {
    console.log(`${this.protocolName} client received message:`, message);
    await this.call('receive', this.connection, message);
};

ProtocolClient.prototype.disconnect = async function () {
    console.log(`${this.protocolName} client disconnecting...`);
    try {
        await this.call('disconnect', this.connection);
        if (this.connection) {
            this.connection.end();
            this.connection.destroy();
            this.connection = null;
        }
        console.log(`${this.protocolName} client disconnected.`);
    } catch (error) {
        console.error(`[${this.protocolName} Client] Error during disconnection:`, error);
        await this.call('error', error, 'disconnect', this.connection);
        throw error;
    }
};

module.exports = { ProtocolInterface, ProtocolServer, ProtocolClient };
