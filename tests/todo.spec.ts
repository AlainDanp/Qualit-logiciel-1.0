import { test, expect } from '@playwright/test';

test('ajouter une tâche à la liste', async ({ page }) => {
    await page.goto('');
    await page.getByPlaceholder('What needs to be done?')
        .fill('Implémenter un test E2E');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Implémenter un test E2E')).toBeVisible();
});
