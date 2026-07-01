# Migración desde el sitio actual (abciregistro.com)

Hay dos formas de extraer los ~10,000 ejemplares del registro WordPress
actual. **Usa el Método A** si ya tienes acceso al wp-admin (es más rápido,
más completo y más confiable). El Método B queda como respaldo para cuando
no había acceso al panel.

---

## Método A — Exportación nativa de WordPress (recomendado)

Con acceso al wp-admin, WordPress trae un exportador nativo (Herramientas →
Exportar) que genera un XML (formato WXR) con **todos los campos
personalizados** de cada ejemplar — sin adivinar nada desde el HTML como
hacía el scraper. Esto incluye datos que el scraper no podía ver: propietario,
DNI, celular, país, y hasta el pedigree extendido (abuelos).

### Paso 1 — Exportar desde wp-admin

Por cada tipo de contenido que tenga ejemplares (en este registro son dos:
**REGISTRO 2.0** = `abcidog` y **Prueba de BBDD antigua** = `registro-de-ejemplar`):

1. Ve a **Herramientas → Exportar**
2. Selecciona **"Tipo de contenido personalizado"** → elige el tipo
3. Haz clic en **Descargar archivo de exportación** → se descarga un `.xml`
4. Repite para el otro tipo de contenido

Vas a terminar con dos archivos `.xml` en tu carpeta de Descargas
(p. ej. `REGISTRO 2.0.xml` y `BBDD ANTIGUA.xml`).

### Paso 2 — Correr el parser

```bash
cd bullypedex-clone

# Pasando las rutas explícitamente
node scripts/parse-wxr-export.mjs "/ruta/a/REGISTRO 2.0.xml" "/ruta/a/BBDD ANTIGUA.xml"

# O sin argumentos: busca automáticamente todos los .xml en ~/Downloads
node scripts/parse-wxr-export.mjs
```

El script:
1. Lee cada XML y extrae únicamente los posts publicados (`publish` / `pending`)
   de los tipos `abcidog` y `registro-de-ejemplar` (ignora imágenes adjuntas, borradores y basura de prueba)
2. Detecta automáticamente los ~25 campos personalizados (`sexo`, `raza`,
   `color`, `microchip`, `criador`, `propietario`, `nombre-del-padre`, etc.)
3. **Deduplica** entre los dos archivos: si el mismo número de certificado
   existe en ambos (el ejemplar fue migrado de la BBDD antigua a REGISTRO 2.0),
   conserva la versión más nueva
4. Genera tres salidas en `scripts/wp-export/` (carpeta ignorada por git —
   contiene datos personales de propietarios)

### Salida

```
scripts/wp-export/
├── abci-import-listo-2026-06-28.xlsx       ← SUBE ESTE a /admin/import
├── abci-respaldo-completo-2026-06-28.xlsx  (todos los campos + pedigree extendido)
├── abci-respaldo-completo-2026-06-28.json  (respaldo crudo)
└── omitidos-2026-06-28.json                (registros que no se pudieron usar, con motivo)
```

El archivo `abci-import-listo-*.xlsx` ya trae los encabezados exactos que
reconoce el auto-mapeo de `/admin/import`, así que no hace falta mapear nada
a mano.

### Resultado de la corrida más reciente

| Archivo origen | Ejemplares válidos | Omitidos |
|---|---|---|
| REGISTRO 2.0.xml (`abcidog`) | 5,202 | 26 |
| BBDD ANTIGUA.xml (`registro-de-ejemplar`) | 4,787 | 8 |
| **Total combinado** | **9,989** | 34 |
| **Después de deduplicar** | **9,655 únicos** | — |

Calidad de los datos extraídos:
- 9,636 con número de certificado original
- 9,514 con microchip
- 9,639 con al menos un padre/madre registrado
- Solo 16 sin fecha de nacimiento (se reportan en el log de errores al importar)

---

## Método B — Scraping del sitio público (respaldo, sin acceso al wp-admin)

Si en algún momento se pierde el acceso al panel, `migrate-from-abci.mjs`
extrae lo mismo visitando las páginas públicas del sitio (sitemap + HTML),
sin necesidad de credenciales.

```bash
node scripts/migrate-from-abci.mjs --limit 50   # prueba
node scripts/migrate-from-abci.mjs              # completo
node scripts/migrate-from-abci.mjs --resume      # si se interrumpe
```

Es más lento (~25 min para 10K) y menos completo (no ve propietario, DNI,
celular ni pedigree extendido, porque esos campos no se muestran en la vista
pública). Úsalo solo si el Método A no está disponible.

---

## Importar al panel admin

1. Inicia sesión en `/admin/login` (admin@abciregistro.app / admin1234)
2. Ve a **Importar Excel** desde la barra lateral
3. Sube `abci-import-listo-YYYY-MM-DD.xlsx`
4. El sistema auto-mapea las columnas — revisa la vista previa
5. Haz clic en **Importar**

Para ~9,655 registros la importación toma menos de un minuto. Todos los
certificados quedan emitidos con su número original de ABCI.

## Privacidad y manejo de datos

- `scripts/wp-export/` y `scripts/abci-export/` están en `.gitignore` —
  **nunca se suben al repositorio** porque el respaldo completo incluye DNI
  y celular de propietarios.
- Conserva el `.json` de respaldo completo en un lugar seguro (no público)
  como evidencia del estado del registro al momento de la migración.
- El archivo `abci-import-listo-*.xlsx` (el que sí se sube al panel) **no**
  incluye DNI ni celular — solo los campos necesarios para el certificado.
