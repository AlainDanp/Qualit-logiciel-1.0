import { test, expect } from '@playwright/test';
import {
    creerClient,
    seConnecter,
    premierCompte,
    soldePremierCompte,
    demanderPret,
} from './helpers/parabank';

test.describe('Demande de pret', () => {
    let compte: string;
    let soldeInitial: number;

    test.beforeEach(async ({ page }) => {
        const client = await creerClient(page);
        await seConnecter(page, client);
        compte = await premierCompte(page);
        soldeInitial = await soldePremierCompte(page);
    });

    // SCRUM-1 - [TC][Loan] Demande approuvee avec acompte suffisant
    test('une demande avec un acompte suffisant est approuvee', async ({ page }) => {
        await demanderPret(page, '1000', '100', compte);

        await expect(page.locator('#loanStatus')).toHaveText('Approved');
        await expect(page.getByText('Congratulations, your loan has been approved'))
            .toBeVisible();
    });

    // SCRUM-?? - [TC][Loan] Demande refusee avec acompte insuffisant
    test('une demande avec un acompte insuffisant est refusee', async ({ page }) => {
        await demanderPret(page, '100000', '1', compte);

        await expect(page.locator('#loanStatus')).toHaveText('Denied');
    });

    // SCRUM-1 - [TC][Loan] Acompte superieur au solde du compte source
    test('un acompte superieur au solde du compte est refuse', async ({ page }) => {
        const acompteExcessif = String(soldeInitial + 5000);
        await demanderPret(page, '1000', acompteExcessif, compte);

        await expect(page.locator('#loanStatus')).toHaveText('Denied');
    });

    // SCRUM-1 - [TC][Loan] Montant du pret a 0 puis a 0,01 (valeurs limites)
    for (const montant of ['0', '0.01']) {
        test(`un montant de ${montant} n'ouvre pas de pret approuve`, async ({ page }) => {
            await demanderPret(page, montant, '0', compte);

            await expect(page.locator('#loanStatus')).not.toHaveText('Approved');
        });
    }

    // SCRUM-1 - [TC][Loan] Montant du pret negatif
    test('un montant negatif est rejete', async ({ page }) => {
        await demanderPret(page, '-500', '100', compte);

        await expect(page.locator('#loanStatus')).not.toHaveText('Approved');
    });

    // SCRUM-?? - [TC][Loan] Champs obligatoires laisses vides
    test('une demande sans montant ni acompte affiche une erreur', async ({ page }) => {
        await demanderPret(page, '', '', compte);

        await expect(page.locator('.error')).toBeVisible();
    });

    // SCRUM-1 - [TC][Loan] Saisie de caracteres non numeriques
    test('une saisie non numerique est rejetee', async ({ page }) => {
        await demanderPret(page, 'abc', 'xyz', compte);

        await expect(page.locator('.error')).toBeVisible();
    });

    // SCRUM-1 - [TC][Loan] Compte de pret visible et soldes mis a jour
    test('un pret approuve cree un compte et debite l acompte', async ({ page }) => {
        const acompte = 100;
        await demanderPret(page, '1000', String(acompte), compte);
        await expect(page.locator('#loanStatus')).toHaveText('Approved');

        await page.goto('overview.htm');

        // Un second compte est apparu : le compte de pret
        await expect(page.locator('#accountTable tbody tr')).toHaveCount(3);

        // L'acompte a bien ete debite du compte source
        const soldeApres = await soldePremierCompte(page);
        expect(soldeApres).toBe(soldeInitial - acompte);
    });
});