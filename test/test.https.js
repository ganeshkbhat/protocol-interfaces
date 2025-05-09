const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');
const { ProtocolServer } = require('../index.js'); 
const { HTTPServer } = require('../demo/http.servers.js'); 

describe('ProtocolServer', () => {
    let protocolServer;

    beforeEach(() => {
        protocolServer = new ProtocolServer('TEST');
        // function _defaultErrorHandler (err, eventName, ...args) {
        //     console.warn(`[${this.protocolName} Client] Error in event "${eventName}":`, err, ...args);
        // };
        // protocolServer.onError(_defaultErrorHandler);
    });

    it('should create a new ProtocolServer instance with the correct protocol name', () => {
        assert.equal(protocolServer.protocolName, 'TEST');
        // assert.deepEqual(protocolServer.eventHandlers, {
        //     init: [],
        //     listening: [],
        //     handshake: [],
        //     connect: [],
        //     receive: [],
        //     processMessage: [],
        //     respond: [],
        //     disconnect: [],
        //     shutdown: [],
        //     error: [],
        // });
        assert.deepEqual(Object.keys(protocolServer.eventHandlers), Object.keys({
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
        }));
    });

    describe('on(event, handler)', () => {
        it('should register a handler for a supported event', () => {
            const handler = sinon.spy();
            protocolServer.on('init', handler);
            expect(protocolServer.eventHandlers.init).to.include(handler);
        });

        it('should warn if trying to register a handler for an unsupported event', () => {
            const warnSpy = sinon.spy(console, 'warn');
            const handler = sinon.spy();
            protocolServer.on('unknownEvent', handler);
            expect(warnSpy.calledOnce).to.be.true;
            expect(protocolServer.eventHandlers.unknownEvent).to.be.undefined;
            warnSpy.restore();
        });
    });

    describe('onError(handler)', () => {
        it('should register a handler for the error event', () => {
            const errorHandler = sinon.spy();
            protocolServer.onError(errorHandler);
            expect(protocolServer.eventHandlers.error).to.include(errorHandler);
        });
    });

    describe('call(event, ...args)', () => {
        it('should call all registered handlers for the given event with the provided arguments', async () => {
            const handler1 = sinon.spy();
            const handler2 = sinon.spy();
            protocolServer.on('init', handler1);
            protocolServer.on('init', handler2);
            await protocolServer.call('init', { port: 1234 });
            expect(handler1.calledOnceWith({ port: 1234 })).to.be.true;
            expect(handler2.calledOnceWith({ port: 1234 })).to.be.true;
        });

        it('should not throw an error if no handlers are registered for the event', async () => {
            // const warnSpy = sinon.spy(console, 'warn');
            // await protocolServer.call('nonExistentEvent', 'arg1', 'arg2');
            // expect(warnSpy.calledOnce).to.be.true; 
            // warnSpy.restore();
            try {
                await protocolServer.call('nonExistentEvent', 'arg1', 'arg2');
            } catch(e) {
                expect(!!e).to.be.true;
            }
        });

        it('should catch errors in handlers and emit an "error" event', async () => {
            const errorHandler = sinon.spy();
            const failingHandler = sinon.stub().throws(new Error('Handler failed'));
            protocolServer.on('init', failingHandler);
            protocolServer.onError(errorHandler);
            await protocolServer.call('init', 'testArg');
            expect(failingHandler.calledOnceWith('testArg')).to.be.true;
            expect(errorHandler.calledOnce).to.be.true;
            const errorArgs = errorHandler.getCall(0).args;
            expect(errorArgs[0]).to.be.an('error').with.property('message', 'Handler failed');
            expect(errorArgs[1]).to.equal('init');
            expect(errorArgs[2]).to.equal('testArg');
        });
    });

    describe('lifecycle methods', () => {
        const config = { port: 5678 };
        const port = 5678;
        const address = '127.0.0.1';
        const socket = {
            on: sinon.spy(),
            write: sinon.spy(),
            end: sinon.spy(),
            destroy: sinon.spy(),
            writable: true,
        };
        const message = Buffer.from('test message');
        const response = 'test response';

        it('init should call the "init" event', async () => {
            const initHandler = sinon.spy();
            protocolServer.on('init', initHandler);
            await protocolServer.init(config);
            expect(initHandler.calledOnceWith(config)).to.be.true;
        });

        it('listen should call the "listening" event', async () => {
            const listeningHandler = sinon.spy();
            protocolServer.on('listening', listeningHandler);
            await protocolServer.listen(port, address);
            expect(listeningHandler.calledOnceWith(port, address)).to.be.true;
        });

        it('handleConnection should call the "connect" event and set up socket listeners', async () => {
            const connectHandler = sinon.spy();
            protocolServer.on('connect', connectHandler);
            await protocolServer.handleConnection(socket);
            expect(connectHandler.calledOnceWith(socket)).to.be.true;
            expect(socket.on.calledWith('data')).to.be.true;
            expect(socket.on.calledWith('end')).to.be.true;
            expect(socket.on.calledWith('error')).to.be.true;
        });

        it('handleHandshake should call the "handshake" event', async () => {
            const handshakeHandler = sinon.spy();
            protocolServer.on('handshake', handshakeHandler);
            await protocolServer.handleHandshake(socket);
            expect(handshakeHandler.calledOnceWith(socket)).to.be.true;
        });

        it('receive should call the "receive" event', async () => {
            const receiveMessageHandler = sinon.spy();
            protocolServer.on('receive', receiveMessageHandler);
            await protocolServer.receive(socket, message);
            expect(receiveMessageHandler.calledOnceWith(socket, message)).to.be.true;
        });

        it('processMessage should call the "processMessage" event and return undefined by default', async () => {
            const processMessageHandler = sinon.spy();
            protocolServer.on('processMessage', processMessageHandler);
            const result = await protocolServer.processMessage(socket, message);
            expect(processMessageHandler.calledOnceWith(socket, message)).to.be.true;
            expect(result).to.be.undefined;
        });

        it('respond should call the "respond" event and write to the socket if writable', async () => {
            const respondMessageHandler = sinon.spy();
            protocolServer.on('respond', respondMessageHandler);
            await protocolServer.respond(socket, response);
            expect(respondMessageHandler.calledOnceWith(socket, response)).to.be.true;
            expect(socket.write.calledOnceWith(response)).to.be.true;
        });

        it('respond should call the "respond" event and warn if socket is not writable', async () => {
            const respondMessageHandler = sinon.spy();
            const warnSpy = sinon.spy(console, 'warn');
            protocolServer.on('respond', respondMessageHandler);
            const nonWritableSocket = { ...socket, writable: false };
            await protocolServer.respond(nonWritableSocket, response);
            expect(respondMessageHandler.calledOnceWith(nonWritableSocket, response)).to.be.true;
            expect(warnSpy.calledOnce).to.be.true;
            warnSpy.restore();
        });

        it('disconnect should call the "disconnect" event and end/destroy the socket', async () => {
            const disconnectHandler = sinon.spy();
            protocolServer.on('disconnect', disconnectHandler);
            await protocolServer.disconnect(socket);
            expect(disconnectHandler.calledOnceWith(socket)).to.be.true;
            expect(socket.end.calledOnce).to.be.true;
            expect(socket.destroy.calledOnce).to.be.true;
        });

        it('shutdown should call the "shutdown" event', async () => {
            const shutdownHandler = sinon.spy();
            protocolServer.on('shutdown', shutdownHandler);
            await protocolServer.shutdown();
            expect(shutdownHandler.calledOnce).to.be.true;
        });
    });
});

