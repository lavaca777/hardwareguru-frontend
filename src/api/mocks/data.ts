import type {
  Alerta,
  Build,
  BuildSeleccion,
  Componente,
  PiezaResumen,
  TipoComponente,
} from '@/types'

const cpus: Componente[] = [
  {
    id: 'cpu-9600x',
    tipo: 'cpu',
    nombre: 'Ryzen 5 9600X',
    fabricante: 'AMD',
    tdp: 65,
    socket: 'AM5',
    origen: 'seed',
  },
  {
    id: 'cpu-9700x',
    tipo: 'cpu',
    nombre: 'Ryzen 7 9700X',
    fabricante: 'AMD',
    tdp: 65,
    socket: 'AM5',
    origen: 'seed',
  },
  {
    id: 'cpu-9950x',
    tipo: 'cpu',
    nombre: 'Ryzen 9 9950X',
    fabricante: 'AMD',
    tdp: 170,
    socket: 'AM5',
    origen: 'seed',
  },
  {
    id: 'cpu-14600k',
    tipo: 'cpu',
    nombre: 'Core i5-14600K',
    fabricante: 'Intel',
    tdp: 125,
    socket: 'LGA1700',
    origen: 'seed',
  },
  {
    id: 'cpu-14700k',
    tipo: 'cpu',
    nombre: 'Core i7-14700K',
    fabricante: 'Intel',
    tdp: 125,
    socket: 'LGA1700',
    origen: 'seed',
  },
  {
    id: 'cpu-14900k',
    tipo: 'cpu',
    nombre: 'Core i9-14900K',
    fabricante: 'Intel',
    tdp: 253,
    socket: 'LGA1700',
    origen: 'seed',
  },
]

const placas: Componente[] = [
  {
    id: 'mb-b650',
    tipo: 'placa',
    nombre: 'B650 Gaming',
    fabricante: 'ASUS',
    socket: 'AM5',
    tipoRam: 'DDR5',
    origen: 'seed',
  },
  {
    id: 'mb-x670e',
    tipo: 'placa',
    nombre: 'X670E Creator',
    fabricante: 'MSI',
    socket: 'AM5',
    tipoRam: 'DDR5',
    origen: 'seed',
  },
  {
    id: 'mb-b840',
    tipo: 'placa',
    nombre: 'B840M',
    fabricante: 'ASRock',
    socket: 'AM5',
    tipoRam: 'DDR5',
    origen: 'seed',
  },
  {
    id: 'mb-b760',
    tipo: 'placa',
    nombre: 'B760M',
    fabricante: 'Gigabyte',
    socket: 'LGA1700',
    tipoRam: 'DDR5',
    origen: 'seed',
  },
  {
    id: 'mb-z790',
    tipo: 'placa',
    nombre: 'Z790 Aorus',
    fabricante: 'Gigabyte',
    socket: 'LGA1700',
    tipoRam: 'DDR5',
    origen: 'seed',
  },
  {
    id: 'mb-b660',
    tipo: 'placa',
    nombre: 'B660M',
    fabricante: 'ASUS',
    socket: 'LGA1700',
    tipoRam: 'DDR4',
    origen: 'seed',
  },
]

const rams: Componente[] = [
  {
    id: 'ram-ddr5-16',
    tipo: 'ram',
    nombre: 'DDR5 16 GB 5600',
    fabricante: 'Kingston',
    tipoRam: 'DDR5',
    origen: 'seed',
  },
  {
    id: 'ram-ddr5-32',
    tipo: 'ram',
    nombre: 'DDR5 32 GB 6000',
    fabricante: 'Corsair',
    tipoRam: 'DDR5',
    origen: 'seed',
  },
  {
    id: 'ram-ddr5-64',
    tipo: 'ram',
    nombre: 'DDR5 64 GB 6000',
    fabricante: 'G.Skill',
    tipoRam: 'DDR5',
    origen: 'seed',
  },
  {
    id: 'ram-ddr4-16',
    tipo: 'ram',
    nombre: 'DDR4 16 GB 3200',
    fabricante: 'Kingston',
    tipoRam: 'DDR4',
    origen: 'seed',
  },
  {
    id: 'ram-ddr4-32',
    tipo: 'ram',
    nombre: 'DDR4 32 GB 3200',
    fabricante: 'Corsair',
    tipoRam: 'DDR4',
    origen: 'seed',
  },
  {
    id: 'ram-ddr4-64',
    tipo: 'ram',
    nombre: 'DDR4 64 GB 3600',
    fabricante: 'G.Skill',
    tipoRam: 'DDR4',
    origen: 'seed',
  },
]

