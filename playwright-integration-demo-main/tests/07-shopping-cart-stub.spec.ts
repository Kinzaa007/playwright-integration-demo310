import { test, expect } from '@playwright/test';

test('Inventory REAL -> Shopping Cart STUB: Check student name', async ({ page }) => {

  await page.goto('/');

  // 1. เข้าสู่ระบบจริง (Login)
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();

  // 2. รอจนเข้าหน้า Inventory
  await page.waitForURL(/inventory\.html/);
  await expect(page.locator('.inventory_list')).toBeVisible();

  // 3. จำลองหน้า Shopping Cart ด้วย Stub HTML (แก้ไขชื่อให้ถูกต้องแล้ว)
  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Shopping Cart Stub</title>
      </head>

      <body>
        <h1>Shopping Cart Stub</h1>

        <div data-test="stub-shopping-cart">

          <h2>Shopping Cart</h2>

          <div class="student-name">
            จิณณพัต จิตมโนวรรณ์
          </div>

        </div>
      </body>
    </html>
  `);

  // 4. ตรวจสอบข้อความชื่อนักศึกษาใน Stub
  await expect(
    page.locator('[data-test="stub-shopping-cart"]')
  ).toContainText('จิณณพัต จิตมโนวรรณ์');

});