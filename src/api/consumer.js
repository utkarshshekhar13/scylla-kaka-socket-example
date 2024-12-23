import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'todo-consumer',
    brokers: ['localhost:9092'], // Kafka broker address
});

const consumer = kafka.consumer({ groupId: 'todo-group' });

const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'todo-updates', fromBeginning: true });

    console.log('Listening for messages...');
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const receivedMessage = JSON.parse(message.value.toString());
            console.log(`Received message:`, receivedMessage);
        },
    });
};

run().catch(console.error);