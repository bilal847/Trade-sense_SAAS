# Structure du Scraper Marocain et Workflow IA

Ce guide explique comment le scraper de données marocaines a été construit à l'aide de prompts IA et détaille son architecture technique.

## 1. Structure Technique
Le fichier `MoroccoProvider.py` repose sur une stratégie d'amélioration progressive en 3 couches :

### Couche 1 : Coeur du Scraping (Le "Squelette")
- **Mécanisme** : Utilise `requests` pour la récupération et `BeautifulSoup` (BS4) pour l'analyse syntaxique.
- **Logique du Prompt IA** : *"Construis une classe de scraping robuste pour la Bourse de Casablanca. Identifie les sélecteurs pour le 'Cours' (Prix) en utilisant BS4 et implémente un crawler basé sur des sessions avec des en-têtes personnalisés pour éviter la détection."*
- **Fichier** : `backend/app/providers/morocco_provider.py` (Lignes 50-68)

### Couche 2 : Jitter Temps Réel (Le "Pouls")
- **Mécanisme** : Implémente un `jitter_factor` mathématique utilisant `math.sin` et `random`.
- **Logique du Prompt IA** : *"Les données de marché doivent paraître vivantes même avec une interrogation toutes les 5 secondes. Crée un mécanisme de jitter qui ajoute une fluctuation de +/- 0,05% au dernier prix pour simuler un carnet d'ordres réel."*
- **Fichier** : `backend/app/providers/morocco_provider.py` (Lignes 76-88)

### Couche 3 : Solution de Repli Robuste (Le "Filet de Sécurité")
- **Mécanisme** : Utilise un cache `_last_known_values` et un bloc `try/except` imbriqué.
- **Logique du Prompt IA** : *"Le scraping web est fragile. Implémente un système hybride qui récupère les données en direct mais bascule de manière transparente vers une simulation en cache si le site est indisponible ou bloque les requêtes, garantissant un temps de fonctionnement de l'interface de 99,9%."*

## 2. Résumé du Workflow IA
1. **Extraction** : Prompt utilisé pour trouver des classes CSS spécifiques (`price`) sur `casablanca-bourse.com`.
2. **Standardisation** : Prompt pour mapper les noms spécifiques au site (ex: "Maroc Telecom") vers des symboles unifiés (`IAM`).
3. **Simulation** : Affinement de la logique de génération OHLCV pour créer 1 000 bougies professionnelles pour les graphiques à haute densité.

---
> [!TIP]
> **Conseil pour l'enregistrement** : Pendant la minute 4, mettez en avant l'utilisation de `BeautifulSoup` et expliquez que l'IA a aidé à faire le pont entre le "Scraping Statique" et les "Visuels Dynamiques" via l'algorithme de Jitter.
