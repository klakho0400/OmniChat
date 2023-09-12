const WebSocket = require('ws');
const net = require('net');
const readline = require('readline');
const http = require('http');
const translatte = require('translatte');

const client = new net.Socket();
let languageChoice; // Initialize language choice variable



client.connect(8083, '127.0.0.1', () => {
    console.log('Connected to the C++ server');
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const webSocketClients = [];

client.on('data', (data) => {
    const message = data.toString('utf8');
    let sender = '';
    let messageContent = '';

    const parts = message.split('~');

    if (parts.length >= 2) {
        
        sender = parts[1]; // Extract sender
        messageContent = parts[0]; // Extract message content

            translatte(messageContent, {to: languageChoice}).then(res => {
                console.error(res.text);
                webSocketClients.forEach((ws) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(`Received from Client No. ${sender}: ${res.text}`);
                    }
                });
            }).catch(err => {
                console.error(err);
            });

        // Send the message to all WebSocket clients (frontend)
    }
    console.log(`Received from Client No. ${sender}: ${messageContent}`);
});

client.on('error', (error) => {
    console.error('Socket error:', error);
});

client.on('close', () => {
    console.log('Connection to C++ server closed');
});

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running.');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    webSocketClients.push(ws);

    ws.on('message', (message) => {
        // Check if the message is a language_choice message
        var lang_m = message.toString('utf8');
        if (lang_m.startsWith('language_choice:')) {
            // Store the language choice in the variable globally
            languageChoice = lang_m.replace('language_choice:', '').trim();
            console.log(languageChoice);
        } else {
            // Forward the message to the C++ server
            var og_message = message.toString('utf8');
            translatte(og_message, {to: 'en'}).then(res => {
                const buffer = Buffer.from(res.text, 'utf8');
                client.write(buffer);
            }).catch(err => {
                console.error(err);
            });

        }
    });

    // Now you can access languageChoice globally in this scope
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        const index = webSocketClients.indexOf(ws);
        if (index !== -1) {
            webSocketClients.splice(index, 1);
        }
    });
});

// Find an available port automatically
const findAvailablePort = (startPort, callback) => {
    const server = net.createServer();
    server.listen(startPort, () => {
        const port = server.address().port;
        server.close(() => {
            callback(port);
        });
    });

    server.on('error', () => {
        findAvailablePort(startPort + 1, callback);
    });
};

// Dynamically find an available port and start the server
findAvailablePort(3000, (availablePort) => {
    console.log(`Using available port: ${availablePort}`);

    server.listen(availablePort, () => {
        console.log(`HTTP server is listening on port ${availablePort}`);
    });
});

// Add functionality for sending messages from the Node.js CLI
rl.on('line', (input) => {
    client.write(input);
});
