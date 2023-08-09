const express = require('express');
const puppeteer = require('puppeteer');

//const StealthPlugin = require('puppeteer-extra-plugin-stealth');
//puppeteer.use(StealthPlugin());
//const {executablePath} = require('puppeteer');

const app = express();
app.get('/', (req, res) => {
    res.send('salam.');
});
app.get('/test', async (req, res) => {
    console.log('Taking screenshot');
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/google-chrome',
        args: [
            "--no-sandbox",
            "--disable-gpu",
        ]
    });
    const page = await browser.newPage();
    await page.goto('https://rekvizitai.vz.lt/en/company-search/', {waitUntil: "networkidle0"});
    await page.waitForSelector('.ctp-checkbox-label');
    const frame = page.frames()[0];
    await frame.click('.ctp-label');
    await page.waitForNavigation();
    //await page.waitForNetworkIdle();
    const imageBuffer = await page.screenshot();
    await browser.close();

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
    console.log('Screenshot taken');
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});
