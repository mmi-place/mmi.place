# mmi-place

Frontend statique Nuxt de `MMI Place`, genere en HTML/CSS/JS et connecte a Supabase via `@mmiplace/mmi-core`.

## Prerequis

- Node.js 20+
- npm
- Un projet Supabase avec son `project URL` et sa cle publique `anon`

## Configuration

1. Copier l'exemple d'environnement :

```bash
cp .env.example .env
```

2. Renseigner les variables publiques :

```env
NUXT_PUBLIC_SITE_NAME=MMI Place
NUXT_PUBLIC_SITE_DESCRIPTION=La plateforme communautaire pour les etudiants MMI.
NUXT_PUBLIC_SITE_URL=https://mmi.place
NUXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
```

### A quoi servent ces variables

- `NUXT_PUBLIC_SITE_NAME` : nom affiche dans l'application et dans le manifest PWA.
- `NUXT_PUBLIC_SITE_DESCRIPTION` : description HTML/PWA.
- `NUXT_PUBLIC_SITE_URL` : URL finale du site. Sert a generer la canonical, l'URL Open Graph et le chemin de base.
- `NUXT_PUBLIC_SUPABASE_URL` : URL de ton projet Supabase.
- `NUXT_PUBLIC_SUPABASE_ANON_KEY` : cle publique `anon` de Supabase.

Les anciennes variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` restent acceptees pour compatibilite, mais la config recommandee est `NUXT_PUBLIC_*`.

## Developpement

```bash
npm install
npm run dev
```

## Generation statique

```bash
npm run build
```

Le site genere est disponible dans `.output/public`.

Pour le previsualiser localement :

```bash
npm run preview
```

## Application native

Le projet peut aussi etre empaquete avec Capacitor pour Android. La configuration pointe vers le build statique de Nuxt (`.output/public`), donc le meme code source peut servir au web et au mobile.

Configuration supplementaire utile :

```env
CAPACITOR_APP_ID=place.mmi.app
CAPACITOR_DEV_SERVER_URL=http://192.168.1.10:3000
```

La premiere fois, ajoute la plateforme Android :

```bash
npm run cap:add:android
```

Ensuite, les commandes utiles sont :

```bash
npm run cap:sync:android
npm run cap:open:android
npm run cap:run:android
npm run cap:build:android
```

`cap:build:android` genere un APK de debug via Gradle dans le dossier Android ajoute par Capacitor. Si tu veux aussi un packaging desktop, il faudra ajouter une couche Electron au-dessus du meme `webDir` Capacitor.

Remarques additionnelles:

- Assure-toi d'avoir l'Android SDK installe (via Android Studio ou les outils en ligne de commande). Le script de build automatique tentera de detecter `ANDROID_SDK_ROOT`/`ANDROID_HOME` ou `C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk` et ecrira `android/local.properties` si necessaire.
- Si l'SDK n'est pas installe, installe Android Studio et configure le SDK, ou definis `ANDROID_SDK_ROOT` avant d'executer `npm run cap:build:android`.

Exemple minimal pour builder localement:

```bash
# build static web output
npm run build
# sync into Android project and build debug APK (the helper will set JAVA_HOME to Android Studio's JBR if present)
npm run cap:build:android
```

## Deploiement

Comme le projet est un site statique, il n'y a pas besoin de Docker.

Tu peux deployer le contenu de `.output/public` sur n'importe quel hebergeur statique :

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- un serveur Nginx/Apache classique

## CI

Le workflow GitHub Actions lance simplement :

```bash
npm ci
npm run build
```

Cela permet de verifier que la generation statique reste fonctionnelle sur `main`.
