import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'todo-producer',
    brokers: ['localhost:9092'], // kafka broker addrress
});

const producer = kafka.producer();

const run = async () => {
    await producer.connect();

    // Send a message to the 'todo-updates' topic
    const message = { 'task': "Complete homewor", status: 'pending' };

    await producer.send({
        topic: 'todp-updates',
        messages: [{ value: JSON.stringify(message) }]
    });

    console.log('Message sent:', message);

    // await producer.disconnect();

};

run().catch(console.error);