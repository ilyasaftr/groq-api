import { faker } from '@faker-js/faker';
import { checkEmail } from "../vendor/temp-mail";
import { createOrLoginAccount, verifyAccount } from "./groq-auth";


async function updateData() {
    try {
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        const username = faker.internet.userName().toLowerCase() + randomNumber;
        const domain = "algonion.com";
        const email = `${username}@${domain}`

        console.log(`Email: ${email}`)

        console.log('Creating account...')
        const responseCreateAccount = await createOrLoginAccount(email);

        if(!responseCreateAccount['status']) {
            console.log(`Error: ${responseCreateAccount['message']}`);
            return {
                status: false,
                message: responseCreateAccount['message']
            }
        }

        let responseCheckEmail;
        do {
            responseCheckEmail = await checkEmail(username, domain);
            console.log('Waiting for email...')
        } while (responseCheckEmail['status'] != true);

        if(!responseCheckEmail['status']) {
            console.log(`Error: ${responseCheckEmail['message']}`);
            return {
                status: false,
                message: responseCheckEmail['message']
            }
        }

        const link = responseCheckEmail['data'];

        if (!link) {
            console.log(`Error: No link found`);
            return {
                status: false,
                message: 'No link found'
            }
        }

        console.log('Verifying account...')

        const responseVerifyAccount = await verifyAccount(link);

        if (!responseVerifyAccount['status']) {
            console.log(`Error: ${responseVerifyAccount['message']}`);
            return {
                status: false,
                message: responseVerifyAccount['message']
            }
        }

        console.log('Account verified')

        return {
            status: true,
            data: {
                email: email,
                organization: responseVerifyAccount?.data?.organization,
                token: responseVerifyAccount?.data?.token
            }
        }
    } catch (error) {
        console.error(error)
        return {
            status: false,
            message: 'An error occurred'
        }
    }
}

export { updateData }
