import {
  test,
  expect,
  BrowserContext,
  Page,
} from '@playwright/test';

// =====================================================
// DRIVER A สำหรับ Bottom-Up branch
// แทนการ Login ผ่าน UI โดยการเซ็ต Session Cookie
// =====================================================
async function driverOpenInventory(
  context: BrowserContext
): Promise<Page> {
  await context.addCookies([
    {
      name: 'session-username',
      value: 'standard_user',
      domain: '.saucedemo.com', // กำหนด domain ให้ครอบคลุมเพื่อความเสถียร
      path: '/',
    },
  ]);

  const page = await context.newPage();
  await page.goto('https://www.saucedemo.com/inventory.html');
  await expect(page.locator('.inventory_list')).toBeVisible();

  return page;
}

test('Sandwich: Top-Down STUB + Bottom-Up DRIVER', async ({ browser }) => {
  const topContext = await browser.newContext();
  const bottomContext = await browser.newContext();
  const topPage = await topContext.newPage();

  try {
    await Promise.all([
      // =================================================
      // BRANCH 1 : TOP-DOWN
      // Login จริง -> จำลอง UI Inventory ด้วย Stub HTML
      // =================================================
      (async () => {
        await topPage.goto('https://www.saucedemo.com/');
        await topPage.locator('#user-name').fill('standard_user');
        await topPage.locator('#password').fill('secret_sauce');
        await topPage.locator('#login-button').click();

        await topPage.waitForURL(/inventory\.html/);

        // แทนที่หน้า Inventory ด้วย Stub HTML
        await topPage.setContent(`
          <!doctype html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>Stub Inventory</title>
            </head>
            <body>
              <h1>Stub Inventory</h1>
              <div class="inventory_list" data-test="stub-inventory">
                Fake Inventory from Stub B
              </div>
            </body>
          </html>
        `);

        await expect(topPage.locator('[data-test="stub-inventory"]'))
          .toContainText('Fake Inventory from Stub B');
      })(),

      // =================================================
      // BRANCH 2 : BOTTOM-UP
      // Driver A -> B REAL (Inventory) -> E REAL (Cart)
      // =================================================
      (async () => {
        const bottomPage = await driverOpenInventory(bottomContext);

        // B REAL: ตรวจสอบจำนวนสินค้า
        await expect(bottomPage.locator('.inventory_item'))
          .toHaveCount(6);

        // E REAL: ลองกดเพิ่มสินค้าลงตะกร้า แล้วเช็ค Badge
        await bottomPage
          .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
          .click();

        await expect(bottomPage.locator('.shopping_cart_badge'))
          .toHaveText('1');
      })(),
    ]);
  } finally {
    // ทำความสะอาด Context หลังรันเสร็จ
    await Promise.all([
      topContext.close(),
      bottomContext.close(),
    ]);
  }
});