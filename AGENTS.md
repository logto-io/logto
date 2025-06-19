# AGENTS – Guía de Refactorización a Next.js 15

## Propósito

Este repositorio contiene las aplicaciones front-end de **Logto**, un sistema de gestión de identidad y acceso (IAM) open-source para aplicaciones modernas y productos SaaS. En particular, aquí se encuentran: la aplicación de **Demo** para ejemplificar la integración de Logto, la aplicación **Experience** (interfaz de usuario final para inicio de sesión y registro), y la **Console** (consola de administración). El objetivo de este documento es servir de guía a un agente automatizado (Codex) en la refactorización de estas tres aplicaciones (actualmente construidas con Vite + React) hacia **Next.js 15** utilizando el App Router. Esta guía centraliza la información de arquitectura, estructura del proyecto, lineamientos de desarrollo y mejores prácticas necesarias para llevar a cabo la migración de forma consistente y eficaz.

## Arquitectura

* **Next.js 15 con App Router:** La nueva arquitectura utilizará Next.js 15 en modo **SSR** (Server-Side Rendering) con el App Router. El App Router de Next.js está basado en el sistema de ficheros para definir rutas y aprovecha las últimas funcionalidades de React como componentes de servidor y `Suspense`. Esto permitirá mejorar el SEO, el rendimiento y la escala de las aplicaciones migradas.
* **Diseño de Componentes (Atomic Design):** Se seguirá un enfoque de Atomic Design para organizar los componentes en niveles de abstracción (átomos, moléculas, organismos, plantillas y páginas). Esto promueve la reutilización y mantenibilidad del código.
* **Estado Global Desacoplado:** Para el manejo del estado global se utilizarán soluciones desacopladas de la UI, como **Zustand** o Context API de React, asegurando persistencia y consistencia del estado entre sesiones cuando sea necesario.
* **Accesibilidad y Movilidad:** La accesibilidad (atributos ARIA, manejo de foco, navegación por teclado) es prioritaria en todos los componentes y páginas. Asimismo, el diseño responsive y la compatibilidad móvil son fundamentales en la implementación.
* **Tipado Estricto y Pruebas:** Se usará **TypeScript** con tipado estricto en todo el proyecto. Cada componente o módulo significativo debe contar con pruebas, preferentemente utilizando React Testing Library (RTL) y un framework de pruebas como **Vitest** (manteniendo consistencia con el stack original). Las páginas y componentes críticos deben incluir tests end-to-end o de integración según aplique.

## Estructura del Repositorio

A continuación se presenta un árbol simplificado del repositorio, destacando las rutas y archivos más relevantes para la migración:

```plaintext
├── packages/
│   ├── **demo-app/**
│   │   ├── src/
│   │   │   ├── main.tsx              # Punto de entrada Vite (montaje de React DOM)
│   │   │   ├── App.tsx (ejemplo)     # Componente raíz con definiciones de rutas
│   │   │   ├── components/          # Componentes UI específicos de demo
│   │   │   └── pages/               # Páginas o vistas (si las hubiera, según estructura Vite)
│   │   ├── index.html               # Plantilla HTML para Vite (reemplazado por _document en Next)
│   │   ├── vite.config.ts           # Configuración Vite específica de demo-app
│   │   └── package.json
│   ├── **experience/**
│   │   ├── src/
│   │   │   ├── main.tsx              # Punto de entrada de la app Experience
│   │   │   ├── routes/              # Rutas de la experiencia de usuario (si usa React Router u otro)
│   │   │   └── components/         # Componentes UI de la experiencia
│   │   ├── index.html               # Plantilla HTML de la app Experience
│   │   ├── vite.config.ts           # Configuración Vite de Experience
│   │   └── package.json
│   ├── **console/**
│   │   ├── src/
│   │   │   ├── main.tsx              # Punto de entrada de la consola de administración
│   │   │   ├── routes/              # Definiciones de rutas de la consola (si aplica)
│   │   │   └── components/         # Componentes UI de la consola
│   │   ├── index.html               # Plantilla HTML de la app Console
│   │   ├── vite.config.ts           # Configuración Vite de Console
│   │   └── package.json
│   └── (otros paquetes/librerías)   # Otros paquetes del monorepo (SDKs, core, etc., si existen)
├── **vite.shared.config.ts**         # Configuración compartida de Vite para todas las apps (plugins, alias, etc.)
├── **tsup.shared.config.ts**         # Configuración compartida de bundler (tsup) si se comparten librerías
├── **.eslintrc.js**                  # Configuración de linting/formatting (aplicable a todo el monorepo)
├── **.env.example**                 # Ejemplo de variables de entorno necesarias (ej. URL de Logto, clientId, secretos)
├── **pnpm-workspace.yaml**           # Declaración de paquetes del workspace (monorepo con pnpm)
├── **.github/workflows/**            # Workflows de CI (ejecutan pruebas, lint, build en cada PR)
└── ... (otros archivos de configuración como Dockerfile, README principal, etc.)
```

