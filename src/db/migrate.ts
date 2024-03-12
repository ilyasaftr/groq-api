import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function dbMigrate() {
    const connectionString = process.env.DATABASE_URL || "";

    if (!connectionString) {
        throw new Error("DATABASE_URL not set");
    }

    const sql = postgres(connectionString, { max: 1 })
    const db = drizzle(sql);

    try {
        console.log("Migrating database...");
        await migrate(db, { migrationsFolder: "drizzle" });
        console.log("Database migration complete");
    } catch (error) {
        console.error("Database migration failed", error);
    } finally {
        await sql.end();
    }
}

export default dbMigrate;