# Guía de Instalación y Ejecución - Sistema de Incidencias

Esta guía describe paso a paso cómo instalar las dependencias y ejecutar el proyecto.

## Requisitos Previos

Asegúrate de tener instalados los siguientes programas:
- [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
- Git

## 1. Configuración del Frontend (React + Vite)

El frontend se encuentra en la carpeta principal `sistemaIncidencias`.

### Paso 1: Instalar dependencias
Abre una terminal en la carpeta raíz del proyecto y ejecuta:

```bash
npm install
```

Este comando descargará e instalará todas las librerías necesarias listadas en `package.json` (React, Tailwind, Framer Motion, etc.).

### Paso 2: Ejecutar el servidor de desarrollo
Para iniciar la aplicación, ejecuta:

```bash
npm run dev
```

La aplicación estará disponible usualmente en [http://localhost:5173](http://localhost:5173).

## 2. Configuración del Backend

**Nota Importante:** El código del backend (servidor Go) se encuentra en otro repositorio, el cual es necesario instalar

El frontend está configurado para comunicarse con el backend en el puerto **8000** (ver `vite.config.js`).

### Pasos para el Backend:
1.  Navega a la carpeta donde tengas el código del servidor (Go).
2.  Asegúrate de tener [Go](https://go.dev/) instalado.
3.  Ejecuta el servidor:
    ```bash
    go run .
    ```
4.  Verifica que el backend esté corriendo en `http://localhost:8000`.

## Solución de Problemas

- **Error de conexión (API):** Si la aplicación carga pero no muestra datos, verifica que el backend esté corriendo en el puerto 8000.
- **Error en `npm install`:** Borra la carpeta `node_modules` y el archivo `package-lock.json`, e intenta ejecutar `npm install` nuevamente.
