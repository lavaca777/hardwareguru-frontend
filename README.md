# hardwareguru-frontend

Interfaz web de **HardwareGuru**: armador de PCs con validación de compatibilidad, simulación de rendimiento y consumo, catálogo de componentes, historial de builds, alertas energéticas, un asistente de IA ("Guru") y gestión de cuenta.

> Proyecto universitario · Curso de Microservicios · Repo 6 de 7

## Tecnologías

- React 19 + Vite 8
- TypeScript (modo `strict`)
- React Router 7
- Tailwind CSS 4
- Vitest + React Testing Library
- Docker + GitHub Actions

> La base de ruteo y login se inspira en el proyecto anterior (TomatoAPI), adaptada a Vite + TypeScript. TomatoAPI usaba CRA/JavaScript, así que se reutiliza el flujo, no la configuración de build.

## Funcionalidades

| Vista | Descripción |
|---|---|
| **Login / Registro** | Autenticación con JWT contra el API Gateway |
| **Dashboard** | Alertas pendientes, estadísticas de builds, builds recientes y accesos rápidos |
| **Armador de PC ("Taller")** | Selectores dependientes: CPU → Placa → RAM, más GPU y Fuente |
| **Catálogo de componentes** | Tipos, buscador, filtros, orden y detalle con especificaciones y benchmarks |
| **Resultados de simulación** | Consumo estimado, % de cuello de botella (1080p / 1440p), estado y explicación de problemas |
| **Mis Builds** | Historial, detalle, abrir en el armador y eliminación |
| **Alertas** | Alertas de builds guardadas, pendientes/leídas, contador en la navegación y marcado como leída |
| **Chat "Guru"** | Chat conectado al asistente de IA |
| **Mi cuenta** | Perfil, resumen de actividad, cierre de sesión y seguridad (condicional) |

### Lógica de selectores dependientes

- Al elegir un CPU, la lista de placas madre se filtra por socket compatible (ej. AM5).
- Al elegir una placa, la lista de RAM se filtra por tipo de memoria (ej. DDR5).
- Las piezas incompatibles no se muestran; al cambiar una pieza base se conservan las selecciones válidas y se reinician las demás con un aviso.

## Rutas

`/login`, `/register`, `/` (dashboard), `/builder`, `/components`, `/builds`, `/alerts`, `/account` y `*` (404).

## Comunicación con el backend

El frontend **solo habla con el API Gateway (BFF)**. El contrato se coordina con el gateway y se mantiene en el SDD local del frontend (no versionado).

| Endpoint (BFF) | Uso |
|---|---|
| `POST /auth/login`, `POST /auth/register` | Autenticación |
| `PATCH /auth/password`, `DELETE /auth/account` | Seguridad de la cuenta (condicionales) |
| `GET /componentes`, `GET /componentes/:id` | Catálogo y detalle de piezas |
| `POST /simular` | Simular rendimiento |
| `POST /builds`, `GET /builds`, `DELETE /builds/:id` | Gestión de builds |
| `GET /alerts`, `PATCH /alerts/:id/read` | Alertas del usuario |
| `POST /chat` | Chat con la IA |

> Ajustar las rutas a las definitivas del `hardwareguru-api-gateway`.

## Estado y datos

- **Context + hooks**: auth, catálogo, armador, builds, alertas y chat. No se usa una librería de estado global.
- **`localStorage`**: solo la sesión, bajo la clave `hg_session` (token + datos básicos del usuario). El riesgo de XSS está documentado en el SDD local de auth.
- **Mocks**: mientras el gateway no esté listo, `VITE_USE_MOCKS=true` sirve datos de `src/api/mocks/`.

## Novedades para el equipo

### Autenticación (003)

- Las rutas privadas ahora exigen sesión; sin sesión redirigen a `/login`.
- La sesión se guarda en `localStorage` bajo `hg_session`. Un `401` la limpia y muestra “Tu sesión expiró”.
- Después del login se vuelve a la ruta protegida que se intentaba abrir.
- El cierre de sesión está disponible en **Mi cuenta**.
- En modo mock:
  - cualquier correo válido + contraseña de 8 o más caracteres inicia sesión;
  - `error@test.com` simula credenciales inválidas;
  - `exists@test.com` simula un correo ya registrado al registrarse.

