import { Page, expect } from '@playwright/test';

export type Client = {
    username: string;
    password: string;
};

/**
 * Cree un client ParaBank unique.
 *
 * Pourquoi un client par test : ParaBank est une base partagee et persistante.
 * Un compte fixe verrait son solde evoluer d'une execution a l'autre, ce qui
 * rendrait les tests dependants de leur historique. Un client neuf garantit
 * un etat de depart connu et permet l'execution en parallele.
 */
export async function creerClient(page: Page): Promise<Client> {
    const suffixe = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const client: Client = {
        username: `qa_esiea_${suffixe}`,
        password: 'Test1234!',
    };

    await page.goto('register.htm');

    await page.locator('#customer\\.firstName').fill('Jean');
    await page.locator('#customer\\.lastName').fill('Dupont');
    await page.locator('#customer\\.address\\.street').fill('12 rue de la Paix');
    await page.locator('#customer\\.address\\.city').fill('Paris');
    await page.locator('#customer\\.address\\.state').fill('IDF');
    await page.locator('#customer\\.address\\.zipCode').fill('75002');
    await page.locator('#customer\\.phoneNumber').fill('0102030405');
    await page.locator('#customer\\.ssn').fill('123456789');
    await page.locator('#customer\\.username').fill(client.username);
    await page.locator('#customer\\.password').fill(client.password);
    await page.locator('#repeatedPassword').fill(client.password);

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Your account was created successfully'))
        .toBeVisible();

    return client;
}

/** Connecte un client existant depuis la page d'accueil. */
export async function seConnecter(page: Page, client: Client): Promise<void> {
    await page.goto('index.htm');
    await page.locator('input[name="username"]').fill(client.username);
    await page.locator('input[name="password"]').fill(client.password);
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.getByRole('heading', { name: 'Accounts Overview' }))
        .toBeVisible();
}

/** Renvoie le numero du premier compte du client. */
export async function premierCompte(page: Page): Promise<string> {
    await page.goto('overview.htm');
    const lien = page.locator('#accountTable a').first();
    await expect(lien).toBeVisible();
    return (await lien.innerText()).trim();
}

/** Renvoie le solde du premier compte, converti en nombre. */
export async function soldePremierCompte(page: Page): Promise<number> {
    await page.goto('overview.htm');
    const cellule = page.locator('#accountTable tbody tr').first().locator('td').nth(1);
    const texte = (await cellule.innerText()).replace(/[$,\s]/g, '');
    return Number(texte);
}

/** Remplit et soumet le formulaire de demande de pret. */
export async function demanderPret(
    page: Page,
    montant: string,
    acompte: string,
    compte: string,
): Promise<void> {
    await page.goto('requestloan.htm');
    await page.locator('#amount').fill(montant);
    await page.locator('#downPayment').fill(acompte);
    await page.locator('#fromAccountId').selectOption(compte);
    await page.getByRole('button', { name: 'Apply Now' }).click();
}