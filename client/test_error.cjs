const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log(e));
  
  await page.evaluate(() => {
    localStorage.setItem('zyntra_auth_token', 'fake-token');
    localStorage.setItem('zyntra-auth-user', JSON.stringify({
      id: 'user-2',
      name: 'Normal User',
      email: 'normal@test.com',
      primaryUsername: 'normal',
      contexts: [{ id: 'ctx-personal', type: 'personal', name: 'Personal', username: 'normal.personal' }]
    }));
  });

  console.log('Navigating to chat...');
  await page.goto('http://localhost:5173/personal/contact-1', { waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log(e));

  console.log('Evaluating...');
  const html = await page.content();
  console.log('Body length:', html.length);

  await browser.close();
})();