### Catálogo (004)

- `/components` consume `GET /componentes` y `GET /componentes/:id`.
- `ComponentesProvider` carga el catálogo una sola vez por sesión y cachea los detalles.
- La búsqueda ignora mayúsculas y acentos.
- Filtros por tipo:
  - CPU y placas: socket y fabricante;
  - placas y RAM: tipo de RAM;
  - fuentes: rango de potencia.
- Incluye orden por nombre, TDP o potencia, estados de carga/vacío/error y detalle con especificaciones y benchmarks.
- Los mocks ya cubren ambos endpoints si el gateway todavía no está listo.

### Armador (005)

- `/builder` usa el catálogo compartido; no hay listas de compatibilidad hardcodeadas.
- La selección y la resolución viven en `BuilderContext` y sobreviven a la navegación entre rutas privadas.
- Placa y RAM se habilitan en cadena: CPU → placa → RAM.
- Al cambiar una pieza base se conservan las selecciones compatibles; las incompatibles se limpian con un aviso.
- `?from=<buildId>` precarga una build guardada desde `GET /builds`. Si no existe o le faltan piezas, se avisa.
- La simulación y el guardado se conectan en la feature 006.

### Simulación y guardado (006)

- El botón **Simular rendimiento** permanece deshabilitado hasta completar las 5 piezas.
- `POST /simular` devuelve consumo, cuello de botella, estado y `motivo`.
- El panel muestra consumo, cuello de botella, uso de la fuente y estado (`Balanceado`, `En riesgo`, `Incompatible`).
- Cambiar una pieza o la resolución marca el resultado como **desactualizado** y bloquea el guardado hasta volver a simular.
- `POST /builds` guarda la build con nombre, piezas y resolución.
- El modal de guardado valida nombre obligatorio y máximo de 60 caracteres, avisa si el nombre se repite y permite continuar.
- Al guardar aparece un aviso con enlace directo a **Mis builds**.
- Los estados `RIESGO` e `INCOMPATIBLE` muestran su `motivo` y sugerencia cuando aplica.

### Mis builds (007)

- `/builds` lista las builds guardadas con estado, consumo, cuello de botella, CPU y GPU.
- Incluye búsqueda por nombre, filtro por estado y orden por recientes, consumo o cuello.
- El detalle muestra las 5 piezas, resolución, uso de la fuente y el `motivo` cuando no está balanceada.
- **Abrir en el armador** navega a `/builder?from=<buildId>`.
- **Eliminar** pide confirmación, actualiza la lista y muestra un aviso.
- Deep link: `/builds?open=<buildId>` abre directamente el detalle.
- `BuildsProvider` comparte la lista con Dashboard y Alertas. Al guardar una build se dispara un evento para refrescarla.

### Alertas (008)

- `/alerts` muestra las alertas pendientes y leídas en pestañas con contador.
- Cada alerta incluye build, mensaje, sugerencia, porcentaje de uso de la fuente y fecha.
- **Ver build** abre `/builds?open=<buildId>`. Si la build fue eliminada, se reemplaza por “Esta build ya no existe”.
- **Marcar como leída** ejecuta `PATCH /alerts/:id/read`, mueve la alerta a “Leídas” y baja el contador. Si falla, la alerta sigue pendiente y se muestra un aviso.
- El contador de la navegación usa `AlertsProvider`, compartido con la página y el Dashboard.
- Las alertas se consultan al entrar, al volver a la pestaña y cada 60 s mientras la pestaña está visible.
- El polling y los listeners se limpian al desmontar el provider y al cerrar sesión.
- Si el servicio de alertas falla, el resto de la app sigue funcionando; la página muestra el error con reintento.
- `AlertCard` y `useAlerts` quedan disponibles para el Dashboard (009).

### Dashboard (009)

