# SpotR-Metrics  
Microservice de collecte et d’analyse des métriques pour SpotR

## 📌 Description  
**SpotR-Metrics** est le microservice dédié à la collecte, l’agrégation et l’analyse des données d’utilisation du "réseau social" **SpotR**.  
Il fournit des indicateurs de performance pour améliorer l’expérience utilisateur et guider les décisions techniques et produit.  

Les principaux objectifs :  
- Suivre et analyser l’activité des utilisateurs.  
- Générer des statistiques sur les publications, interactions et tendances.  
- Offrir une API pour accéder aux données d’analyse.  
- Permettre la visualisation et l’export des métriques.  

---

## ⚙️ Fonctionnalités  
- 📊 **Collecte de données** : enregistrement des événements (likes, connexions, inscriptions…).
- 📡 **API REST** : accès sécurisé aux métriques pour le front et les autres microservices.  
- ⏱ **Analyse en temps réel** : monitoring instantané des indicateurs clés et des autres microservices.  

---

## 🛠️ Stack technique  
- **Langage** : JavaScript  
- **Framework API** : Express.js 
- **Analyse** : Node.js + logs
- **Communication** : API REST  

---

## 🚀 Changelog  

### 1. Version 1 (v1.0.0)
- Mise en place de la collecte d’événements de base  
- Endpoints pour consultation des métriques globales  
- Stockage des données et agrégation journalière  