**Notas sobre la estructura**: Las tres aplicaciones front-end se ubican en `packages/*` y actualmente funcionan de forma independiente mediante Vite. Cada una posee su propia entrada (`main.tsx`), configuración de Vite e incluso su propio `index.html`. Durante la migración, cada aplicación se convertirá en un proyecto Next.js 15 dentro del monorepo, manteniendo nombres equivalentes (**demo-app**, **experience**, **console**). Los archivos de configuración compartida (`vite.shared.config.ts`, `tsup.shared.config.ts`) sugieren que existen convenciones comunes (por ejemplo, alias de módulos o plugins) que deberán trasladarse a la configuración de Next.js. En particular, Next.js ofrece la opción `transpilePackages` para manejar la transpilación de paquetes locales en monorepos, lo cual será útil para incorporar código compartido o paquetes internos sin problemas de compatibilidad.

Asimismo, es importante revisar el contenido de **.env.example** para identificar variables de entorno críticas (como la URL del servidor de autenticación Logto, ID de cliente OAuth, secretos, etc.) que deberán configurarse en los entornos de desarrollo/producción de las nuevas aplicaciones Next (por ejemplo, usando archivos `.env.local` y la configuración correspondiente en `next.config.js` cuando aplique).

## Estructura de carpetas (Next.js App)

Cada aplicación migrada seguirá la estructura de directorios propia de Next.js con App Router, integrando el diseño atómico mencionado. Por ejemplo, una de las aplicaciones (p. ej. **Console**) podría organizarse así tras la migración:

```plaintext
src/
├── app/                        # Directorio del App Router (rutas basadas en filesystem)
│   ├── layout.tsx              # Layout raíz de la aplicación (incluye <head>, tema, etc.)
│   ├── page.tsx                # Página inicial (Dashboard u Home) de la aplicación
│   └── auth/                   # Ejemplo de sub-ruta (p.ej., login)
│       └── page.tsx            # Página de login (protegida o pública según configuración)
├── components/                 # Componentes reutilizables siguiendo Atomic Design
│   ├── atoms/                  # Componentes básicos (Botón, Input, etc.)
│   ├── molecules/              # Combinaciones simples de átomos
│   ├── organisms/              # Componentes más complejos (formularios, barras de navegación, etc.)
│   ├── templates/              # Plantillas de página (composiciones de organisms y components)
│   └── ui/                     # Componentes UI importados (por ejemplo, librería shadcn/ui)
├── context/                    # Contextos de React (ej.: contexto de usuario, tema)
│   ├── user-context.tsx
│   └── theme-context.tsx
├── hooks/                      # Hooks personalizados
│   ├── useAuth.ts              # Hook para autenticación con Logto (ejemplo)
│   ├── useProjectFilter.ts
│   └── useTaskStatus.ts
├── services/                   # Servicios externos o de backend
│   └── apollo.ts               # Configuración de cliente Apollo GraphQL (si aplica)
├── styles/                     # Estilos globales o CSS modules
│   └── globals.css
├── lib/                        # Utilidades varias
│   └── utils.ts
└── tests/                      # Pruebas unitarias y de integración
    ├── components/            # Pruebas para componentes individuales
    └── e2e/                   # Pruebas end-to-end (si se implementan)
```

**Detalles**: El directorio `src/app` define la jerarquía de rutas usando el App Router de Next.js. Por ejemplo, cada subcarpeta dentro de `app/` representa una ruta, donde `page.tsx` es la entrada de página y `layout.tsx` define la estructura común para esa sección. En Next.js 15, esta estructura facilita utilizar componentes de servidor y divisiones de código automáticas. Las carpetas de componentes (`atoms`, `molecules`, etc.) implementan Atomic Design para fomentar la consistencia visual y funcional en todo el proyecto. Los hooks y contextos se ubican fuera de `app/` para poder ser utilizados tanto en componentes de servidor como de cliente según corresponda.

