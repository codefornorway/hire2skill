import { test, expect } from '@playwright/test'

test('home loads and taskers navigation works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await page.goto('/taskers')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('taskers filter controls respond', async ({ page }) => {
  await page.goto('/taskers')

  const search = page.locator('input[placeholder*="Search"], input[placeholder*="Søk"]').first()
  await search.fill('clean')

  const clearBtn = page.getByRole('button', { name: /Clear|Nullstill/ }).first()
  await expect(clearBtn).toBeVisible()
  await clearBtn.click()
})

test('legal pages and env health endpoint are reachable', async ({ page, request }) => {
  await page.goto('/personvern')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await page.goto('/vilkar')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  const res = await request.get('/api/health/env')
  expect([401, 403]).toContain(res.status())
})
