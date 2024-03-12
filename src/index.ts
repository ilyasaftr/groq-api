import dbMigrate from "./db/migrate";
import dbConnection from "./db/db";
import { updateData } from "./utils/groq-token";
import { apiKeys } from "./db/schema";

async function getKey(db: any) {
  // Create account
  try {
    const response = await updateData();

    if (!response.status) {
      console.log(`Error: ${response.message}`);
      return;
    }

    const email = response?.data?.email;
    const organization = response?.data?.organization;
    const token = response?.data?.token;

    // Save to database
    const data = {
      email: email,
      organizationId: organization,
      token: token
    };

    await db.insert(apiKeys).values(data);
    console.log(`New key saved for ${email}`);
  } catch (error) {
    console.error(error);
  } finally {
    console.log('Getting new key in 1 minutes');
    setTimeout(() => getKey(db), 60 * 1000);
  }
}

(async () => {
  // Run database migration
  await dbMigrate();

  // Start database connection
  const db = await dbConnection();

  // Get new key
  await getKey(db);

})();