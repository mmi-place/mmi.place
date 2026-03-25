# Bienvenue sur MMI Place

Votre tableau de bord se fait un nouveau look, mais revient avec bien plus à vous donner ! Nouvelles fonctionnalités, nouvelle logique, même principe: Un outil développé par les étudiants, pour les étudiants.

## Un nouveau look d'enfer, plus accessible et ergonomique

Le site MMI Place a été complètement redessiné pour cette toute nouvelle version. Un travail a été fait sur la cohérence, l'ergonomie et l'accessibilité du site, proposant un tas de nouveaux réglages comme:

- Ajustement de la taille du texte
- Ajustement de la police pour les personnes
- Intégration d'un thème sombre
- Ajout d'un mode « haut contraste » pour faciliter la visibilité

## Des fonctionnalités avancées

MMI Place vient avec un lot de fonctionnalités toutes plus intelligentes que les autres, connectant tous les services proposés par les étudiants.

### Compte MMI Place

Il est désormais possible de vous connecter aux différents sites étudiants grâce à un compte MMI Place géré par le service Authentik. Le service fonctionne sur OAuth2, ce qui signifie que vous n'avez pas de mot de passe propre pour chaque site: un seul compte fonctionne sur tous les sites.

Pour utiliser votre compte MMI Place, allez sur la page de connexion de votre outil, où vous trouverez un bouton avec un texte semblable à "Se connecter avec Authentik", ou tapez directement l'URL `https://auth.mmi.codes`.

#### Inscription

1. Appuyez sur « S'enregistrer »
2. Entrez vos informations
   1. Entrez votre adresse mail UVSQ (les adresses non-affiliées seront refusées)
   2. Créez un mot de passe propre à votre compte MMI Place
3. Connectez-vous avec ces identifiants

#### Connection avec un fournisseur tiers

**Cette manoeuvre nécessite d'avoir un compte MMI Place existant.**

1. Sélectionnez le fournisseur que vous souhaitez relier,
   _Actuellement, les fournisseurs supportés sont Google, Github et Discord._
2. Suivez les instructions que ledit fournisseur vous fournit,
3. De retour sur le site d'Authentik, entrez les identifiants de votre compte MMI place,
4. Votre compte est maintenant relié.

### Widgets dynamiques

Des widgets sont disponibles en haut de la page d'accueil, résumant vos prochains cours, les tâches à effectuer, les annonces, etc. Ceux-ci sont paramétrables et désactivables via la [page des paramètres](https://mmi.codes/settings).

#### Prochain cours

_Widget basé sur Vencat_
Ce widget affiche le cours qui suit selon votre groupe TP. Si vous êtes en fin de journée, il affichera le premier cours du lendemain. La logique est la même pour les week-ends, jours fériés et vacances.

#### Dernier message non lu

Ce widget affiche le dernier message publié (tous canaux confondus). Vous pouvez marquer le message comme lu ou interagir avec.

#### Tâches à effectuer

_Widget basé sur PlanUP_
Ce widget affiche le nombre de tâches qu'il vous reste, avec une alerte si vous avez des rendus dans moins de cinq jours.

> Widget indisponible pour l'instant.

### Modification des infos par interface

Jusqu'à maintenant, vous deviez modifier des fichiers JSON pour mettre à jour les informations. Désormais, MMI Place vous offre la possibilité de le faire via une interface au lieu de tout taper à la main.

## Des technologies modernes et un code structuré

### Front-end et SSR

Le nouveau site a été conçu pour et avec un tech stack incluant [Nuxt](https://nuxtjs.org) et [TailwindCSS](https://docs.tailwindcss.com). TailwindCSS est désormais un pilier pour gérer votre CSS efficacement, avec une logique mobile-first permettant de rendre le site accessible sur petits écrans. Le framework Nuxt, lui, offre un SSR (Server-Side Rendering), c'est-à-dire que le fichier HTML est directement envoyé lors de la requête, alors qu'en Vue il est généré côté navigateur. Celà permet un référencement et une prévisualisation efficaces, car les crawlers en charge de les faire se basent sur le fichier renvoyé et n'exécutent pas de Javascript.

Un deuxième avantage de Nuxt est qu'il possède ses propres avantages tout en reprenant ceux de Vue (framework sur lequel il se base), dont sa logique de composants. Si on prend l'exemple d'un bouton, la logique de composants offerte par Vue permet de modifier tous les boutons __et leurs variantes__ en ne modifiant qu'un seul fichier, en l'occurence celui où est définie la structure et la logique du bouton.

### Routage "automatique"

Nuxt offre également un routage basé sur la structure du code source (contrairement à Vue où le routage doit être paramétré), suivant la philosophie WYSIWYG _(What You See Is What You Get)_.

### Back-end

Pour le backend, on a opté pour du serverless: l'API ne tourne pas sur un serveur à part, mais bien sur le même processus que le site, ce qui nous épargne de la maintenance et vous épargne de la latence. Les requêtes API <-> base de données sont faites via Prisma, un ORM compatible avec Typescript, permettant de récupérer des données sans écrire une seule requête SQL à la main. Pratique pour éviter les injections. La base de données est basée sur PostgreSQL.

Enfin, tout le site (front-end et back-end) est écrit en Typescript pour que les développeurs puissent mieux lire et maintenir le code.
