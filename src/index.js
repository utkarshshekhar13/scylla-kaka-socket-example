import http from 'http';
import express from "express";
const app = express();

import { router } from './api/index.js';

import cors from 'cors';

import { initializeDatabase } from './database.js';
import { initializeSocket } from './socket.js';
import { kafkaRouter, startKafkaConsumer } from './kafka.js';

initializeDatabase;
const server = http.createServer(app);
initializeSocket(server);

const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors());

app.get("/", (req, res) => {

    res.status(200).json({
        message: "Welcome to Scylla"
    });

})

app.use('/api', router);
app.use('/kafka', kafkaRouter);




// Start server and Kafka consumer
server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await startKafkaConsumer(); // Start Kafka consumer here
});

// import { Kafka } from 'kafkajs';
// import { Server } from 'socket.io';
// import { Client } from 'cassandra-driver';
// // Configure the client
// const client = new Client({
//     contactPoints: ['127.0.0.1'], // Use the IP or hostname of your Docker host
//     localDataCenter: 'datacenter1', // Default data center name for Scylla
// });

// async function connectToScylla() {
//     try {
//         await client.connect();
//         console.log('Connected to ScyllaDB');
//         const testQuery = `SELECT release_version FROM system.local`;
//         const result = await client.execute(testQuery);
//         console.log("Test Query response", result["rows"][0]["release_version"]);


//     } catch (error) {
//         console.error('Error connecting to ScyllaDB:', error);
//     }
// }

// connectToScylla();

// const io = new Server(server);
// io.on('connection', (socket) => {
//     console.log("A client connected: '", socket.id);
//     //Handle disconnection
//     socket.on('disconnect', () => {
//         console.log('A Client disconnected', socket.id);
//     });
// });

// const kafka = new Kafka({
//     clientId: 'todo-server',
//     brokers: ['localhost:9092'],
// });

// const producer = kafka.producer();
// const consumer = kafka.consumer({ groupId: 'todo-group' });


// app.post('/publish', async (req, res) => {
//     const { task, status } = req.body;
//     try {
//         await producer.connect();
//         await producer.send({
//             topic: 'todo-updates',
//             messages: [{ value: JSON.stringify({ task, status }) }],
//         });
//         res.status(200).send({ message: 'Task published successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: 'Failed to publish task' });
//     }

// });

// // Kafka Consumer WebSocket
// const startKafkaConsumer = async () => {
//     await consumer.connect();
//     await consumer.subscribe({ topic: 'todo-updates', fromBeginning: true });

//     consumer.run({
//         eachMessage: async ({ message }) => {
//             const data = JSON.parse(message.value.toString());
//             // Send data to connected clients (e.g., via WebSocket)
//             console.log('Task update:', data);

//             //Emit the Kafka message to all connected clients
//             io.emit('task-updates', data);
//         },
//     });
// };

// startConsumer();

// app.listen(PORT, '0.0.0.0', () => console.log(`Server is listening on port ${PORT}`));