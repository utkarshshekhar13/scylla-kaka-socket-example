import express from "express";
import { Kafka } from 'kafkajs';
import { getSocketIO } from './socket.js'; // Import the Socket.IO getter


const kafka = new Kafka({
    clientId: 'todo-server',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'todo-group' });

await producer.connect();

const kafkaRouter = express.Router();


kafkaRouter.post('/publish', async (req, res) => {
    const { task, status } = req.body;
    try {
        await producer.send({
            topic: 'todo-updates',
            messages: [{ value: JSON.stringify({ task, status }) }],
        });
        res.status(200).send({ message: 'Task published successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Failed to publish task' });
    }

});

// Kafka Consumer WebSocket
const startKafkaConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'task-added', fromBeginning: false }); // {fromBeginning: false }To avoid replaying old messages
    await consumer.subscribe({ topic: 'task-updated', fromBeginning: false }); // {fromBeginning: false }To avoid replaying old messages
    await consumer.subscribe({ topic: 'task-deleted', fromBeginning: false }); // {fromBeginning: false }To avoid replaying old messages
    // const io = getSocketIO(); // Get the Socket.IO instance

    consumer.run({
        eachMessage: async ({ topic, message }) => {
            try {
                const data = JSON.parse(message.value.toString());
                console.log(`Received message on topic "${topic}":`, data);

                // Emit the Kafka message to all connected clients
                const io = getSocketIO(); // Ensure this doesn't throw
                if (!io) {
                    console.error("Socket.IO instance not available");
                    return;
                }
                // Handle different event types
                switch (topic) {
                    case 'task-added':
                        io.emit('task-added', data);
                        break;
                    case 'task-updated':
                        io.emit('task-updated', data);
                        break;
                    case 'task-deleted':
                        io.emit('task-deleted', data);
                        break;
                    default:
                        console.warn(`Unhandled topic: ${topic}`);
                }
            } catch (err) {
                console.error("Error starting Kafka consumer:", err);
            }
        },
    });
};

// Export the producer and the consumer function
export { producer, kafkaRouter, startKafkaConsumer };