const gpus: Componente[] = [
  {
    id: 'gpu-4060',
    tipo: 'gpu',
    nombre: 'RTX 4060',
    fabricante: 'NVIDIA',
    tdp: 115,
    origen: 'seed',
  },
  {
    id: 'gpu-5060ti',
    tipo: 'gpu',
    nombre: 'RTX 5060 Ti',
    fabricante: 'NVIDIA',
    tdp: 180,
    origen: 'seed',
  },
  {
    id: 'gpu-5070',
    tipo: 'gpu',
    nombre: 'RTX 5070',
    fabricante: 'NVIDIA',
    tdp: 250,
    origen: 'seed',
  },
  {
    id: 'gpu-7800xt',
    tipo: 'gpu',
    nombre: 'RX 7800 XT',
    fabricante: 'AMD',
    tdp: 263,
    origen: 'seed',
  },
  {
    id: 'gpu-9070',
    tipo: 'gpu',
    nombre: 'RX 9070',
    fabricante: 'AMD',
    tdp: 220,
    origen: 'seed',
  },
]

const fuentes: Componente[] = [
  {
    id: 'psu-450',
    tipo: 'fuente',
    nombre: '450 W 80+ Bronze',
    fabricante: 'EVGA',
    potenciaW: 450,
    origen: 'seed',
  },
  {
    id: 'psu-500',
    tipo: 'fuente',
    nombre: '500 W 80+ Bronze',
    fabricante: 'EVGA',
    potenciaW: 500,
    origen: 'seed',
  },
  {
    id: 'psu-650',
    tipo: 'fuente',
    nombre: '650 W 80+ Gold',
    fabricante: 'Corsair',
    potenciaW: 650,
    origen: 'seed',
  },
  {
    id: 'psu-750',
    tipo: 'fuente',
    nombre: '750 W 80+ Gold',
    fabricante: 'Corsair',
    potenciaW: 750,
    origen: 'seed',
  },
  {
    id: 'psu-850',
    tipo: 'fuente',
    nombre: '850 W 80+ Platinum',
    fabricante: 'Seasonic',
    potenciaW: 850,
    origen: 'seed',
  },
]

export const seedComponentes: Componente[] = [
  ...cpus,
  ...placas,
  ...rams,
  ...gpus,
  ...fuentes,
]

function pieza(id: string | null): PiezaResumen {
  if (!id) throw new Error('No se puede construir una pieza sin id')

  const componente = seedComponentes.find((item) => item.id === id)
  if (!componente) throw new Error(`Componente de seed no encontrado: ${id}`)

  return {
    id: componente.id,
    nombre: componente.nombre,
    ...(componente.tdp === undefined ? {} : { tdp: componente.tdp }),
    ...(componente.potenciaW === undefined
      ? {}
      : { potenciaW: componente.potenciaW }),
  }
}

export function piezasDe(
  seleccion: BuildSeleccion,
): Record<TipoComponente, PiezaResumen> {
  return {
    cpu: pieza(seleccion.cpuId),
    placa: pieza(seleccion.placaId),
    ram: pieza(seleccion.ramId),
    gpu: pieza(seleccion.gpuId),
    fuente: pieza(seleccion.fuenteId),
  }
}

