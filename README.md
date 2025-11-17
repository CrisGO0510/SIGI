# SIGI – Sistema de Gestión de Incapacidades

SIGI es una plataforma web diseñada para optimizar el registro, administración y seguimiento de incapacidades médicas dentro de una organización.  
El proyecto tiene como propósito centralizar la información, reducir reprocesos, mejorar la trazabilidad y brindar herramientas de análisis para el área de Talento Humano.

El sistema incluye funcionalidades como:
- Registro de incapacidades y documentos de soporte.
- Validación y control de estados del trámite.
- Portal del colaborador.
- Generación de reportes.
- Estadísticas y visualizaciones.
- Notificaciones automáticas.

---

## 🧩 Arquitectura del Proyecto

El repositorio está dividido en dos partes principales:

### **📌 /api – Backend**
Implementado con **NestJS**, siguiendo una arquitectura modular y orientada al dominio.  
Aquí se gestionan todas las operaciones del servidor, lógica de negocio, base de datos, validaciones, reportes y notificaciones.

➡️ **Ver documentación del backend:**  
`/api/README.md`  
`/api/docs/architecture-backend.md`

---

### **📌 /app – Frontend**
Construido con **Angular (standalone, Angular 20)** usando componentes independientes, lazy loading y buenas prácticas de diseño.  
Esta capa se encarga de la interfaz de usuario, flujos de navegación, carga de documentos y visualización de datos.

➡️ **Ver documentación del frontend:**  
`/app/README.md`

---

## 🛠️ Tecnologías utilizadas (visión general)

Sin entrar en detalle, el sistema se sustenta en:

- **Angular 20** – Interfaz web moderna.
- **NestJS** – API escalable y modular.
- **TypeScript** – Lenguaje principal del proyecto.
- **Node.js** – Entorno de ejecución.
- **Base de datos SQL** – Para el almacenamiento estructurado (PostgreSQL recomendado).
- **Herramientas de compilación y linting** para garantizar calidad del código.

---

## 📜 Licencia

Este proyecto se distribuye bajo la licencia incluida en este repositorio.  
Consulta el archivo:  
`LICENSE`
