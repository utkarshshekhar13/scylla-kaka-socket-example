import express from "express";
import { client } from "../database.js";
import { producer } from "../kafka.js";
import { v4 as uuidv4 } from 'uuid';

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

// itemRouter.get("/", async (req, res) => {

//     const result = await client.execute(`SELECT * from items`);

//     res.json({
//         "data": result["rows"],
//     });
// });

itemRouter.get("/", async (req, res) => {
    try {
        const result = await client.execute(`SELECT * FROM items`);
        const data = result?.rows || []; // Fallback to an empty array if rows are undefined

        res.json({
            data: data.length > 0 ? data : [], // Send data if exists, otherwise []
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({
            error: "Failed to fetch items",
        });
    }
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


// Bulk Insert Data into the 'items' Table
async function bulkInsertItems(itemCount = 1000) {
    try {
        console.log(`🚀 Inserting ${itemCount} sample items into "sample" table...`);

        const queries = [];
        const now = new Date();

        for (let i = 0; i < itemCount; i++) {
            queries.push({
                query: `
                    INSERT INTO sample (id, name, description, quantity, price, tags, metadata, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                params: [
                    uuidv4(),                      // id
                    `Item ${i + 1}`,               // name
                    `Description for item ${i + 1}`, // description
                    Math.floor(Math.random() * 100), // quantity
                    (Math.random() * 100).toFixed(2), // price
                    ['tag1', 'tag2'],              // tags
                    { key1: 'value1', key2: 'value2' }, // metadata
                    now,                           // created_at
                    now                            // updated_at
                ],
            });
        }

        // Execute batch insert
        await client.batch(queries, { prepare: true });
        console.log('✅ Bulk data inserted successfully!');
    } catch (error) {
        console.error('❌ Error during bulk insert:', error);
    }
}


itemRouter.get('/sample-push', async (req, res) => {
    await bulkInsertItems(1000).then(() => {
        res.status(201).json({ message: 'Sample Data added successfully' });
    }).catch((e) => {
        res.status(500).json({ error: 'Failed to add items ' });
    });
});


itemRouter.get('/sample-get', async (req, res) => {
    try {
        const result = await client.execute(`SELECT * FROM sample`);
        const data = result?.rows || []; // Fallback to an empty array if rows are undefined

        res.json({
            data: data.length > 0 ? data : [], // Send data if exists, otherwise []
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({
            error: "Failed to fetch items",
        });
    }
});





export { itemRouter };