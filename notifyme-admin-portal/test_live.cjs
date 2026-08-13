const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  try {
    await page.goto('https://notifyme-pink.vercel.app/', { waitUntil: 'networkidle2' });
    console.log("Successfully loaded the page.");
    await new Promise(r => setTimeout(r, 2000));
  } catch(e) {
    console.error("Navigation failed:", e.message);
  }
  
  await browser.close();
})();
