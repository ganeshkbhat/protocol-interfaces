// Example usage:
const { HTTPServer } = require('./index'); // Adjust the path

const httpServer = new HTTPServer();

httpServer.on('respond', (socket, response) => {
    console.log('HTTP server sending response:', response.toString().substring(0, 30) + '...');
});

httpServer.onError((err, eventName, ...args) => {
    console.error(`[${httpServer.protocolName}] Error in event "${eventName}":`, err, ...args);
    // You can implement custom error handling logic here, e.g., logging to a file,
    // sending an error response to the client, or attempting to recover.
});

httpServer.init({ port: 8080 });
httpServer.listen(8080);

// To shut down later:
// httpServer.shutdown();

