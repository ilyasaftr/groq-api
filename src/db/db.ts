import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

async function dbConnection() {
    const connectionString = process.env.DATABASE_URL || "";

    if (!connectionString) {
        throw new Error("DATABASE_URL not set");
    }

    try {
        const pool = new Pool({
            connectionString: connectionString,
        });

        return drizzle(pool);
    } catch (error) {
        console.error("Database connection failed", error);
    }

}

export default dbConnection;