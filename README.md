# ABCI World Wide — Plataforma de Registro Canino

Plataforma completa de registro internacional canino construida con **Next.js 16 + TypeScript + Tailwind CSS v4**. Toda la interfaz está en español y adaptada al mercado latinoamericano.

## Funcionalidades incluidas

### Registro y certificación
- Página principal con hero, estadísticas y módulo de verificación
- Registro y login de criadores (auth con localStorage)
- Panel de criadero con resumen y métricas
- **Registro de ejemplar** (asistente de 3 pasos) → certificado ABCI instantáneo
- **Registro masivo de camada** — inscribe toda una camada de una vez
- **Traspasos de propiedad** con flujo por correo y auditoría
- **Verificación de certificados** pública sin necesidad de cuenta
- Vista pública del **certificado** con código QR e impresión
- **Búsqueda de ejemplares** por nombre, criadero, padre, madre, color
- **Directorio de criaderos** filtrable por país con perfil individual
- **Afijos** — registro y directorio público de afijos oficiales
- **Blog** con 6 artículos sobre genética, COI, traspasos, etc.
- **Código de conducta** ABCI
- **Planes de membresía** Gratuito / Pro / Elite con preguntas frecuentes

### Valor agregado (no estaba en el original)
- Análisis IA de raza — sube una foto, predice variante, genética y peso adulto
- Mercado verificado — cachorros, adultos, servicio de monta y equipo
- Calendario de eventos — exhibiciones, expos, encuentros en LATAM
- Bóveda de salud — vacunas, radiografías OFA, tests genéticos
- Árbol de pedigree de 4 generaciones con calculadora COI
- Modo oscuro/claro
- Certificados imprimibles con marca de agua
- Centro de ayuda buscable
- Formulario de contacto con enrutamiento por tema

## Cuenta demo

Para saltar el registro, haz clic en "Probar con cuenta demo" en la página de inicio de sesión, o usa:
- Correo: `demo@abciregistro.app`
- Contraseña: `demo1234`

La cuenta demo trae 6 ejemplares pre-registrados (FIGHTING BULL MILI, KHABIT, CARACHAMA, etc.), registros de salud, anuncios activos y membresía Elite.

## Certificados de ejemplo para verificar

- `29601` — FIGHTING BULL MILI
- `29602` — FIGHTING BULL THOR
- `28401` — FIGHTING BULL KHABIT
- `28950` — FIGHTING BULL CARACHAMA
- `27889` — BULLYCAMP MEDUZA
- `26551` — BULLYCAMP AZUMI

## Afijos de ejemplo

- `FIGHTING BULL` — Anthony Huamán, Perú
- `BULLYCAMP` — Rosa Castillo, México
- `TONNARD BULLIES` — Carlos Tonnard, Perú
- `BULLSCAPE` — Diego Romero, Argentina
- `ARIZONA BULLS` — Pedro Salazar, Chile

## Stack técnico

- Next.js 16 (App Router, Turbopack)
- TypeScript en modo estricto
- Tailwind CSS v4 con tokens de diseño personalizados
- localStorage como capa de datos (sin backend — despliegue instantáneo)

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Desplegar en Vercel

```bash
npx vercel --prod
```

O importa el repo directamente desde el [panel de Vercel](https://vercel.com/new).