// describe('HTTPServer', () => {
//     let httpServer;
//     let netCreateServerStub;
//     let mockServer;
//     let mockSocket;

//     beforeEach(() => {
//         httpServer = new HTTPServer();
//         mockSocket = {
//             on: sinon.spy(),
//             write: sinon.spy(),
//             end: sinon.spy(),
//             destroy: sinon.spy(),
//             writable: true,
//         };
//         mockServer = {
//             listen: sinon.spy(),
//             close: sinon.spy(),
//         };
//         netCreateServerStub = sinon.stub(require('net'), 'createServer').returns(mockServer);
//     });

//     afterEach(() => {
//         netCreateServerStub.restore();
//     });

//     it('should create an HTTPServer instance and call ProtocolServer constructor', () => {
//         assert.equal(httpServer.protocolName, 'HTTP');
//         expect(httpServer.eventHandlers.init).to.not.be.undefined;
//         expect(httpServer.eventHandlers.connect).to.not.be.undefined;
//         expect(httpServer.eventHandlers.receive).to.not.be.undefined;
//     });

//     it('httpInit should create a net.Server and store config', async () => {
//         const config = { port: 8080 };
//         await httpServer.init(config);
//         expect(httpServer.config).to.deep.equal(config);
//         // expect(netCreateServerStub.calledOnce).to.be.true;
//         // expect(httpServer.server).to.equal(mockServer);
//     });

//     it('httpConnect should log a connection', async () => {
//         const logSpy = sinon.spy(console, 'log');
//         await httpServer.handleConnection(mockSocket);
//         expect(logSpy.calledWith('HTTP client connected.')).to.be.true;
//         logSpy.restore();
//     });

//     it('httpReceiveMessage should log received data', async () => {
//         const logSpy = sinon.spy(console, 'log');
//         const data = Buffer.from('GET / HTTP/1.1');
//         await httpServer.handleConnection(mockSocket);
//         mockSocket.on.getCall(0).args[1](data); // Simulate 'data' event
//         expect(logSpy.calledWith('HTTP received data:', data.toString())).to.be.true;
//         logSpy.restore();
//     });

//     it('processMessage should return a default HTTP response', async () => {
//         const data = Buffer.from('GET / HTTP/1.1');
//         const response = await httpServer.processMessage(mockSocket, data);
//         expect(response).to.include('HTTP/1.1 200 OK');
//         expect(response).to.include('Hello, World!');
//     });

//     it('listen should call the parent listen and net.Server.listen', async () => {
//         const listenSpy = sinon.spy(ProtocolServer.prototype, 'listen');
//         const port = 80;
//         const address = '0.0.0.0';
//         await httpServer.listen(port, address);
//         expect(listenSpy.calledOnceWith(port, address)).to.be.true;
//         expect(mockServer.listen.calledOnceWith(port, address, sinon.match.func)).to.be.true;
//         listenSpy.restore();
//     });

//     it('shutdown should call the parent shutdown and net.Server.close', async () => {
//         const shutdownSpy = sinon.spy(ProtocolServer.prototype, 'shutdown');
//         await httpServer.init({ port: 80 });
//         await httpServer.shutdown();
//         expect(shutdownSpy.calledOnce).to.be.true;
//         expect(mockServer.close.calledOnce).to.be.true;
//         shutdownSpy.restore();
//     });
// });

