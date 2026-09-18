# Guide pratique — INF 5015 : Les fondamentaux du Big Data

> Synthèse opérationnelle du cours de Mr TOUATI + procédures de dépannage réelles rencontrées sur la Sandbox HDP 2.6.5.

---

## Sommaire

1. [Partie théorique à connaître](#1-partie-théorique-à-connaître)
2. [Architecture Hadoop](#2-architecture-hadoop)
3. [Installation de l'environnement](#3-installation-de-lenvironnement)
4. [Dépannage de la Sandbox](#4-dépannage-de-la-sandbox)
5. [TP1 — Charger des fichiers dans HDFS](#5-tp1--charger-des-fichiers-dans-hdfs)
6. [TP2 — MapReduce avec mrjob](#6-tp2--mapreduce-avec-mrjob)
7. [TP3 — Hive](#7-tp3--hive)
8. [TP4 — Zeppelin](#8-tp4--zeppelin)
9. [TP5 — Pig](#9-tp5--pig)
10. [Gouvernance : Ranger et Atlas](#10-gouvernance--ranger-et-atlas)
11. [Antisèche commandes](#11-antisèche-commandes)
12. [Questions probables à l'examen](#12-questions-probables-à-lexamen)

---

## 1. Partie théorique à connaître

### Les 5V du Big Data

| V | Définition | Exemple |
|---|---|---|
| **Volume** | Quantité de données à stocker | Logs Netflix, pétaoctets |
| **Vélocité** | Vitesse de production et de traitement | Flux de transactions bancaires |
| **Variété** | Formats hétérogènes | JSON, vidéo, SQL, logs |
| **Véracité** | Fiabilité et exactitude | Doublons, champs manquants |
| **Valeur** | Bénéfice métier extrait | Recommandations, détection de fraude |

### Types de données

- **Structurées** : tables SQL, CSV — schéma fixe et connu
- **Semi-structurées** : JSON, XML — schéma souple, auto-descriptif
- **Non structurées** : vidéo, texte libre, images — pas de schéma

### Les 5 dimensions de la qualité

Exactitude · Complétude · Cohérence · Actualité · Traçabilité

Exemple de contrôle qualité en HiveQL :

```sql
-- Détecter les emails malformés
SELECT * FROM customers WHERE email NOT LIKE '%@%.%';

-- Détecter les doublons
SELECT client_id, COUNT(*) AS occurrences
FROM customers
GROUP BY client_id
HAVING COUNT(*) > 1;
```

### Cycle de vie de la donnée

```
1. Ingestion    →  Kafka, Sqoop, Flume
2. Stockage     →  HDFS
3. Traitement   →  Hive, Pig, Spark
4. Analyse      →  HiveQL, Spark MLlib
5. Diffusion    →  Outils BI (PowerBI, Tableau)
6. Archivage    →  Stockage froid, conformité RGPD
```

### Alignement métier — trois exemples à retenir

- **E-commerce** : logs utilisateurs → HDFS → Hive → PowerBI
- **Finance** : transactions → HBase → Spark MLlib → alertes fraude
- **Supply chain** : capteurs IoT → Kafka → Spark Streaming → tableau de bord

---

## 2. Architecture Hadoop

### Les 4 composants du cœur

| Composant | Rôle |
|---|---|
| **HDFS** | Stockage distribué, tolérant aux pannes |
| **YARN** | Négociation et allocation des ressources du cluster |
| **MapReduce** | Modèle de traitement distribué par lots |
| **Common** | Bibliothèques et utilitaires partagés |

### HDFS en détail

- Le fichier est **découpé en blocs de 128 Mo** (défaut Hadoop 2+)
- Chaque bloc est **répliqué 3 fois** sur des DataNodes différents
- Le **NameNode** stocke les métadonnées : où se trouve chaque bloc
- Les **DataNodes** stockent les blocs physiques
- Le **Secondary NameNode** fusionne périodiquement les journaux (ce n'est *pas* un NameNode de secours)

> Point d'examen classique : un fichier de 11 Mo occupe **un seul bloc**, et le bloc n'est pas rempli à 128 Mo — HDFS n'alloue pas l'espace inutilisé. En revanche, HDFS est inefficace sur des millions de petits fichiers, car chacun consomme une entrée de métadonnées dans le NameNode.

### Écosystème — à quoi sert quoi

| Outil | Catégorie | Rôle |
|---|---|---|
| **Hive** | Requêtage | SQL-like (HiveQL) sur données structurées |
| **Pig** | Programmation | Langage de flux (Pig Latin), compilé en MapReduce |
| **Spark** | Traitement | Calcul en mémoire, bien plus rapide que MapReduce |
| **HBase** | Base NoSQL | Accès aléatoire en lecture/écriture |
| **Sqoop** | Ingestion | Import/export entre SGBD relationnel et HDFS |
| **Flume** | Ingestion | Collecte de logs en flux |
| **Kafka** | Temps réel | Bus de messages distribué |
| **Oozie** | Orchestration | Ordonnanceur de workflows |
| **ZooKeeper** | Coordination | Synchronisation et configuration distribuée |
| **Ambari** | Administration | Provisioning, monitoring, gestion du cluster |
| **Ranger** | Gouvernance | Gestion centralisée des droits d'accès |
| **Atlas** | Gouvernance | Catalogage, métadonnées, *lineage* |
| **Zeppelin** | Visualisation | Notebooks interactifs |
| **Tez** | Moteur | Remplace MapReduce comme moteur d'exécution Hive |

### Hadoop vs Spark

| Critère | Hadoop MapReduce | Spark |
|---|---|---|
| Performance | Écritures disque entre étapes | Calcul en mémoire, 10 à 100× plus rapide |
| Facilité | Modèle Map/Reduce contraignant | API haut niveau, Java/Scala/Python/R |
| Coût | Matériel standard bon marché | Exige beaucoup de RAM |
| Cas d'usage | ETL, traitement par lots, logs | ML, temps réel, analyse interactive |

---

## 3. Installation de l'environnement

### Prérequis matériels

| Ressource | Minimum | Confortable |
|---|---|---|
| RAM machine hôte | 16 Go | 32 Go |
| RAM allouée à la VM | 8 Go | 12 Go |
| CPU alloués | 4 | 4 |
| Disque libre | 40 Go | 60 Go |

La virtualisation (VT-x / AMD-V) doit être activée dans le BIOS.

### Étapes

1. Installer **VirtualBox 7.0** — https://www.virtualbox.org/
2. Télécharger l'image **HDP 2.6.5** (~15 Go) :
   `HDP_2.6.5_virtualbox_180626.ova`
3. VirtualBox → Fichier → Importer un appareil virtuel → sélectionner le `.ova`
4. Vérifier les paramètres : 8192 Mo de RAM, 4 CPU
5. Démarrer la VM et **attendre 5 à 10 minutes** — Ambari met du temps à répondre

### Ports à connaître

| Port | Service |
|---|---|
| **1080** | Page d'accueil Sandbox (splash) |
| **8080** | **Ambari** — administration du cluster |
| **50070** | NameNode UI (navigation HDFS) |
| **8088** | ResourceManager YARN |
| **9995** | Zeppelin |
| **21000** | Atlas |
| **6080** | Ranger |
| **30800** | Data Analytics Studio (HDP 3.x) |
| **4200** | Shell web (accès terminal navigateur) |
| **2222** | SSH vers le conteneur `sandbox-hdp` |
| **2200** | SSH vers la VM hôte |

### Comptes par défaut

| Contexte | Utilisateur | Mot de passe |
|---|---|---|
| Ambari (admin) | `admin` | `admin` |
| Ambari (utilisateur) | `maria_dev` | `maria_dev` |
| SSH root | `root` | `hadoop` (changement forcé à la 1re connexion) |

### Jeux de données du cours

```bash
# Naissances par prénom (INSEE)
wget https://hadoopudemy.s3.eu-west-3.amazonaws.com/nat2018.csv

# Programme MapReduce Python fourni
wget https://hadoopudemy.s3.eu-west-3.amazonaws.com/NombreNaissances.py

# MovieLens 100K (u.data & u.item)
# https://grouplens.org/datasets/movielens/  →  ml-100k.zip
```

Structure des fichiers MovieLens :

```
u.data  : user_id \t film_id \t note \t timestamp
u.item  : film_id | film_title | date_sortie | ... (séparateur pipe)
```

---

## 4. Dépannage de la Sandbox

C'est la partie qui fait perdre le plus de temps. Voici les pannes réelles et leur correction.

### Symptôme : 502 Bad Gateway sur un port de service

Le proxy nginx de la Sandbox atteint bien la VM, mais **aucun service n'écoute derrière**. Ce n'est pas un problème réseau : le service n'est pas démarré ou s'est arrêté après démarrage (souvent tué par l'OOM killer).

**Correction** : démarrer le service depuis Ambari, après avoir libéré de la mémoire (voir plus bas).

### Symptôme : `localhost:8080` affiche autre chose qu'Ambari

Un logiciel de votre PC occupe déjà le port 8080 (typiquement EDB Postgres, Tomcat, Jenkins). La redirection VirtualBox n'a alors jamais pu s'établir.

```cmd
netstat -ano | findstr :8080
tasklist /FI "PID eq <le_PID_trouvé>"
```

Puis, en **invite de commandes administrateur** :

```cmd
taskkill /PID <le_PID> /F
```

Pour éviter le retour au reboot : `services.msc` → service concerné → Propriétés → Type de démarrage **Manuel**.

*Alternative sans rien tuer* : VM éteinte → Configuration → Réseau → Avancé → Redirection de ports → passer le port hôte de la règle `8080` à `8081`, puis utiliser `http://localhost:8081`.

### Symptôme : SSH se ferme après « You are required to change your password »

La séquence attendue est :

```
root@127.0.0.1's password:   →  hadoop
(current) UNIX password:     →  hadoop   (re-saisie, pas le nouveau)
New password:                →  mot de passe fort
Retype new password:         →  le même
```

Deux pièges :

- La politique PAM refuse tout mot de passe court, proche d'un mot du dictionnaire, ou dérivé de « root »/« hadoop ». Trois refus et la session se ferme.
- Le clavier de la VM est en **QWERTY US**. Utiliser **uniquement des lettres**, en évitant `a q z w m`.

Rien ne s'affiche pendant la frappe : c'est normal.

### Accès de secours sans SSH

- Fenêtre VirtualBox → cliquer dedans → **ALT+F5** → prompt de login local (`Ctrl` droite pour ressortir)
- Navigateur → **http://localhost:4200** → shell web, avec le clavier de Windows

### Réinitialiser le mot de passe Ambari

```bash
docker exec -it sandbox-hdp bash
ambari-admin-password-reset
ambari-server restart
```

### Vérifier l'état des conteneurs

```bash
docker ps -a                    # sandbox-hdp et sandbox-proxy doivent être Up
docker start sandbox-hdp
docker restart sandbox-proxy

docker exec -it sandbox-hdp bash
ambari-server status
ambari-server start
tail -100 /var/log/ambari-server/ambari-server.log
```

### Le réglage le plus important : arrêter les services inutiles

Par défaut la Sandbox tente de démarrer une trentaine de composants. Sur 8 Go, c'est impossible : les services se font tuer par l'OOM killer et affichent 502.

**À arrêter** (Service → Actions → *Turn On Maintenance Mode*, puis *Stop*) :
Atlas, Ranger, Storm, Kafka, Falcon, Oozie, Spark2, HBase, Infra Solr, Ambari Metrics, Druid, Superset, SmartSense, Log Search, Flume, Knox, Accumulo.

**À garder** pour ce cours :
ZooKeeper, HDFS, YARN, MapReduce2, Tez, Hive, Pig.

**Démarrer un par un**, en attendant le vert avant chaque suivant :

```
ZooKeeper → HDFS → YARN → MapReduce2 → Tez → Hive
```

> Zeppelin et Atlas ne sont indispensables qu'aux TP correspondants. Les démarrer ponctuellement, en arrêtant Hive si la RAM manque.

### Vérifier que HDFS tourne réellement

```bash
hdfs dfsadmin -report     # doit afficher 1 Live datanode
hdfs dfs -ls /
```

### Sortir du safe mode

Après un arrêt brutal de la VM, HDFS démarre en lecture seule :

```bash
hdfs dfsadmin -safemode get
hdfs dfsadmin -safemode leave
```

> Bonne pratique : toujours arrêter la VM proprement (*ACPI Shutdown*), jamais par fermeture forcée. Et faire un **snapshot VirtualBox** une fois que tout fonctionne — cela évite de tout réinstaller après une casse.

---

## 5. TP1 — Charger des fichiers dans HDFS

### Méthode A : via l'interface Ambari (Files View)

1. Se connecter à Ambari en `maria_dev`
2. Menu grille (en haut à droite) → **Files View**
3. Naviguer vers `/user/maria_dev`
4. **New Folder** → nommer le dossier (ex. `prenoms`)
5. Entrer dans le dossier → **Upload** → sélectionner le fichier local

L'interface permet ensuite d'ouvrir, déplacer, télécharger le fichier et modifier ses permissions.

### Méthode B : en ligne de commande

Connexion via PuTTY (`maria_dev@127.0.0.1`, port `2222`) ou via le shell web.

```bash
# Télécharger le fichier sur la VM
wget https://hadoopudemy.s3.eu-west-3.amazonaws.com/nat2018.csv
ls -l

# Créer un répertoire dans HDFS
hadoop fs -mkdir bigdata

# Copier depuis le système local vers HDFS
hadoop fs -copyFromLocal nat2018.csv bigdata/nat2018.csv

# Vérifier
hadoop fs -ls bigdata
```

### Vérification visuelle du découpage en blocs

Ouvrir **http://localhost:50070** → Utilities → **Browse the file system** → naviguer jusqu'au fichier.

On y lit la taille du fichier (11,07 Mo), le facteur de réplication (1 sur la Sandbox mono-nœud) et la taille de bloc (**128 Mo**).

---

## 6. TP2 — MapReduce avec mrjob

### Principe de MapReduce

```
Entrée  →  [Split]  →  Map  →  Shuffle & Sort  →  Reduce  →  Sortie
```

- **Map** : transforme chaque ligne en paires clé/valeur
- **Shuffle & Sort** : regroupe automatiquement toutes les valeurs d'une même clé
- **Reduce** : agrège les valeurs de chaque clé

### Préparation de l'environnement

En root (`su root`, mot de passe `hadoop`) :

```bash
yum install python-pip -y      # gestionnaire de paquets Python
pip install mrjob              # librairie MapReduce en Python
yum install nano -y            # éditeur de texte
exit                           # retour à maria_dev
```

### Récupérer les fichiers

```bash
wget https://hadoopudemy.s3.eu-west-3.amazonaws.com/nat2018.csv
wget https://hadoopudemy.s3.eu-west-3.amazonaws.com/NombreNaissances.py
ls -l
```

### Exécution en local (test rapide)

```bash
python NombreNaissances.py nat2018.csv > python_local
```

Toujours tester en local avant de lancer sur le cluster : le retour d'erreur est immédiat et lisible.

### Exécution sur le cluster Hadoop

```bash
python NombreNaissances.py -r hadoop \
  --hadoop-streaming-jar /usr/hdp/current/hadoop-mapreduce-client/hadoop-streaming.jar \
  nat2018.csv
```

Dans la sortie, repérer :

```
map 0% reduce 0%
map 100% reduce 0%
map 100% reduce 100%
Job job_... completed successfully
```

### Structure type d'un job mrjob

```python
from mrjob.job import MRJob

class NombreNaissances(MRJob):

    def mapper(self, _, line):
        champs = line.split(';')
        prenom = champs[1]
        nombre = champs[3]
        if prenom != 'preusuel':          # ignorer l'en-tête
            yield prenom, int(nombre)

    def reducer(self, prenom, nombres):
        yield prenom, sum(nombres)

if __name__ == '__main__':
    NombreNaissances.run()
```

### Exercice MovieLens équivalent

Compter le nombre de notes par film à partir de `u.data` (séparateur tabulation) :

```python
from mrjob.job import MRJob

class NotesParFilm(MRJob):

    def mapper(self, _, line):
        user_id, film_id, note, timestamp = line.split('\t')
        yield film_id, 1

    def reducer(self, film_id, occurrences):
        yield film_id, sum(occurrences)

if __name__ == '__main__':
    NotesParFilm.run()
```

---

## 7. TP3 — Hive

Hive donne une interface SQL sur des données stockées dans HDFS. Les requêtes sont converties en jobs MapReduce ou Tez.

### Accès

- **HDP 2.6.5** : Ambari → menu grille → **Hive View 2.0**
- **HDP 3.x** : **Data Analytics Studio** sur le port 30800
- **Ligne de commande** : `beeline -u jdbc:hive2://localhost:10000 -n maria_dev`

### Créer une table par upload (interface)

1. Database → **Upload Table**
2. File type : `CSV`, Field Delimiter : `;` (fichiers INSEE) ou `\t` (MovieLens)
3. Cocher **Is first row header** si le fichier a un en-tête
4. Select File Source : *Upload from HDFS* (indiquer le chemin) ou *Upload from Local*
5. **Preview** → ajuster le nom de la table et le type de chaque colonne
6. **Create**

### Créer une table en HiveQL

```sql
-- Table des naissances (fichier INSEE)
CREATE TABLE nat2024 (
    sexe    INT,
    preusuel STRING,
    annee   INT,
    nombre  INT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ';'
STORED AS TEXTFILE
TBLPROPERTIES ("skip.header.line.count"="1");

-- Charger depuis HDFS
LOAD DATA INPATH '/user/maria_dev/prenoms/nat2024.csv' INTO TABLE nat2024;
```

```sql
-- Tables MovieLens
CREATE TABLE notes (
    user_id   INT,
    film_id   INT,
    note      INT,
    horodatage BIGINT
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t';

CREATE TABLE films (
    film_id     INT,
    film_title  STRING,
    date_sortie STRING
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '|';
```

### Requêtes du cours

**Query 1 — nombre de notes par film**

```sql
SELECT film_id, COUNT(film_id) AS nombreNotes
FROM notes
GROUP BY film_id
ORDER BY nombreNotes DESC;
```

**Query 2 — top 10 des prénoms toutes années confondues**

```sql
SELECT preusuel,
       SUM(nombre) AS total_porteurs
FROM nat2024
GROUP BY preusuel
ORDER BY total_porteurs DESC
LIMIT 10;
```

**Query 3 — évolution du nombre de naissances par année**

```sql
SELECT annee,
       SUM(nombre) AS total_naissances
FROM nat2024
GROUP BY annee
ORDER BY annee;
```

**Query 4 — top prénoms d'une année donnée, par sexe**

```sql
SELECT sexe,
       preusuel,
       SUM(nombre) AS total_naissances
FROM nat2024
WHERE annee = 2020
GROUP BY sexe, preusuel
ORDER BY sexe, total_naissances DESC
LIMIT 10;
```

**Requête avec HAVING — prénoms portés plus de 100 000 fois**

```sql
SELECT SUM(nombre) AS Total, preusuel
FROM nat2024
GROUP BY preusuel
HAVING SUM(nombre) > 100000;
```

**Jointure MovieLens — films les mieux notés**

```sql
SELECT f.film_title,
       COUNT(n.note) AS nb_notes,
       ROUND(AVG(n.note), 2) AS note_moyenne
FROM notes n
JOIN films f ON n.film_id = f.film_id
GROUP BY f.film_title
HAVING COUNT(n.note) > 100
ORDER BY note_moyenne DESC
LIMIT 10;
```

Le filtre `HAVING COUNT(...) > 100` évite qu'un film noté une seule fois avec 5/5 remonte en tête. C'est le genre de nuance qui rapporte des points.

### Contrôle qualité en HiveQL

```sql
-- Emails malformés
SELECT * FROM customers WHERE email NOT LIKE '%@%.%';

-- Doublons
SELECT client_id, COUNT(*) FROM customers
GROUP BY client_id HAVING COUNT(*) > 1;

-- Valeurs manquantes
SELECT COUNT(*) FROM customers WHERE preusuel IS NULL OR preusuel = '';

-- Dédoublonnage
CREATE TABLE customers_clean AS SELECT DISTINCT * FROM customers;
```

### Notion à maîtriser : table managed vs external

| | Managed (interne) | External |
|---|---|---|
| Déclaration | `CREATE TABLE` | `CREATE EXTERNAL TABLE` |
| `DROP TABLE` | supprime métadonnées **et données** | supprime **seulement** les métadonnées |
| Usage | données propres à Hive | données partagées avec d'autres outils |

---

## 8. TP4 — Zeppelin

Notebook web permettant d'exécuter des requêtes et de visualiser les résultats.

### Lancement

Ambari → Zeppelin → **Quick Links** → *Zeppelin UI*, ou directement **http://localhost:9995**

### Créer une note

1. Notebook → **Create new note**
2. Note Name : `Exemple Hive`
3. Default Interpreter : **jdbc**
4. Create

### Exécuter une requête

Le préfixe `%jdbc(hive)` indique l'interpréteur à utiliser :

```sql
%jdbc(hive)
SELECT SUM(nombre) AS Total, preusuel
FROM nat2024
GROUP BY preusuel
HAVING SUM(nombre) > 100000;
```

```sql
%jdbc(hive)
SELECT preusuel,
       SUM(nombre) AS total_porteurs
FROM nat2024
GROUP BY preusuel
ORDER BY total_porteurs DESC
LIMIT 10;
```

`Shift + Entrée` pour exécuter le paragraphe.

### Visualiser

Sous le résultat, une barre d'icônes propose table, histogramme, camembert, nuage de points, courbe, aire. Le menu **settings** permet de glisser les colonnes dans *keys* (axe X), *values* (axe Y) et *groups*.

Pour le graphe demandé dans le cours : X = `film_id`, Y = `nombreNotes`, en nuage de points.

---

## 9. TP5 — Pig

Pig Latin décrit un **flux de transformations**, compilé en jobs MapReduce. Plus souple que Hive pour l'ETL, moins adapté aux requêtes analytiques.

```bash
pig            # mode MapReduce (cluster)
pig -x local   # mode local, pour tester vite
```

Exemple — filtrer les clients français :

```pig
clients = LOAD '/user/maria_dev/customers.csv'
          USING PigStorage(',')
          AS (id:int, nom:chararray, pays:chararray, email:chararray);

francais = FILTER clients BY pays == 'France';

DUMP francais;

STORE francais INTO '/user/maria_dev/clients_fr' USING PigStorage(',');
```

Exemple MovieLens — notes moyennes par film :

```pig
notes = LOAD '/user/maria_dev/u.data'
        USING PigStorage('\t')
        AS (user_id:int, film_id:int, note:int, horodatage:long);

groupes = GROUP notes BY film_id;

moyennes = FOREACH groupes GENERATE
           group AS film_id,
           AVG(notes.note) AS note_moyenne,
           COUNT(notes) AS nb_notes;

populaires = FILTER moyennes BY nb_notes > 100;
tries      = ORDER populaires BY note_moyenne DESC;
top10      = LIMIT tries 10;

DUMP top10;
```

Opérateurs à connaître : `LOAD`, `FILTER`, `GROUP`, `FOREACH ... GENERATE`, `JOIN`, `ORDER`, `LIMIT`, `DISTINCT`, `STORE`, `DUMP`.

> Pig est **paresseux** : rien ne s'exécute avant un `DUMP` ou un `STORE`.

---

## 10. Gouvernance : Ranger et Atlas

### Ranger — sécurité et contrôle d'accès

Gestion **centralisée** des autorisations sur HDFS, Hive, HBase, Kafka. Interface sur le port **6080**.

Exemple de politique attendue au TP5 :

| Rôle | Ressource | Droits |
|---|---|---|
| `analyst` | base `default`, table `nat2024` | `select` uniquement |
| `data_steward` | base `default`, toutes tables | `select`, `update`, `create`, `drop` |

Procédure : Ranger UI → service `Sandbox_hive` → **Add New Policy** → renseigner base/table/colonne → ajouter l'utilisateur ou le groupe → cocher les permissions → Save.

Ranger journalise également tous les accès, ce qui sert aux audits de conformité.

### Atlas — catalogage et lineage

Interface sur le port **21000**. Trois fonctions :

- **Catalogage** : inventaire des tables, colonnes, types
- **Classification** : étiqueter les données sensibles (`PII`, `RGPD`, `Confidentiel`)
- **Lineage** : tracer visuellement l'origine d'une donnée et les transformations subies

### Articulation à retenir

| Outil | Question à laquelle il répond |
|---|---|
| **Ambari** | Le cluster fonctionne-t-il ? |
| **Ranger** | Qui a le droit d'accéder à quoi ? |
| **Atlas** | D'où vient cette donnée et où va-t-elle ? |

Le lien avec le **RGPD** est direct : Atlas identifie les données personnelles, Ranger en restreint l'accès, et l'archivage applique les durées de conservation.

---

## 11. Antisèche commandes

### HDFS

```bash
hadoop fs -ls /chemin                      # lister
hadoop fs -ls -R /chemin                   # lister récursivement
hadoop fs -mkdir dossier                   # créer un répertoire
hadoop fs -mkdir -p a/b/c                  # créer l'arborescence
hadoop fs -copyFromLocal local.csv hdfs/   # local → HDFS
hadoop fs -put local.csv hdfs/             # équivalent
hadoop fs -copyToLocal hdfs/f.csv .        # HDFS → local
hadoop fs -get hdfs/f.csv .                # équivalent
hadoop fs -cat fichier.csv                 # afficher
hadoop fs -tail fichier.csv                # dernières lignes
hadoop fs -du -h /chemin                   # taille lisible
hadoop fs -rm fichier.csv                  # supprimer
hadoop fs -rm -r dossier                   # supprimer récursivement
hadoop fs -mv source destination           # déplacer
hadoop fs -cp source destination           # copier dans HDFS
hadoop fs -chmod 755 fichier               # permissions
hadoop fs -chown maria_dev:hdfs fichier    # propriétaire
hadoop fs -setrep -w 2 fichier             # facteur de réplication

hdfs dfsadmin -report                      # état du cluster
hdfs dfsadmin -safemode get|leave          # mode sans échec
hdfs fsck /chemin -files -blocks           # intégrité et blocs
```

> `hadoop fs` et `hdfs dfs` sont équivalents ; `hdfs dfs` est la forme recommandée aujourd'hui.

### YARN

```bash
yarn application -list                     # jobs en cours
yarn application -kill application_XXXX    # tuer un job
yarn node -list                            # nœuds du cluster
yarn logs -applicationId application_XXXX  # logs d'un job
```

### Hive

```bash
beeline -u jdbc:hive2://localhost:10000 -n maria_dev
hive -e "SELECT * FROM nat2024 LIMIT 10;"    # requête inline
hive -f script.hql                            # exécuter un script
```

```sql
SHOW DATABASES;
USE default;
SHOW TABLES;
DESCRIBE nat2024;
DESCRIBE FORMATTED nat2024;   -- managed ou external, emplacement HDFS
```

### Administration Sandbox

```bash
docker ps -a
docker exec -it sandbox-hdp bash
ambari-server status|start|stop|restart
ambari-admin-password-reset
free -h                        # mémoire disponible
df -h                          # espace disque
```

---

## 12. Questions probables à l'examen

**Quels sont les 5V ?** Volume, Vélocité, Variété, Véracité, Valeur.

**Quelle est la taille de bloc par défaut en HDFS ?** 128 Mo depuis Hadoop 2 (64 Mo en Hadoop 1).

**Quel est le facteur de réplication par défaut ?** 3. Sur la Sandbox mono-nœud, il est ramené à 1.

**Rôle du NameNode ?** Il conserve les métadonnées : arborescence, emplacement de chaque bloc. Il ne stocke aucune donnée. C'est le point de défaillance unique en architecture non-HA.

**Le Secondary NameNode est-il un NameNode de secours ?** Non. Il fusionne périodiquement `fsimage` et `edits` pour éviter que le journal ne devienne trop volumineux. Le vrai secours, c'est le mode High Availability avec un NameNode *standby*.

**Différence entre Hive et Pig ?** Hive fournit une interface SQL déclarative, adaptée à l'analyse. Pig propose un langage procédural de flux (Pig Latin), plus adapté aux transformations ETL enchaînées. Les deux se compilent en MapReduce ou Tez.

**Pourquoi Spark est plus rapide que MapReduce ?** MapReduce écrit sur disque entre chaque étape. Spark conserve les données en mémoire (RDD/DataFrame) entre les transformations, ce qui bénéficie surtout aux algorithmes itératifs comme ceux du machine learning.

**Que fait YARN ?** Il sépare la gestion des ressources de la logique de traitement. Le ResourceManager alloue les conteneurs, les NodeManagers les exécutent, et un ApplicationMaster pilote chaque application. C'est ce qui permet à MapReduce, Spark et Tez de coexister sur le même cluster.

**Que fait le Shuffle dans MapReduce ?** Il redistribue et trie les sorties des mappers pour que toutes les valeurs d'une même clé arrivent au même reducer. C'est l'étape la plus coûteuse en réseau.

**Ranger vs Atlas ?** Ranger gère les autorisations et l'audit des accès. Atlas gère les métadonnées, la classification et le lineage. L'un protège, l'autre documente.

**Pourquoi HDFS est-il inadapté aux petits fichiers ?** Chaque fichier, bloc et répertoire consomme environ 150 octets de mémoire dans le NameNode. Des millions de petits fichiers saturent cette mémoire, alors que le stockage disque reste largement disponible.

**Quand utiliser Hadoop plutôt que Spark ?** Pour du traitement par lots sur de très gros volumes où la latence importe peu et où le budget matériel est contraint : ETL nocturne, traitement de logs, génération de rapports.

---

*Guide établi à partir du support INF 5015 de Mr TOUATI et des procédures de dépannage validées sur HDP Sandbox 2.6.5.*
