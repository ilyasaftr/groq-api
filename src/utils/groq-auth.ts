import puppeteer from "puppeteer";

async function createOrLoginAccount(email: string) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        // set navigation timeout to 60 seconds
        page.setDefaultNavigationTimeout(60000);
        await page.goto('https://console.groq.com/login');

        await page.waitForResponse('https://console.groq.com/a-api/p');

        // fill input with id email
        await page.type('input[id="email"]', email);

        // search all button and print the html
        const buttons = await page.$$('button');
        for (const button of buttons) {
            // search button with <button>Login with Email</button>
            const text = await (await button.getProperty('textContent')).jsonValue();
            if (text === 'Login with Email') {
                await page.evaluate((button) => {
                    button.removeAttribute('disabled');
                }, button);

                await button.focus();

                await page.keyboard.press('Enter');

                await button.click();
                break;
            }
        }

        await page.waitForResponse('https://web.stytch.com/sdk/v1/magic_links/email/login_or_create');

        return {
            status: true,
            message: 'An email has been sent'
        };
    } catch (error) {
        console.error(error)
        return {
            status: false,
            message: 'An error occurred'
        }
    } finally {
        await browser.close();
    }
}

async function verifyAccount(url: string) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        // set navigation timeout to 60 seconds
        page.setDefaultNavigationTimeout(60000);
        await page.goto(url);

        await page.waitForResponse('https://console.groq.com/docs/quickstart?_rsc=1bcdy');

        await page.goto('https://console.groq.com/settings/organization');

        let organizationId;
        do {
            const inputs = await page.$$('input');
            for (const input of inputs) {
                // search button with placeholder "Organization ID" and get the value
                const placeholder = await (await input.getProperty('placeholder')).jsonValue();
                if (placeholder === 'Organization Id') {
                    organizationId = await (await input.getProperty('value')).jsonValue();
                    break;
                }
            }
        } while (organizationId === undefined || organizationId === null || organizationId === '');

        if (organizationId === undefined || organizationId === null || organizationId === '') {
            return {
                status: false,
                message: 'Organization ID not found'
            };
        }

        await page.goto('https://console.groq.com/keys');

        await page.waitForResponse('https://api.groq.com/platform/v1/user/api_keys');

        // search all button and print the html
        const buttons = await page.$$('button');
        for (const button of buttons) {
            // search button with <button>Login with Email</button>
            const text = await (await button.getProperty('textContent')).jsonValue();
            if (text === 'Create API Key') {
                await button.focus();
                await page.keyboard.press('Enter');
                await button.click();
                break;
            }
        }

        await page.type('input[name="keyName"]', 'chat');

        await page.keyboard.press('Enter');

        await page.waitForResponse('https://api.groq.com/platform/v1/user/api_keys');

        let token;
        do {
            const inputs2 = await page.$$('input');
            for (const input of inputs2) {
                const placeholder = await (await input.getProperty('value')).jsonValue();
                if (placeholder.startsWith('gsk_')) {
                    token = placeholder;
                    break;
                }
            }
        } while (token === undefined || token === null || token === '');

        return {
            status: true,
            data: {
                organization: organizationId,
                token: token
            }
        };
    } catch (error) {
        console.error(error)
        return {
            status: false,
            message: 'An error occurred'
        }
    } finally {
        await browser.close();
    }
}

export { createOrLoginAccount, verifyAccount };
