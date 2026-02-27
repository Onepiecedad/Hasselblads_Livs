import https from "node:https";
import querystring from "node:querystring";

const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";

function loginToWordPress(username, password) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            'log': username,
            'pwd': password,
            'wp-submit': 'Log In',
            'redirect_to': 'https://hasselbladslivs.se/',
            'testcookie': '1'
        });

        const options = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: '/wp-login.php',
            method: 'POST',
            headers: {
                'Host': WORDPRESS_HOST,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
                'Origin': 'https://hasselbladslivs.se',
                'Referer': 'https://hasselbladslivs.se/wp-login.php'
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            const cookies = res.headers['set-cookie'] || [];
            console.log("Login HTTP Status:", res.statusCode);

            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const loggedInCookie = cookies.find(c => c.includes('wordpress_logged_in_'));
                resolve({
                    success: !!loggedInCookie,
                    cookies: cookies,
                    body: body.substring(0, 1000)
                });
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

loginToWordPress("fredrik@scfo.se", "TempPassword123!_Random23931").then(res => {
    console.log("Success:", res.success);
    if (!res.success) {
        console.log("Body preview:");
        console.log(res.body);
    }
});