**Stack de tecnologías integradas** en esta arquitectura incluye, entre otras: Next.js 15 (App Router) con TypeScript, Tailwind CSS para estilos utilitarios, componentes pre-diseñados como los de **shadcn/ui**, Apollo Client para comunicación GraphQL (si la aplicación lo utiliza), gestión de estado global con Zustand y/o Context API, pruebas con RTL + Vitest, animaciones con librerías como Framer Motion/GSAP, y capacidades en tiempo real o notificaciones (ej. Firebase Cloud Messaging, Socket.io) en caso de ser necesarias.

## Stack Tecnológico

* **Framework:** Next.js 15 (en modo App Router) – proporcionando SSR, división de código, y soporte a componentes de servidor.
* **Lenguaje:** TypeScript (strict mode) – tipado estático robusto para todos los módulos.
* **UI/Estilos:** TailwindCSS para diseño responsivo y utilidades, complementado con componentes de biblioteca *shadcn/ui* para controles avanzados y consistentes.
* **Autenticación:** Logto (OIDC/OAuth 2.1) – infraestructura de autenticación central del proyecto. Logto provee flujos de inicio de sesión pre-construidos, SSO empresarial y administración de identidades. Se integrará mediante su SDK para Next/React y llamadas a la API de Experience/Management según se requiera.
* **Estado Global:** Zustand y Context API – manejo del estado de la aplicación de forma desacoplada de la UI, con posibilidad de persistencia (por ejemplo, almacenamiento en `localStorage` para ciertos estados si aplica).
* **Datos & API:** Apollo Client con GraphQL (y generación de código si existe esquema) para interacción con backend GraphQL; fetch nativo o SDKs REST según los casos de uso. Incluye manejo eficiente de cache y actualizaciones en tiempo real si corresponde.
* **Testing:** Vitest + React Testing Library (unitarias y de integración de componentes). Posible uso de Playwright para pruebas end-to-end en flujos críticos. La elección de Vitest permite ejecutar pruebas rápidamente en un contexto similar a Jest pero optimizado para Vite/TS.
* **Animaciones:** Framer Motion y/o GSAP para animaciones fluidas e interactivas, mejorando la UX sin sacrificar rendimiento (manteniendo las animaciones fuera del hilo principal cuando sea posible).
* **Notificaciones en tiempo real:** Integraciones opcionales como Firebase Cloud Messaging o Socket.io-client para notificaciones push y actualizaciones en vivo, cuando el caso de uso lo demande.

## Reglas de Implementación

Para asegurar calidad y mantenibilidad, se deberán seguir estas directrices durante la refactorización:

* **Componentes:** Cada nuevo componente debe:

  * Estar correctamente **tipado** (TypeScript).
  * Incluir **pruebas unitarias** usando RTL u otra herramienta apropiada.
  * Ser **accesible**, manejando atributos `aria-*`, orden de tabulación, roles, y demás consideraciones de accesibilidad.
* **Separación de lógica:** No se permite implementar lógica de negocio directamente dentro de componentes de presentación (UI). La lógica debe residir en hooks, contextos o servicios externos, de forma que los componentes permanezcan lo más puros posible.
* **Ubicación del código:** Hooks y servicios **no** deben ubicarse dentro de componentes de página ni de layout, sino en sus respectivos directorios (`hooks/`, `services/`, etc.). Esto promueve la reutilización y prueba aislada de la lógica.
* **Animaciones:** Deben ser fluidas y no bloquear la interfaz. Utilizar requestAnimationFrame o técnicas optimizadas provistas por las librerías de animación. Evitar animaciones intrusivas que dificulten la experiencia del usuario.
* **Commits y formateo:** El código debe cumplir con las reglas de formato y lint definidas por el proyecto (prettier/eslint). Asimismo, los mensajes de commit deben seguir el formato convencional definido (ver configuración commitlint), por ejemplo usando prefijos como `feat:`, `fix:` etc., para que pasen las verificaciones automáticas de estilo de commit.

## Instrucciones para Codex y Agentes

El agente Codex encargado de la migración deberá considerar los siguientes pasos y buenas prácticas al realizar los cambios:

1. **Inicializar Next.js en cada paquete:** Por cada aplicación en `packages/demo-app`, `packages/experience` y `packages/console`, crear la estructura básica de Next.js 15. Esto implica generar el directorio `src/app` con sus subrutas, y migrar el contenido de `index.html`, `main.tsx` y demás entradas de Vite hacia los correspondientes `layout.tsx`, `page.tsx` y componentes Next. *Tip:* Puedes usar `create-next-app@latest` como referencia para la configuración base (incluyendo `tsconfig.json`, `next.config.js`, soportando TypeScript, ESLint, etc.).
2. **Migrar Rutas y Navegación:** Transformar las rutas definidas en React Router u otro mecanismo dentro de las apps Vite hacia el sistema de **App Router** de Next. Cada ruta debe convertirse en una carpeta dentro de `src/app` con un `page.tsx` (y `layout.tsx` si se requiere un layout específico). Mantener la estructura de URL existente en la medida de lo posible. Si alguna ruta privada necesita protección, implementar la lógica de checkeo de sesión ya sea en componentes de servidor (utilizando cookies/tokens vía Next Auth middleware) o mediante redirección en el cliente si corresponde.
3. **Reutilizar Componentes:** Extraer y reutilizar los componentes existentes de las aplicaciones Vite dentro de la nueva estructura Next. Si detectas duplicación entre las apps (por ej., componentes comunes de header, footer, form, etc.), considera crear un módulo común o paquete compartido dentro del monorepo para centralizarlos, en lugar de duplicarlos en cada aplicación. Esto reduce la divergencia y facilita el mantenimiento.
4. **Integración con Logto:** Asegurar que la autenticación con Logto sigue funcionando tras la migración. Esto puede implicar usar el SDK de Logto para Next.js/React en lugar de cualquier integración específica para Vite. Configura las **variables de entorno** necesarias (por ejemplo, `LOGTO_ENDPOINT`, `LOGTO_APP_ID`, `LOGTO_SECRET` en archivos `.env.local`) y verifica que los callbacks de OAuth/OIDC estén correctamente manejados en las rutas de Next (posiblemente mediante una route handler en `app/api/auth/callback` si se requiere). Consulta la documentación de Logto para Next.js si es necesario.
5. **Configurar alias y módulos compartidos:** Si el proyecto utiliza alias de importación (p. ej. `@/` para `src/` u otros paquetes internos), configurar lo equivalente en Next. Esto se puede lograr añadiendo las entradas apropiadas en el `tsconfig.json` (sección `paths`) y usando la opción `transpilePackages` en `next.config.js` para incluir los paquetes internos del monorepo. De esta forma, Next.js transpilará esos paquetes locales y evitará problemas de compatibilidad al importarlos.
6. **Eliminar configuración de Vite:** Remover o archivar archivos ya no necesarios como `vite.config.ts` en cada paquete y `vite.shared.config.ts`, asegurándose de trasladar cualquier configuración importante de estos (por ejemplo, variables de entorno, configuraciones de proxy, etc.) a los archivos correspondientes de Next (como `next.config.js` o la configuración de `Webpack`/Turbopack si es preciso). Verifica también `index.html` de cada app para llevar metaetiquetas, links a fuentes, u otros elementos `<head>` al nuevo `src/app/(root)/layout.tsx` de Next.
7. **Actualizar las pruebas:** Por cada componente o página migrada, actualizar (o recrear) sus pruebas unitarias. Las pruebas con Vitest/RTL deberían seguir funcionando para componentes aislados; sin embargo, para páginas Next con componentes de servidor es posible que se requieran adaptaciones o usar utilidades específicas de prueba de Next.js. Si alguna funcionalidad cambió durante la migración, escribir pruebas adicionales para cubrir la regresión. **Importante:** si se modifican páginas, asegurar actualizar también sus tests asociados, y que todos los tests (unitarios y e2e) pasen exitosamente.
8. **Verificar en entorno local:** Levantar cada aplicación Next.js localmente (`pnpm install` en la raíz y luego `pnpm run dev` en cada paquete, o configurar un workspace para correr todas). Probar manualmente los principales flujos: inicio de sesión, navegación entre páginas, uso de la consola, etc., garantizando que no hay errores en consola ni funcionalidad rota. Usar `print()` o `console.log` temporalmente para depurar y mostrar antes/después de comportamientos clave durante el desarrollo si es necesario (recordando eliminarlos antes de commit).
9. **Optimización y limpieza:** Asegurarse de que no queden referencias a paquetes o configuraciones obsoletas. Remover dependencias de Vite y relacionadas del `package.json` de cada aplicación si ya no se usan (por ejemplo, plugins de Vite, react-router si fue totalmente reemplazado por Next Link, etc.). Optimizar las importaciones y dividir en **cargas bajo demanda** utilizando la capacidad innata del App Router para code-splitting. Revisar que el **lint** (`pnpm run lint`) pase sin errores y aplicar formateo (`pnpm run format` o comando definido) antes de dar por finalizada la migración en cada paquete.
10. **Documentación y referencias:** No es necesario actualizar documentación de usuario final en esta tarea, pero sí mantener actualizado este archivo `AGENTS.md` con cualquier consideración adicional surgida durante la migración para futuros agentes o desarrolladores. En caso de dudas arquitectónicas, consultar las fuentes oficiales: la documentación de Next.js (App Router) para patrones recomendados, y la documentación de Logto para asegurar el correcto uso de sus servicios en esta nueva arquitectura.

