async function createEmail() {
    const url = 'https://api.internal.temp-mail.io/api/v3/email/new';
    const headers = {
        'Host': 'api.internal.temp-mail.io',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Temp Mail/30 CFNetwork/1492.0.1 Darwin/23.3.0',
        'Accept-Language': 'en-us',
    }
    const body = {
        "min_name_length": 0,
        "max_name_length": 0
    };

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
    });

    if (!response.ok) {
        return {
            status: false,
            message: response.statusText
        };
    }

    const responseBody = await response.json();

    return {
        status: true,
        data: responseBody
    };
}

async function checkEmail(email: string) {
    try {
        const url = `https://api.internal.temp-mail.io/api/v3/email/${email}/messages`;
        const headers = {
            'Host': 'api.internal.temp-mail.io',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Temp Mail/30 CFNetwork/1492.0.1 Darwin/23.3.0',
            'Accept-Language': 'en-us',
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            return {
                status: false,
                message: response.statusText
            };
        }

        const responseBody = await response.json();

        if (responseBody.length === 0) {
            return {
                status: false,
                message: 'No email found'
            };
        }

        const emailMessage = responseBody.find((email: any) => email.subject === 'Your account creation request for Groq');

        if (!emailMessage) {
            return {
                status: false,
                message: 'No email found'
            };
        }

        const linkRegex = /(https:\/\/stytch\.com\/[^\s]+)/g;
        const matches = emailMessage['body_text'].match(linkRegex);

        if (!matches) {
            return {
                status: false,
                message: 'No link found'
            };
        }

        return {
            status: true,
            data: matches[0]
        };
    } catch (error) {
        console.error(error);
        return {
            status: false,
            message: 'An error occurred'
        }
    }
}

export { createEmail, checkEmail };