export const seedBuilds: Build[] = [
  {
    id: 'b1',
    nombre: 'PC Gamer 1080p',
    creadaEn: '2026-11-01T18:30:00Z',
    resolucion: '1080p',
    piezas: piezasDe({
      cpuId: 'cpu-9600x',
      placaId: 'mb-b650',
      ramId: 'ram-ddr5-32',
      gpuId: 'gpu-4060',
      fuenteId: 'psu-650',
    }),
    resultado: {
      consumoEstimadoW: 216,
      cuelloBotellaPct: 12,
      resolucion: '1080p',
      estado: 'BALANCEADO',
      motivo: null,
    },
  },
  {
    id: 'b2',
    nombre: 'PC Gamer 1440p',
    creadaEn: '2026-11-02T12:15:00Z',
    resolucion: '1440p',
    piezas: piezasDe({
      cpuId: 'cpu-9950x',
      placaId: 'mb-b650',
      ramId: 'ram-ddr5-32',
      gpuId: 'gpu-5070',
      fuenteId: 'psu-500',
    }),
    resultado: {
      consumoEstimadoW: 504,
      cuelloBotellaPct: 14,
      resolucion: '1440p',
      estado: 'RIESGO',
      motivo:
        'La fuente de 500 W quedaría al 101% de su capacidad en picos de carga.',
    },
  },
  {
    id: 'b3',
    nombre: 'Build incompatible',
    creadaEn: '2026-11-03T09:45:00Z',
    resolucion: '1080p',
    piezas: piezasDe({
      cpuId: 'cpu-14600k',
      placaId: 'mb-b650',
      ramId: 'ram-ddr5-32',
      gpuId: 'gpu-4060',
      fuenteId: 'psu-500',
    }),
    resultado: {
      consumoEstimadoW: 288,
      cuelloBotellaPct: 0,
      resolucion: '1080p',
      estado: 'INCOMPATIBLE',
      motivo: 'El socket del procesador no coincide con la placa.',
    },
  },
  {
    id: 'b4',
    nombre: 'Oficina silenciosa',
    creadaEn: '2026-11-04T16:20:00Z',
    resolucion: '1080p',
    piezas: piezasDe({
      cpuId: 'cpu-9600x',
      placaId: 'mb-b840',
      ramId: 'ram-ddr5-16',
      gpuId: 'gpu-4060',
      fuenteId: 'psu-450',
    }),
    resultado: {
      consumoEstimadoW: 216,
      cuelloBotellaPct: 6,
      resolucion: '1080p',
      estado: 'BALANCEADO',
      motivo: null,
    },
  },
]

export const seedAlerts: Alerta[] = [
  {
    id: 'a1',
    buildId: 'b2',
    buildName: 'PC Gamer 1440p',
    porcentajeUso: 101,
    mensaje:
      'Tu fuente de 500 W no soportará los picos de la RTX 5070.',
    sugerencia: 'Haz undervolt o cambia a una fuente de 650 W.',
    leida: false,
    creadaEn: '2026-11-02T12:16:00Z',
  },
  {
    id: 'a2',
    buildId: 'b1',
    buildName: 'PC Gamer 1080p',
    porcentajeUso: 88,
    mensaje: 'Tu fuente de 650 W queda justa en picos de carga.',
    sugerencia: 'Considera una fuente de 750 W.',
    leida: true,
    creadaEn: '2026-11-01T18:31:00Z',
  },
  {
    id: 'a3',
    buildId: 'b2',
    buildName: 'PC Gamer 1440p',
    porcentajeUso: 118,
    mensaje: 'El consumo de tu build supera el umbral recomendado.',
    sugerencia: 'Revisa la fuente o reduce el consumo de la GPU.',
    leida: false,
    creadaEn: '2026-11-03T10:00:00Z',
  },
]

export const benchmarksPorId: Record<string, Record<string, number>> = {
  'cpu-9600x': { cinebenchR24: 1200, geekbenchSingle: 2900 },
  'cpu-9700x': { cinebenchR24: 1450, geekbenchSingle: 3000 },
  'cpu-9950x': { cinebenchR24: 2400, geekbenchSingle: 3200 },
  'cpu-14600k': { cinebenchR24: 1500, geekbenchSingle: 2700 },
  'cpu-14700k': { cinebenchR24: 1800, geekbenchSingle: 2800 },
  'cpu-14900k': { cinebenchR24: 2100, geekbenchSingle: 3000 },
  'gpu-4060': { timespy: 10500 },
  'gpu-5060ti': { timespy: 14500 },
  'gpu-5070': { timespy: 18000 },
  'gpu-7800xt': { timespy: 17000 },
  'gpu-9070': { timespy: 19000 },
}
