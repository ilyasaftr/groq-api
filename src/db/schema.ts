import { serial, text, timestamp, pgTable } from "drizzle-orm/pg-core";

export const apiKeys = pgTable("api_keys", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    organizationId: text("organization_id").notNull().unique(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
});