export type TipoComponente = 'cpu' | 'placa' | 'ram' | 'gpu' | 'fuente'

export type EstadoSimulacion = 'BALANCEADO' | 'RIESGO' | 'INCOMPATIBLE'

export type Resolucion = '1080p' | '1440p'

export interface Componente {
  id: string
  tipo: TipoComponente
  nombre: string
  fabricante: string
  tdp?: number
  socket?: string
  tipoRam?: 'DDR4' | 'DDR5'
  potenciaW?: number
  origen: 'seed' | 'usuario'
}

export interface ComponenteDetalle extends Componente {
  especificaciones: Record<string, string | number>
  benchmarks?: Record<string, number>
}

export interface BuildSeleccion {
  cpuId: string | null
  placaId: string | null
  ramId: string | null
  gpuId: string | null
  fuenteId: string | null
}

export interface SimulacionResultado {
  consumoEstimadoW: number
  cuelloBotellaPct: number
  resolucion: Resolucion
  estado: EstadoSimulacion
  motivo: string | null
}

export interface PiezaResumen {
  id: string
  nombre: string
  tdp?: number
  potenciaW?: number
}

export interface Build {
  id: string
  nombre: string
  creadaEn: string
  resolucion: Resolucion
  piezas: Record<TipoComponente, PiezaResumen>
  resultado: SimulacionResultado
}

export interface Alerta {
  id: string
  buildId: string
  buildName: string
  porcentajeUso: number
  mensaje: string
  sugerencia: string
  leida: boolean
  creadaEn: string
}

export type RolMensaje = 'usuario' | 'guru' | 'sistema'

export interface Mensaje {
  id: string
  rol: RolMensaje
  texto: string
  enviadoEn: string
}

export interface User {
  id: string
  email: string
  creadoEn?: string
}

export interface Session {
  token: string
  user: User
}

export interface ApiErrorShape {
  status: number
  code: string
  message: string
}

export interface ChatResponse {
  respuesta: string
}
