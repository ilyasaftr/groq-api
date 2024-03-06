import {checkEmail, createEmail} from "../vendor/temp-mail";
import {createOrLoginAccount, profileMe, verifyAccount} from "./groq-auth";

async function updateData() {
    try {
        const [responseEmail] = await Promise.all([createEmail()]);

        if(!responseEmail['status']) {
            console.log(`Error: ${responseEmail['message']}`);
            return;
        }

        const email = responseEmail['data']['email'];

        console.log(`Email: ${email}`)

        console.log('Creating account...')
        const responseCreateAccount = await createOrLoginAccount(email);

        if(!responseCreateAccount['status']) {
            console.log(`Error: ${responseCreateAccount['message']}`);
            return;
        }

        console.log('Waiting for email...')
        await new Promise(resolve => setTimeout(resolve, (10 * 1000)));

        const responseCheckEmail = await checkEmail(email);

        if(!responseCheckEmail['status']) {
            console.log(`Error: ${responseCheckEmail['message']}`);
            return;
        }

        const link = responseCheckEmail['data'];

        console.log(`Link: ${link}`)

        const responseVerifyAccount = await verifyAccount(link);
        if(!responseVerifyAccount['status']) {
            console.log(`Error: ${responseVerifyAccount['message']}`);
            return;
        }

        console.log('Account verified')

        const token = responseVerifyAccount?.data?.token;

        if (!token) {
            console.log('No token found');
            return;
        }

        console.log(`Token: ${token}`)

        const profile = await profileMe(token);

        if (!profile['status']) {
            console.log(`Error: ${profile['message']}`);
            return;
        }

        console.log('Profile found')

        const organization = profile?.data?.organizations;

        if (!organization) {
            console.log('No organization found');
            return;
        }

        console.log(`Organization: ${organization}`);

        const updatedData = {
            token: token,
            organization: organization,
        }

        const directory = process.cwd();
        await Bun.write(`${directory}/data.json`, JSON.stringify(updatedData, null, 2));
        console.log(`Data updated`);
    } catch (error) {
        console.error(error)
    }
}

async function readData() {
    try {
        const directory = process.cwd();
        const readData = Bun.file(`${directory}/data.json`, { type: "application/json" });
        return readData.json();
    } catch (error) {
        console.error(error)
    }
}

export { updateData, readData }
