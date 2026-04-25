import { test, expect } from '@playwright/test'

test('home loads and taskers navigation works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await page.goto('/taskers')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find')
})
