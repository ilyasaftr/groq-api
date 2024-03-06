import puppeteer from "puppeteer";
import ky from 'ky';

async function createOrLoginAccount(email: string) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        // set navigation timeout to 60 seconds
        page.setDefaultNavigationTimeout(60000);
        await page.goto('https://groq.com/');

        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // click button with arial-label "Close"
        await page.click('button[aria-label="Close"]');

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

        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const cookies = await page.cookies();
        const stytchSessionJwt = cookies.find(cookie => cookie.name === 'stytch_session_jwt');

        if (!stytchSessionJwt) {
            return {
                status: false,
                message: 'No stytch_session_jwt found'
            };
        }

        return {
            status: true,
            data: {
                token: stytchSessionJwt['value']
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

async function profileMe(token: string) {
    try {
        const response = await fetch("https://api.groq.com/platform/v1/user/profile", {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
        });

        if (!response.ok) {
            return {
                status: false,
                message: response.statusText
            };
        }

        const body = await response.json();
        const organizations = body['user']['orgs']['data'][0]['id'];

        if (!organizations.includes('org_')) {
            return {
                status: false,
                message: 'An error occurred'
            };
        }

        return {
            status: true,
            data: {
                organizations: organizations
            }
        };
    } catch (error) {
        console.log(error)
        return {
            status: false,
            message: 'An error occurred'
        }
    }
}

export { createOrLoginAccount, verifyAccount, profileMe };
//
// (async () => {
//     console.log(await profileMe(`eyJhbGciOiJSUzI1NiIsImtpZCI6Imp3ay1saXZlLWY3YjVhMjUwLWM0MGItNDBhMS1hYTZkLTVkMzYzYmE4ODM3OSIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicHJvamVjdC1saXZlLWRkYzcxNDRlLTE2MTYtNDYzMy1iMDU4LTUxNjM5M2VlMGUxNSJdLCJleHAiOjE3MDk3NDIxMjIsImh0dHBzOi8vc3R5dGNoLmNvbS9zZXNzaW9uIjp7ImlkIjoic2Vzc2lvbi1saXZlLWE3YjJlNDRiLTk4YmEtNGY5Ny1hNzdmLTAyYTIwOWRmNmRhOSIsInN0YXJ0ZWRfYXQiOiIyMDI0LTAzLTA2VDE2OjE3OjAyWiIsImxhc3RfYWNjZXNzZWRfYXQiOiIyMDI0LTAzLTA2VDE2OjE3OjAyWiIsImV4cGlyZXNfYXQiOiIyMDI0LTA0LTA1VDE2OjE3OjAyWiIsImF0dHJpYnV0ZXMiOnsidXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIEhlYWRsZXNzQ2hyb21lLzEyMi4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiaXBfYWRkcmVzcyI6IjEwNC4yOC4yMTMuMTI0In0sImF1dGhlbnRpY2F0aW9uX2ZhY3RvcnMiOlt7InR5cGUiOiJtYWdpY19saW5rIiwiZGVsaXZlcnlfbWV0aG9kIjoiZW1haWwiLCJsYXN0X2F1dGhlbnRpY2F0ZWRfYXQiOiIyMDI0LTAzLTA2VDE2OjE3OjAyWiIsImVtYWlsX2ZhY3RvciI6eyJlbWFpbF9pZCI6ImVtYWlsLWxpdmUtNmM0MzZjOWYtZjgwNi00NzZmLThmM2UtZTU5MWFhOWYxMjcxIiwiZW1haWxfYWRkcmVzcyI6IjB2bjIwbTgwYm05eDRyeXA3QGJsb2hleXouY29tIn19XX0sImlhdCI6MTcwOTc0MTgyMiwiaXNzIjoic3R5dGNoLmNvbS9wcm9qZWN0LWxpdmUtZGRjNzE0NGUtMTYxNi00NjMzLWIwNTgtNTE2MzkzZWUwZTE1IiwibmJmIjoxNzA5NzQxODIyLCJzdWIiOiJ1c2VyLWxpdmUtY2VmMDcwMzctYWE4ZC00NjY1LTg1MmEtNjQ4ZGRkNDMzODNlIn0.CIrGXQqj-LfbTkTJIDXQ5knmmyXTuqEBwULzmV3zTm5UJIcfLGyvNoau2X1vk12HKKEyL3Ec-XX8fsXEhRXnaWk5atjV-T3175HWr_uk5LklACdbBH180cE9O3pM0nPvQKauLWVtzk6ZUyFToaOALRXHLu_txMq804zZBlTqzP0JdeXTHobnUYwEy5C-NPzv9F4l2sVUCkKgj1OYITPKL4k-QN6kEKU0j_n6kFQz0aPJZK5WPIZnYvXPPIf2Q0e6lh3nnc0CXBtBFokJCng6lCQNlwE4mv7XqyFndM927yd0eWFajU1Brl4OBAf-FFuyudqigZrN4g3ObhEgP_llEA`))
// })();