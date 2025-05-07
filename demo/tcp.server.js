const net = require('net');
const dgram = require('dgram');

// TCP Server (Function Implementation)
function TCPServer() {
  ProtocolServer.call(this, 'TCP');
  this.server = null;
}

// Inherit prototype methods from ProtocolServer
TCPServer.prototype = Object.create(ProtocolServer.prototype);
TCPServer.prototype.constructor = TCPServer;

TCPServer.prototype.listen = async function(port, address = '0.0.0.0') {
  await ProtocolServer.prototype.listen.call(this, port, address);
  const self = this;
  return new Promise((resolve, reject) => {
    self.server = net.createServer((socket) => {
      self.handleConnection(socket);
    });

    self.server.on('listening', () => {
      console.log(`TCP server listening on ${address}:${port}`);
      resolve();
    });

    self.server.on('error', (err) => {
      console.error('TCP server error:', err);
      self.call('error', err, 'listen');
      reject(err);
    });

    self.server.listen(port, address);
  });
};

TCPServer.prototype.shutdown = async function() {
  await ProtocolServer.prototype.shutdown.call(this);
  const self = this;
  return new Promise((resolve) => {
    if (self.server) {
      self.server.close(() => {
        console.log('TCP server closed.');
        resolve();
      });
    } else {
      resolve();
    }
  });
};

// Example Usage (same as before, but using the function implementations):
async function runServers() {
  // TCP Server Example
  const tcpServer = new TCPServer();

  tcpServer.on('init', (config) => {
    console.log('TCP Server initialized with config:', config);
  });

  tcpServer.on('connect', (socket) => {
    console.log('TCP Client connected:', socket.remoteAddress + ':' + socket.remotePort);
    socket.write('Welcome to the TCP server!\r\n');
  });

  tcpServer.on('receive', (socket, data) => {
    console.log('TCP Received:', data.toString().trim());
    socket.write(`You sent: ${data.toString().trim()}\r\n`);
  });

  tcpServer.on('disconnect', (socket) => {
    console.log('TCP Client disconnected:', socket.remoteAddress + ':' + socket.remotePort);
  });

  tcpServer.onError((err, eventName, ...args) => {
    console.error(`[TCP Server] Error in event "${eventName}":`, err, ...args);
  });

  await tcpServer.init({ some: 'tcp config' });
  await tcpServer.listen(3000);

  console.log('Servers are running...');
}

// runServers();


module.exports = { TCPServer};

