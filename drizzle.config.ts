import type { Config } from "drizzle-kit";

export default {
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || "",
    },
    schema: "./src/db/schema.ts",
    out: "./drizzle",
} satisfies Config;
