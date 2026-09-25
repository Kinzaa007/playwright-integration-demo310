import {
  test,
  expect,
  BrowserContext,
  Page,
} from '@playwright/test';

// Driver ทำหน้าที่แทน Inventory
// เพื่อเรียก Shopping Cart จริง
async function driverOpenShoppingCart(
  context: BrowserContext
): Promise<Page> {

  await context.addCookies([
    {
      name: 'session-username',
      value: 'standard_user',
      domain: 'www.saucedemo.com',
      path: '/',
    },
  ]);

  const page = await context.newPage();

  // เรียก Shopping Cart จริง
  await page.goto(
    'https://www.saucedemo.com/cart.html'
  );

  return page;
}

test('Shopping Cart DRIVER: Driver -> Shopping Cart REAL', async ({ browser }) => {

  const context = await browser.newContext();

  try {

    // Driver เรียก Shopping Cart
    const page = await driverOpenShoppingCart(context);

    // ตรวจสอบว่า Shopping Cart เปิดได้
    await expect(
      page.locator('.cart_list')
    ).toBeVisible();

  } finally {

    await context.close();

  }

});