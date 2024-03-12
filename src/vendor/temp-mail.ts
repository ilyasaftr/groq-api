import * as cheerio from 'cheerio';

async function checkEmail(email: string, domain: string) {
    const url = `https://generator.email/${domain}/${email}`;
    const headers = {
        'Host': 'generator.email',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Connection': 'keep-alive',
        'cookie': `surl=${domain}%2F${email}`,
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
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

    const responseBody = await response.text();
    const $ = cheerio.load(responseBody);
    const urlLink = $("#email-table > div.e7m.row.list-group-item > div.e7m.col-md-12.ma1 > div.e7m.mess_bodiyy > table > tbody > tr > td > a").attr('href');

    if (!urlLink) {
        return {
            status: false,
            message: 'No link found'
        };
    }

    return {
        status: true,
        data: urlLink
    };
}

export { checkEmail };