# Projet Qualité logiciel
___
> Membre du Groupe:
- DATOUO Alain Paul
- NJIKE Hélène Ivana
- MOSSAND Thomas

## Cas de test issus de JIRA / Xray
 
| Ticket | Résumé | Technique | Automatisé |
|---|---|---|---|
| SCRUM-44 | [TC][Loan] Demande approuvée avec acompte suffisant | Partitions d'équivalence | Oui |
| SCRUM-45 | [TC][Loan] Demande refusée avec acompte insuffisant | Table de décision | Oui |
| SCRUM-46 | [TC][Loan] Acompte supérieur au solde du compte source | Table de décision | Oui |
| SCRUM-37 | [TC][Loan] Montant du prêt à 0 et à 0,01 | Valeurs limites | Oui |
| SCRUM-40 | [TC][Loan] Montant du prêt négatif | Error guessing | Oui |
| SCRUM-43 | [TC][Loan] Champs obligatoires laissés vides | Error guessing | Oui |
| SCRUM-47 | [TC][Loan] Saisie de caractères non numériques | Error guessing | Oui |
| SCRUM-48 | [TC][Loan] Compte de prêt visible et soldes mis à jour après approbation | Transitions d'états | Oui |


## Cas de test Xray - Demande de prêt (ParaBank)

### TC1 - [TC][Loan] Demande approuvée avec acompte suffisant
**Technique : Partitions d'équivalence**

1. **Action** : Accéder à la fonctionnalité « Request Loan ».
   - Données : Aucune(e)
   - Résultat attendu : Le formulaire « Apply for a Loan » est affiché avec les champs Loan Amount, Down Payment et From account #.

2. **Action** : Saisir 1000 dans Loan Amount, 500 dans Down Payment et sélectionner le compte 13344.
   - Données : Loan Amount = 1000 \$ ; Down Payment = 500 \$ ; From account # = 13344
   - Résultat attendu : Les trois valeurs sont correctement saisies dans le formulaire.

3. **Action** : Cliquer sur « APPLY NOW ».
   - Données : Loan Amount = 1000 \$ ; Down Payment = 500 \$ ; From account # = 13344
   - Résultat attendu : La demande est traitée avec le statut Approved et un nouveau numéro de compte de prêt est affiché.

---

### TC2 - [TC][Loan] Demande refusée avec acompte insuffisant
**Technique : Table de décision**

1. **Action** : Accéder à la fonctionnalité « Request Loan ».
   - Données : Aucune(e)
   - Résultat attendu : Le formulaire « Apply for a Loan » est affiché avec les champs Loan Amount, Down Payment et From account #.

2. **Action** : Saisir 1000 dans Loan Amount, 100 dans Down Payment et sélectionner le compte 13344.
   - Données : Loan Amount = 1000 \$ ; Down Payment = 100 \$ ; From account # = 13344
   - Résultat attendu : Les valeurs saisies sont correctement affichées dans le formulaire.

3. **Action** : Cliquer sur « APPLY NOW ».
   - Données : Loan Amount = 1000 \$ ; Down Payment = 100 \$ ; From account # = 13344
   - Résultat attendu : La demande est refusée avec le statut Denied et un message indiquant que les fonds sont insuffisants pour l'acompte.

---

### TC3 - [TC][Loan] Acompte supérieur au solde du compte source
**Technique : Table de décision**

1. **Action** : Accéder à la fonctionnalité « Request Loan ».
   - Données : Aucune(e)
   - Résultat attendu : Le formulaire « Apply for a Loan » est affiché avec les champs Loan Amount, Down Payment et From account #.

2. **Action** : Saisir 1000 dans Loan Amount, 6000 dans Down Payment et sélectionner le compte 13344.
   - Données : Loan Amount = 1000 \$ ; Down Payment = 6000 \$ ; From account # = 13344 ; Solde disponible = 5022,93 \$
   - Résultat attendu : Les valeurs sont correctement renseignées dans le formulaire.

3. **Action** : Cliquer sur « APPLY NOW ».
   - Données : Loan Amount = 1000 \$ ; Down Payment = 6000 \$ ; From account # = 13344
   - Résultat attendu : La demande est refusée avec le statut Denied et un message indiquant que les fonds sont insuffisants pour l'acompte.

---

### TC4 - [TC][Loan] Montant du prêt à 0 et à 0,01
**Technique : Valeurs limites**

1. **Action** : Saisir 0 comme montant du prêt, 100 comme acompte, sélectionner un compte source valide, puis cliquer sur Apply Now.
   - Données : Montant = 0 ; Acompte = 100 ; Compte source = 13344
   - Résultat attendu : Un message d'erreur explicite refuse la demande (montant nul invalide), sans création de prêt.

2. **Action** : Saisir 0,01 comme montant du prêt, 100 comme acompte, sélectionner un compte source valide, puis cliquer sur Apply Now.
   - Données : Montant = 0,01 ; Acompte = 100 ; Compte source = 13344
   - Résultat attendu : Le prêt est accepté comme montant valide minimal ; un nouveau compte de prêt est créé.

---

### TC5 - [TC][Loan] Montant du prêt négatif
**Technique : Error guessing**

1. **Action** : Saisir un montant négatif (ex : -500) dans le champ Montant du prêt, 100 comme acompte, puis cliquer sur Apply Now.
   - Données : Montant = -500 ; Acompte = 100 ; Compte source = compte valide
   - Résultat attendu : La demande est rejetée avec un message d'erreur explicite (pas de création de prêt, pas de crash).

---

### TC6 - [TC][Loan] Champs obligatoires laissés vides
**Technique : Error guessing**

1. **Action** : Laisser le champ Montant du prêt (ou l'Acompte) vide, puis cliquer sur Apply Now.
   - Données : Montant = (vide) ; Acompte = (vide) ; Compte source = valide
   - Résultat attendu : Un message d'erreur explicite signale les champs obligatoires manquants ; aucune demande n'est traitée, aucune erreur technique n'est visible.

---

### TC7 - [TC][Loan] Saisie de caractères non numériques
**Technique : Error guessing**

1. **Action** : Saisir des caractères non numériques (ex : "abc") dans le champ Montant du prêt, 100 comme acompte, puis cliquer sur Apply Now.
   - Données : Montant = abc ; Acompte = 100 ; Compte source = compte valide
   - Résultat attendu : La saisie non numérique est rejetée avec un message d'erreur explicite ; aucune erreur technique n'est visible (pas de stack trace ni page blanche).

---

### TC8 - [TC][Loan] Compte de prêt visible et soldes mis à jour après approbation
**Technique : Transition d'états**

1. **Action** : Noter le solde du compte source, soumettre une demande de prêt avec un montant et un acompte garantissant l'approbation, puis consulter Accounts Overview.
   - Données : Montant = 2000 ; Acompte = 500 ; Compte source = 13677 (solde avant : -99,99 \$)
   - Résultat attendu : Un nouveau compte de prêt apparaît avec un solde égal au montant plein du prêt (2000 \$), et le compte source est débité exactement du montant de l'acompte.

## Cas de test non automatisés

