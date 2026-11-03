# hardwareguru-frontend

Interfaz web de **HardwareGuru**: armador de PCs con validación de compatibilidad, simulación de rendimiento y consumo, historial de builds, alertas energéticas y un asistente de IA ("Guru").

> Proyecto universitario · Curso de Microservicios · Repo 6 de 7

## Tecnologías

- React
- React Router
- Jest + React Testing Library
- Docker + GitHub Actions

> Estructura base, login y ruteo reciclados del proyecto anterior (TomatoAPI).

## Funcionalidades

| Vista | Descripción |
|---|---|
| **Login / Registro** | Autenticación con JWT contra el API Gateway |
| **Dashboard** | Banner de alertas críticas al iniciar sesión (origen: servicio .NET) |
| **Armador de PC ("Taller")** | Selectores dependientes: CPU → Placa → RAM, más GPU y Fuente |
| **Resultados de simulación** | Consumo estimado, % de cuello de botella (1080p / 1440p) y estado (Balanceado / Riesgo / Incompatible) |
| **Mis Builds** | Historial, detalle y eliminación de builds guardadas |
| **Chat "Guru"** | Ventana flotante conectada al asistente de IA |

### Lógica de selectores dependientes

- Al elegir un CPU, la lista de placas madre se filtra por socket compatible (ej. AM5).
- Al elegir una placa, la lista de RAM se filtra por tipo de memoria (ej. DDR5).

## Comunicación con el backend

El frontend **solo habla con el API Gateway (BFF)**.

| Endpoint (BFF) | Uso |
|---|---|
| `POST /auth/login`, `POST /auth/register` | Autenticación |
| `GET /componentes` | Alimentar los selectores |
| `POST /simular` | Simular rendimiento |
| `POST /builds`, `GET /builds`, `DELETE /builds/{id}` | Gestión de builds |
| `GET /alerts`, `PATCH /alerts/{id}/read` | Alertas del usuario |
| `POST /chat` | Chat con la IA |

> Ajustar las rutas a las definitivas del `hardwareguru-api-gateway`.

## Variables de entorno

Crear un archivo `.env`:

```env
REACT_APP_API_URL=http://localhost:<PUERTO_BFF>
```

> Si usan Vite, el prefijo es `VITE_` en lugar de `REACT_APP_`.

## Cómo ejecutarlo

**Requisitos:** Node.js 18+ y el API Gateway levantado (o un mock).

```bash
npm install
npm start        # modo desarrollo
npm run build    # build de producción
```

Con Docker:

```bash
docker build -t hardwareguru-frontend .
docker run -p 3000:80 hardwareguru-frontend
```

## Tests

```bash
npm test -- --coverage
```

Meta: **≥ 60% de cobertura** (Jest + React Testing Library).

## Estructura sugerida

```
hardwareguru-frontend/
├── src/
│   ├── api/            # Cliente HTTP hacia el BFF
│   ├── auth/           # Login, registro, contexto de sesión
│   ├── components/     # Componentes reutilizables
│   ├── pages/
│   │   ├── Dashboard
│   │   ├── PCBuilder
│   │   ├── MyBuilds
│   │   └── Login
│   ├── features/
│   │   ├── simulation/ # Panel de resultados
│   │   ├── alerts/     # Banner / modal de alertas
│   │   └── chat/       # Chat con Guru
│   └── routes/
├── Dockerfile
└── .github/workflows/ci.yml
```

## Checklist de avance

- [ ] Reciclar estructura, login y ruteo de TomatoAPI
- [ ] Vista "Armador de PC" con selectores dependientes
- [ ] Panel de resultados de simulación
- [ ] Modal/banner de alertas al iniciar sesión
- [ ] Vista "Mis Builds"
- [ ] Chat interactivo con `/chat`
- [ ] Tests con 60% de cobertura
- [ ] Dockerfile
- [ ] CI/CD (GitHub Actions)

## Equipo

Responsable: Integrante 3
