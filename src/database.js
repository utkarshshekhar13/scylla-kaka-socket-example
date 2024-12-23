import { Client } from 'cassandra-driver';

// ScyllaDB client configuration
const client = new Client({
    contactPoints: ['127.0.0.1'], // Docker host or actual ScyllaDB IP
    localDataCenter: 'datacenter1',
});

// Initialize the database and table
async function initializeDatabase() {
    try {
        // Connect to the client
        await client.connect();
        console.log('Connected to ScyllaDB');

        // Create database (keyspace) if it doesn't exist
        const createKeyspaceQuery = `
            CREATE KEYSPACE IF NOT EXISTS todos
            WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
        `;
        await client.execute(createKeyspaceQuery);
        console.log('Keyspace "todos" created or already exists');

        // Use the "todos" keyspace
        await client.execute('USE todos');

        // Create table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS items (
                id UUID PRIMARY KEY,
                name TEXT,
                completed BOOLEAN
            );
        `;
        await client.execute(createTableQuery);
        console.log('Table "items" created or already exists');

        // Create the 'items' table if it doesn't exist
        const createSampleTableQuery = `
         CREATE TABLE IF NOT EXISTS sample (
             id UUID PRIMARY KEY,
             name TEXT,
             description TEXT,
             quantity INT,
             price DECIMAL,
             tags LIST<TEXT>,
             metadata MAP<TEXT, TEXT>,
             created_at TIMESTAMP,
             updated_at TIMESTAMP
         );
     `;

        await client.execute(createSampleTableQuery);
        console.log('Table "sample" created or already exists');


    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Call the database initializer
initializeDatabase();

export { client, initializeDatabase };