- `/` saluda con la parte local del correo y ofrece **Armar nuevo PC** y **Preguntar a Guru**.
- **Preguntar a Guru** emite el evento `hardwareguru:open-chat`; la ventana del chat se monta en 010.
- Muestra un resumen de alertas pendientes con enlace a `/alerts`; si no hay alertas, la sección no aparece.
- El resumen incluye builds guardadas, consumo promedio y cuello de botella promedio.
- **Estado de tus builds** distribuye balanceadas, en riesgo e incompatibles.
- **Consumo por build** compara consumo contra la fuente, con referencia visual al 85% y hasta 6 builds recientes.
- **Tu mejor build** elige la de menor cuello entre las balanceadas y desempata por menor consumo.
- **Pieza favorita** cuenta CPUs y GPUs repetidas; si no hay repeticiones, muestra el mensaje alterno.
- **Builds recientes** lista las 4 últimas con enlace a `Mis builds`.
- **Consejo de Guru** sale del banco `GURU_TIPS` de `config.ts` y evita repetir el inmediatamente anterior.
- Sin builds se muestra la bienvenida **Arma tu primer PC** y se ocultan las secciones de estadísticas.
- Los cálculos viven en `calcularEstadisticas` (`features/dashboard/stats.ts`); no se añadieron librerías de gráficos.

> El SDD (`spec/`) y `AGENT.md` son locales del frontend y están ignorados por git.

## Variables de entorno

Crear un archivo `.env` a partir de `.env.example`:

```env
VITE_API_URL=http://localhost:<PUERTO_BFF>
VITE_USE_MOCKS=true
VITE_MOCK_DELAY_MS=400
```

- `VITE_USE_MOCKS=true` usa `src/api/mocks/` en lugar del gateway real.
- `VITE_MOCK_DELAY_MS` simula latencia para poder ver los estados de carga.
- Vite solo expone al navegador las variables con prefijo `VITE_`. **Nunca** pongas secretos aquí.
- No hardcodear URLs: siempre leer `import.meta.env.VITE_API_URL`.

## Cómo ejecutarlo

**Requisitos:** Node.js 20.19+ (recomendado 22 LTS) y el API Gateway levantado (o los mocks activos).

```bash
npm install
npm run dev        # modo desarrollo en http://localhost:5173
npm run build      # type-check + build de producción en dist/
npm run preview    # sirve el build en http://localhost:4173
npm run lint       # ESLint
```

Con Docker:

```bash
docker build -t hardwareguru-frontend .
docker run -p 8080:80 hardwareguru-frontend
```

## Tests

```bash
npm test               # modo watch
npm run test:coverage  # una pasada + reporte de cobertura
```

Meta: **≥ 60% de cobertura** (Vitest + React Testing Library sobre jsdom).

Estado actual: **250 tests** y **> 90% de cobertura** de líneas.

## Estructura

```
hardwareguru-frontend/
├── src/
│   ├── api/            # client.ts, index.ts (mock/real) y mocks tipados
│   ├── auth/           # session.ts, contexto y hook de sesión
│   ├── components/     # compartidos y ui/ (componentes base)
│   ├── features/       # builder, simulation, builds, alerts, chat, components, dashboard
│   ├── pages/          # Dashboard, PCBuilder, MyBuilds, Login...
│   ├── routes/         # Rutas y ProtectedRoute
│   ├── types/          # Tipos de dominio compartidos
│   ├── styles/         # index.css (entrada de Tailwind)
│   ├── config.ts       # Constantes y banderas FEATURES
│   └── main.tsx
├── spec/               # SDD local (ignorado por git)
├── Dockerfile
├── vite.config.ts
└── .github/workflows/ci.yml
```

## Checklist de avance

- [x] **001** Vite + React + TS, Tailwind, ruteo, cliente HTTP, config y mocks
- [x] **002** Estructura común, navegación y componentes compartidos
- [x] **003** Login, registro, sesión y rutas protegidas
- [x] **004** Catálogo de componentes con búsqueda, filtros y detalle
- [x] **005** Armador con selectores dependientes
- [x] **006** Simulación, explicación de problemas y guardado
- [x] **007** Mis builds: historial, detalle, abrir en armador y eliminar
- [x] **008** Alertas: página, contador y listado
- [x] **009** Dashboard con estadísticas y accesos rápidos
- [ ] **010** Chat Guru
- [ ] **011** Mi cuenta y seguridad
- [ ] Tests con 60% de cobertura
- [ ] Dockerfile
- [ ] CI/CD (GitHub Actions)

## Equipo

Responsable: Integrante 3
