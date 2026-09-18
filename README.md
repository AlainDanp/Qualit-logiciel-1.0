# TP1 — Tests E2E Playwright — ParaBank

## 1. Présentation

Ce projet contient les tests end-to-end automatisés avec **Playwright** pour l'application **ParaBank**.

**Application testée :** https://parabank.parasoft.com/parabank/

## 2. Prérequis

- Node.js >= 22
- npm
- Playwright

## 3. Installation

```bash
npm ci
npx playwright install
```

## 4. Exécution des tests

Lancer l'ensemble des tests :

```bash
npx playwright test
```

Lancer les tests avec l'interface graphique Playwright :

```bash
npx playwright test --ui
```

Lancer les tests avec le navigateur visible :

```bash
npx playwright test --headed
```

Afficher le rapport :

```bash
npx playwright show-report
```

Pour le débogage avec une trace :

```bash
npx playwright test --trace on
```

## 5. Configuration

L'application ParaBank est configurée comme URL de base dans `playwright.config.ts` :

```ts
use: {
  baseURL: 'https://parabank.parasoft.com/parabank/',
},
```

Les tests peuvent naviguer vers l'application avec :

```ts
await page.goto('');
```

## 6. Tickets JIRA / Xray

Les tickets ci-dessous correspondent à l'export Jira fourni pour le projet ParaBank.

### User Story

- **SCRUM-36** — [US][Loan] Client – Demande de prêt en ligne

### Test Execution

- **SCRUM-41** — [TE][Loan] Exécution – Demande de prêt

### Test Plan

- **SCRUM-42** — [TP][Loan] Plan de tests – Demande de prêt

### Test Sets

- **SCRUM-50** — [TS][Loan] Tests de robustesse de saisie
- **SCRUM-49** — [TS][Loan] Tests nominaux et règles métier

### Test Cases

- **SCRUM-48** — [TC][Loan] Compte de prêt visible et soldes mis à jour après approbation
- **SCRUM-47** — [TC][Loan] Saisie de caractères non numériques
- **SCRUM-46** — [TC][Loan] Acompte supérieur au solde du compte source
- **SCRUM-45** — [TC][Loan] Demande refusée avec acompte insuffisant
- **SCRUM-44** — [TC][Loan] Demande approuvée avec acompte suffisant
- **SCRUM-43** — [TC][Loan] Champs obligatoires laissés vides
- **SCRUM-40** — [TC][Loan] Montant du prêt négatif
- **SCRUM-37** — [TC][Loan] Montant du prêt à 0 et à 0,01

### Bugs

- **SCRUM-55** — [BUG][Loan] Erreur interne non gérée lors de la saisie de caractères non numériques
- **SCRUM-54** — [BUG][Loan] Erreur interne non gérée lorsque les champs obligatoires sont vides
- **SCRUM-53** — [BUG][Reset] Message d'erreur
- **SCRUM-52** — [BUG][Loan] Erreur interne non gérée lorsque le montant du prêt est égal à 0
- **SCRUM-51** — [BUG][Reset] Message d'erreur montrant que la personne n'a pas assez d'argent

### Autres tickets

- **SCRUM-4** — Sous-tâche 2.1

## 7. Automatisation des tests

Les tests Playwright sont réalisés à partir des cas de test Xray/JIRA retenus pour l'automatisation.

| Ticket | Cas de test | Automatisé |
|---|---|---|
| SCRUM-48 | [TC][Loan] Compte de prêt visible et soldes mis à jour après approbation | À compléter |
| SCRUM-47 | [TC][Loan] Saisie de caractères non numériques | À compléter |
| SCRUM-46 | [TC][Loan] Acompte supérieur au solde du compte source | À compléter |
| SCRUM-45 | [TC][Loan] Demande refusée avec acompte insuffisant | À compléter |
| SCRUM-44 | [TC][Loan] Demande approuvée avec acompte suffisant | À compléter |
| SCRUM-43 | [TC][Loan] Champs obligatoires laissés vides | À compléter |
| SCRUM-40 | [TC][Loan] Montant du prêt négatif | À compléter |
| SCRUM-37 | [TC][Loan] Montant du prêt à 0 et à 0,01 | À compléter |

## 8. Tests non automatisables

Les cas de test non automatisés doivent être indiqués ici avec leur justification.

| Ticket | Cas de test | Raison |
|---|---|---|
| À compléter | À compléter | À compléter |

## 9. Bonnes pratiques Playwright utilisées

Les tests privilégient les locators sémantiques :

```ts
getByRole()
getByLabel()
getByPlaceholder()
getByText()
getByTestId()
```

Les assertions utilisent les attentes Playwright :

```ts
await expect(...).toBeVisible();
await expect(...).toHaveText(...);
```

Les attentes basées sur un délai fixe (`waitForTimeout`) ne sont pas utilisées.

Les étapes communes peuvent être regroupées dans des `beforeEach`.

## 10. Structure du projet

```text
.
├── tests/
│   └── ...
├── playwright.config.ts
├── package.json
├── package-lock.json
└── README.md
```

## 11. Vérification finale

Depuis un clone propre du projet :

```bash
npm ci
npx playwright install
npx playwright test
```

L'ensemble des tests doit pouvoir être exécuté sans modification supplémentaire de l'environnement.

## 12. Version

`tp1`
