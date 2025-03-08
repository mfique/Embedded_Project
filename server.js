const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const path = require('path');

// Create an Express app
const app = express();

// Create an HTTP server to serve the frontend
const server = http.createServer(app);

// Serve the index.html file directly from the root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Connect to the MQTT broker
const mqttClient = mqtt.connect('ws://157.173.101.159:9001'); // Use your broker's WebSocket URL

// When MQTT is connected, subscribe to the necessary topics
mqttClient.on('connect', () => {
    console.log("Connected to MQTT Broker via WebSockets");
    mqttClient.subscribe("/work_group_01/room_temp/temperature");
    mqttClient.subscribe("/work_group_01/room_temp/humidity");
});

// Handle incoming MQTT messages and forward them to clients
mqttClient.on('message', (topic, message) => {
    console.log(`Received message from ${topic}: ${message.toString()}`);

    // Broadcast the message to all connected WebSocket clients
    // Here you can implement WebSocket broadcasting or even use something like socket.io
    // For now, we are assuming there's a mechanism in place to push data to the front end.
});

// Start the Express server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});