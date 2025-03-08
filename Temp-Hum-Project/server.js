const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create an Express app
const app = express();

// Create an HTTP server to serve the frontend
const server = http.createServer(app);

// Connect to SQLite database
const db = new sqlite3.Database('./weather_data.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create the table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature REAL,
        humidity REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Weather data table is ready');
    }
});

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
    const messageStr = message.toString();
    console.log(`Received message from ${topic}: ${messageStr}`);

    // Check which topic the message belongs to and insert it into the database
    if (topic === "/work_group_01/room_temp/temperature") {
        // Insert temperature data into the database
        db.run(`INSERT INTO weather_data (temperature) VALUES (?)`, [messageStr], function(err) {
            if (err) {
                console.error('Error inserting temperature data:', err.message);
            } else {
                console.log('Inserted temperature data into weather_data');
            }
        });
    } else if (topic === "/work_group_01/room_temp/humidity") {
        // Insert humidity data into the database
        db.run(`INSERT INTO weather_data (humidity) VALUES (?)`, [messageStr], function(err) {
            if (err) {
                console.error('Error inserting humidity data:', err.message);
            } else {
                console.log('Inserted humidity data into weather_data');
            }
        });
    }
});

// Start the Express server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});