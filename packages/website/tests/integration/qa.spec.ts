import { expect, test } from '@playwright/test';

test('qa page', async ({ page }) => {
	await page.goto('/qa');

	await test.info().attach('screenshot', {
		body: await page.screenshot(),
		contentType: 'image/png'
	});
	// click on grow
	// await page.getByRole('checkbox').getByLabel('Grow?').uncheck();
	// await page.screenshot({ path: '.svelte-kit/screenshots/qa-degrow.png' });
});
