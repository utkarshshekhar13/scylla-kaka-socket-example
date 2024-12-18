import express from "express";
import { client } from "../database.js";
import { producer } from "../kafka.js";

// import pkg from 'cassandra-driver';
// const { Client } = pkg;

// const cluster = new Client({
//     contactPoints: ['h1', 'h2'],
//     localDataCenter: 'datacenter1',
//     keyspace: 'ks1'
// });



const itemRouter = express.Router();


const items = [
    { id: 1, name: "Buy groceries", completed: false },
    { id: 2, name: "Hit the Gym", completed: false },
];

itemRouter.get("/", async (req, res) => {

    const result = await client.execute(`SELECT * from items`);

    res.json({
        "data": result["rows"],
    });
});

// Nested Route Export
// itemRouter.get("/test", (req, res) => {
//     res.json({
//         items,
//         "test": "OK"
//     });
// });


itemRouter.post('/add-items', async (req, res) => {
    const { id, name, completed } = req.body;
    console.log('Completed Value:', JSON.parse(completed)); // Check if false is received


    try {
        const insertQuery = `
            INSERT INTO todos.items (id, name, completed) VALUES (?, ?, ?);
        `;
        await client.execute(insertQuery, [id, name, JSON.parse(completed)], { prepare: true });

        await producer.send({
            topic: 'task-added',
            messages: [{ value: JSON.stringify({ id, name, completed }) }],
        });

        res.status(201).json({ message: 'Task created successfully' });

    } catch (error) {
        console.error('Error inserting task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
    // res.status(201).json({ message: 'Task created successfully' });


});


itemRouter.delete('/delete-items', async (req, res) => {
    const { id } = req.body;

    try {
        const deleteQuery = `
            DELETE FROM todos.items WHERE id = ?;
        `;
        await client.execute(deleteQuery, [id], { prepare: true });

        await producer.send({
            topic: 'task-deleted',
            messages: [{ value: JSON.stringify({ id }) }],
        });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
})


itemRouter.put("/update-item", async (req, res) => {
    const { id, name, completed } = req.body;
    try {
        const updateQuery = `
            UPDATE todos.items SET name = ?, completed = ?
            WHERE id = ?;
        `;
        await client.execute(updateQuery, [name, JSON.parse(completed), id], { prepare: true });

        await producer.send({
            topic: 'task-updated',
            messages: [{ value: JSON.stringify({ id, name, completed }) }],
        });
        res.status(201).json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Error inserting task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});




export { itemRouter };