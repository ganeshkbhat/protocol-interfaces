const http = require('http');
const https = require('https');
const fs = require('fs'); // For HTTPS key/cert

const { ProtocolServer } = require('../index.js'); // Adjust the path if needed

// HTTP Server (Function Implementation)
function HTTPServer() {
  ProtocolServer.call(this, 'HTTP');
  this.server = null;
  this.config = {};
}

// Inherit prototype methods from ProtocolServer
HTTPServer.prototype = Object.create(ProtocolServer.prototype);
HTTPServer.prototype.constructor = HTTPServer;

HTTPServer.prototype.init = async function (config) {
  await ProtocolServer.prototype.init.call(this, config);
  this.config = config;
};

HTTPServer.prototype.listen = async function (port, address = '0.0.0.0') {
  const self = this;
  await ProtocolServer.prototype.listen.call(this, port, address);

  return new Promise((resolve, reject) => {
    const serverCallback = (req, res) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', async () => {
        try {
          // Call the event handlers.
          self.handleConnection(req.socket); //maps to connect
          self.call('receive', req.socket, data); //maps to receive
          const responseData = await self.processMessage(req.socket, data, { req, res }); // Include req and res
          if (responseData !== undefined) {
            self.call('respond', req.socket, responseData, { req, res });
            if (typeof responseData === 'string') {
              res.end(responseData);
            }
            // else assume that the processMessage handler has handled the response
          }
        } catch (error) {
          console.error("error in request", error)
          res.statusCode = 500;
          res.end('Internal Server Error');
          self.call('error', error, 'requestHandler', req, res); //emit error
        }
      });
      req.on('error', (err) => {
        console.error("request error", err);
        self.call('error', err, 'requestError', req, res);
      })
    };

    if (this.config.ssl) {
      try {
        const sslOptions = {
          key: fs.readFileSync(this.config.ssl.key),
          cert: fs.readFileSync(this.config.ssl.cert),
          // Add other SSL options as needed (e.g., ca, passphrase)
        };
        self.server = https.createServer(sslOptions, serverCallback).listen(port, address, () => {
          console.log(`HTTPS server listening on ${address}:${port}`);
          resolve();
        });
      } catch (error) {
        console.error("Error setting up https", error);
        reject(error);
      }

    } else {
      self.server = http.createServer(serverCallback).listen(port, address, () => {
        console.log(`HTTP server listening on ${address}:${port}`);
        resolve();
      });
    }

    self.server.on('error', (err) => {
      console.error('HTTP(S) server error:', err);
      self.call('error', err, 'listen');
      reject(err);
    });
  });
};

HTTPServer.prototype.shutdown = async function () {
  await ProtocolServer.prototype.shutdown.call(this);
  const self = this;
  return new Promise((resolve) => {
    if (self.server) {
      self.server.close(() => {
        console.log('HTTP(S) server closed.');
        resolve();
      });
    } else {
      resolve();
    }
  });
};

// Example Usage:
async function runServers() {
  // HTTP Server Example
  const httpServer = new HTTPServer();

  httpServer.on('init', (config) => {
    console.log('HTTP Server initialized with config:', config);
  });

  httpServer.on('connect', (socket) => {
    console.log('HTTP Client connected:', socket.remoteAddress + ':' + socket.remotePort);
  });

  httpServer.on('receive', (socket, data) => {
    console.log('HTTP Received:', data.toString().substring(0, 200)); //first 200 chars
  });

  httpServer.on('processMessage', async (socket, data, { req, res }) => {
    console.log('HTTP processing message:', data.toString().substring(0, 200));
    // You can access the req and res objects here
    res.setHeader('Content-Type', 'text/html');
    return '<h1>Hello, World!</h1><p>You sent: ' + data.toString().substring(0, 50) + '</p>';
  });

  httpServer.on('respond', (socket, response, { req, res }) => {
    console.log('HTTP sending response:', response.substring(0, 200));
  });

  httpServer.onError((err, eventName, ...args) => {
    console.error(`[HTTP Server] Error in event "${eventName}":`, err, ...args);
  });

  await httpServer.init({ some: 'http config' });
  await httpServer.listen(3000);

  console.log('Servers are running...');
}

// runServers();

module.exports = { HTTPServer };

