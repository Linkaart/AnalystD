# AnalystD

Dashboard Data Analyst complet — explorez, visualisez et analysez vos données directement dans le navigateur.

## Fonctionnalités

- **Import de données** — glisser-déposer ou sélectionner un fichier CSV, TSV ou XLSX
- **Tableau interactif** — tri multi-colonnes, recherche globale, pagination configurable
- **Statistiques descriptives** — min, max, moyenne, médiane, quartiles, écart-type, fréquences
- **Graphiques interactifs** — barres, lignes (avec double axe Y), camembert, histogramme, nuage de points
- **Matrice de corrélation** — coefficient de Pearson entre toutes les colonnes numériques
- **Filtres dynamiques** — ajoutez plusieurs filtres (=, ≠, >, ≥, <, ≤, contient…) qui s'appliquent en temps réel à toutes les vues
- **Export** — CSV, TSV ou JSON des données filtrées
- **100 % client-side** — aucune donnée envoyée sur un serveur

## Démarrage rapide

```bash
npm install
npm run dev
```

Puis ouvrez [http://localhost:3000](http://localhost:3000).

## Stack

- [Next.js 16](https://nextjs.org/) + React 19
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) pour les graphiques
- [PapaParse](https://www.papaparse.com/) pour le parsing CSV
- [read-excel-file](https://www.npmjs.com/package/read-excel-file) pour les fichiers Excel
