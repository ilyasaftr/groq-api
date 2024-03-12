import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function dbConnection() {
    const connectionString = process.env.DATABASE_URL || "";

    if (!connectionString) {
        throw new Error("DATABASE_URL not set");
    }

    try {
        const sql = postgres(connectionString);
        return drizzle(sql);
    } catch (error) {
        console.error("Database connection failed", error);
    }

}

export default dbConnection;