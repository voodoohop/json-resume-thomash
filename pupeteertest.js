const puppeteer = require('puppeteer');

let username = "thomashaferlach";

let scrape = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/in/'+ username +'/');
    await page.waitFor(1000);

    const result = await page.evaluate(() => {

        let name = document.querySelector('#name').innerText;
        let title = document.querySelector('.headline').innerText;
        let summary = document.querySelector('.headline').childNodes[0].innerText;

        return {
            "name": name,
            "title": title,
            "summary": summary
        }

    });

    browser.close();
    return result;
};

scrape().then((value) => {
    console.log(value);

})
