const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE LOG:', msg.text()));
  page.on('pageerror', err => console.log('CONSOLE ERROR:', err.message));

  console.log('Navigating to page...');
  await page.goto('https://dailycalchubs.com/prayer-times/', { waitUntil: 'networkidle2' });

  for (let i = 0; i < 4; i++) {
    const h = await page.\('#timerHours', el => el.textContent).catch(e => 'ERR');
    const m = await page.\('#timerMinutes', el => el.textContent).catch(e => 'ERR');
    const s = await page.\('#timerSeconds', el => el.textContent).catch(e => 'ERR');
    console.log(Tick \s: \:\:\);
    await new Promise(r => setTimeout(r, 5000));
  }

  await browser.close();
})();