Al completar estos pasos, el agente deberá crear un Pull Request que integre todos los cambios de la migración.

## No permitido

Para mantener la calidad del código y la coherencia del proyecto, **evitar a toda costa** lo siguiente:

* **Código sin tipado adecuado:** Cualquier nuevo módulo o componente *debe* ser TypeScript. No se aceptarán segmentos en JavaScript sin tipos, excepto configuraciones donde esté justificado.
* **Componentes sin pruebas o sin considerar accesibilidad:** No añadir/actualizar componentes importantes sin acompañarlos de pruebas automatizadas y verificación manual de criterios de accesibilidad.
* **Duplicación de lógica:** No crear hooks duplicados o múltiples funciones utilitarias que realicen lo mismo. Si se detecta lógica repetida en distintos lugares, factorizarla en un único hook/servicio reutilizable.
* **Efectos secundarios descontrolados:** Evitar hooks que realicen operaciones con efectos secundarios no obvios (como accesos directos al `localStorage`, manipulaciones DOM directas, etc.) sin encapsularlos adecuadamente o documentarlos. Cualquier efecto necesario debe ser explícito y controlado (por ejemplo, usando `useEffect` con dependencias bien definidas, o middleware en caso de Zustand).
* **Llamadas directas a APIs en componentes de presentación:** Si se necesita obtener datos en una página o componente, preferir el uso de **fetching** en métodos de Next.js (como `getServerSideProps` o equivalentes server actions) o en hooks de datos. Los componentes de presentación no deben ejecutar fetch/axios directamente durante render, ya que Next.js ofrece mejores patrones para ello (como React Server Components o uso de SWR para cliente).
* **Bypass de seguridad o buenas prácticas:** No deshabilitar reglas de ESLint/Prettier de forma injustificada. No exponer secretos en el código (usar siempre variables de entorno). No ignorar fallos de linting, tipos o pruebas; deben resolverse de raíz en la migración.

## Entregables mínimos por tarea

Al finalizar la migración de cada aplicación, se deben cumplir los siguientes criterios de entrega:

* **Funcionalidad completa:** La aplicación migrada debe replicar toda la funcionalidad existente antes de la migración (o mejorarla donde se haya acordado hacerlo). Esto incluye rutas navegables, lógica de negocio, integraciones con Logto, etc., funcionando sin errores.
* **Componentes y páginas correctamente implementados:** Todos los componentes deben ser funcionales, accesibles y con tipado robusto. Las páginas deben cargar los datos necesarios y mostrarlos correctamente, considerando estados de carga y error donde aplique.
* **Hooks documentados y reutilizables:** Cualquier hook creado o modificado debe incluir comentarios o documentación inline suficientes para entender su propósito. Debe ser genérico/reutilizable en lo posible, o ubicado en un contexto específico de ser necesario.
* **Calidad de código verificada:** El Pull Request debe estar estructurado (commits limpios, descripción clara), y pasar todas las validaciones:

  * Linting/Formatting sin errores (respetando configuración de `.eslintrc`).
  * Pruebas unitarias/integración con resultado exitoso (ejecutadas localmente y en CI).
  * Build de Next.js sin errores (`pnpm run build` para cada app, asegurando que no haya issues de compilación).
* **Integración continua exitosa:** Los *workflows* de GitHub Actions en `.github/workflows` deben ejecutarse con éxito, lo que típicamente incluye la instalación, el lint, las pruebas y la construcción. En otras palabras, el pipeline de CI/CD debe estar **en verde** para considerar la tarea como completa.

Siguiendo esta guía, el agente Codex tiene que refactorizar las aplicaciones Vite a Next.js 15 de forma controlada, manteniendo la fiabilidad del sistema de **Logto** y aprovechando las mejores prácticas de la industria en desarrollo front-end enterprise. Una vez migradas, las aplicaciones contarán con la base sólida de Next.js para futuras extensiones y unificará la experiencia de desarrollo bajo una arquitectura moderna y sostenible.

