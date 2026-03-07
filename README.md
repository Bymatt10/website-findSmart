# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Jenkins Pipeline Deployment

El proyecto incluye un `Jenkinsfile` configurado para automatizar el despliegue con Docker y gestionar de forma segura las variables de entorno.

**Requisitos Previos en Jenkins:**
1. Instalar el plugin de [Credentials Binding](https://plugins.jenkins.io/credentials-binding/).
2. Crear una credencial de tipo **"Secret file"** con el ID `findsmart-env` y subir el archivo `.env` de producción.
3. Asegurarse de tener Docker instalado y que el usuario de Jenkins tenga permisos para ejecutarlo (`usermod -aG docker jenkins`).

El pipeline automatizará los siguientes pasos:
- Obtendrá el código fuente.
- Inyectará de forma segura el archivo `.env` para la compilación y ejecución.
- Construirá la imagen de Docker.
- Desplegará la aplicación en el puerto **8000**.

### Docker Compose Deployment

To build and run the application along with Redis using Docker Compose manually:

```bash
# Run the application and Redis together (Make sure you have your .env file ready)
docker compose up -d --build
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
