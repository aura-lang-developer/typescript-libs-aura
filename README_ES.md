# ⚡ AuraFin: Motor de Liquidación Financiera (Aura Lang + TypeScript)

> **Proyecto de ejemplo avanzado que demuestra cómo Aura Lang consume directamente librerías y ecosistema de TypeScript sin wrappers manuales, combinando la seguridad estática del modelo Golang y tipos algebraicos.**

[![Aura Lang](https://img.shields.io/badge/Aura_Lang-v0.1.0-blueviolet?style=for-the-badge)](https://github.com/mrojasb2000/aura-lang)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-6%20Passing-success?style=for-the-badge)](tests/fin_test.aura)

[English](README.md) | **Español**

---

## 🎯 Objetivo del Proyecto

Demostrar en un caso de uso real de misión crítica (liquidación financiera internacional multimoneda, firmas criptográficas y cálculo de ventanas de liquidación T+2) las **cualidades fundamentales de [Aura Lang](https://github.com/mrojasb2000/aura-lang)** en perfecta sinergia con el ecosistema **TypeScript / NPM**.

Aura Lang no busca reemplazar el ecosistema JavaScript/TypeScript, sino elevarlo: permite consumir cualquier módulo o paquete npm existente tipado con TypeScript, garantizando al mismo tiempo **eliminación total de errores en tiempo de ejecución por `null`/`undefined`**, **concurrencia estructurada CSP** y **sintaxis limpia estilo Golang**.

---

## 🌟 Cualidades de Aura Lang Demostradas en este Proyecto

### 1. Ingestión Directa de Tipos TypeScript (`.d.ts`) con `aurac dts-import`
Aura Lang cuenta con un analizador nativo de declaraciones TypeScript (`DtsParser`). No necesitas escribir bindings FFI manuales ni wrappers:
- Compila tus módulos TypeScript a `.d.ts`.
- Pasa los archivos con `--dts <archivo.d.ts>` al compilador `aurac`.
- Usa el comando `aurac dts-import <archivo.d.ts>` para inspeccionar tipos y funciones registradas en el sistema de tipos Hindley-Milner.

```typescript
// En TypeScript (src/ts/currency.ts):
export interface FxRate { pair: string; rate: number; }
export function convertCurrency(amount: number, from: string, to: string): number;
```

```aura
// En Aura Lang (src/aura/main.aura):
import { convertCurrency, getExchangeRate } from "./ts/currency.js";

fn main() {
    // Inferencia estática y tipado estricto garantizado por aurac:
    let totalUsd: Float = convertCurrency(100.0, "EUR", "USD");
    println(totalUsd);
}
```

---

### 2. Eliminación Total de `null` y `undefined` con Tipos Algebraicos (`Option<T>` y `Result<T, E>`)
En TypeScript tradicional, un lookup que falla puede retornar silenciosamente `undefined` y explotar en producción con `TypeError: Cannot read properties of undefined`. 

En Aura Lang, `null` y `undefined` **no existen en la semántica del lenguaje**:
- Operaciones que pueden estar ausentes retornan `Option<T>` (`Some(valor)` o `None`).
- Operaciones sujetas a validación o error retornan `Result<T, E>` (`Ok(valor)` o `Err(error)`).

```aura
// Retorno seguro con Option<Float>
fn safeLookupRate(fromCurr: String, toCurr: String): Option<Float> {
    let rate = getExchangeRate(fromCurr, toCurr);
    if (rate <= 0.0) {
        return None;
    } else {
        return Some(rate);
    }
}

// Validación de cumplimiento financiero con Result<Float, String>
fn screenAmlLimits(amount: Float, maxThreshold: Float): Result<Float, String> {
    if (amount <= 0.0) {
        return Err("Monto debe ser positivo");
    } else if (amount > maxThreshold) {
        return Err(`Monto supera límite permitido de ${maxThreshold}`);
    } else {
        return Ok(amount);
    }
}
```

---

### 3. Pattern Matching Exhaustivo (`match`)
Control de flujo expresivo y verificado en compilación que reemplaza anidaciones frágiles de `switch` o `if/else`:

```aura
let rateMessage = match safeLookupRate("GBP", "USD") {
    Some(r) => `Tasa de cambio encontrada: 1 GBP = ${r} USD`,
    None => "Tasa no disponible en libro de órdenes."
};

let amlDecision = match screenAmlLimits(25000.0, 10000.0) {
    Ok(val) => `Aprobado por AML: ${formatCurrency(val, "USD")}`,
    Err(err) => `Rechazado por AML: ${err}`
};
```

---

### 4. Modelo de Datos Golang-Style: Structs y Receiver Methods
En lugar de jerarquías complejas de clases y herencia, Aura adopta la pureza de structs de datos desacoplados con métodos receptores (*receiver methods*):

```aura
struct Transaction {
    id: String,
    senderAccount: String,
    receiverAccount: String,
    amount: Float,
    currency: String,
    targetCurrency: String,
    riskScore: Float,
    memo: String
};

// Método receptor en valor
fn (t: Transaction) GetGrossAmount(): Float {
    return t.amount;
}

fn (t: Transaction) IsCrossBorder(): Bool {
    return t.currency != t.targetCurrency;
}

fn (t: Transaction) RiskTier(): String {
    if (t.riskScore < 0.25) {
        return "LOW";
    } else if (t.riskScore < 0.65) {
        return "MEDIUM";
    } else {
        return "HIGH";
    }
}
```

---

### 5. Concurrencia CSP y Sincronización Estructurada (`WaitGroup`)
Aura Lang integra primitivas de sincronización concurrentes de primer nivel (`WaitGroup`, `Channel`, `Mutex`, `routine`). En este proyecto, un lote de transacciones financieras se procesa y firma criptográficamente de manera concurrente:

```aura
let wg = WaitGroup.new();
wg.add(4);

for item in batch {
    await processTransactionWorker(item, secretKey, wg);
}

await wg.wait();
println("Todas las transacciones concurrentes finalizaron.");
```

---

### 6. Integración Completa con Paquetes de NPM
El proyecto consume directamente bibliotecas TypeScript y de la comunidad NPM:
- **`date-fns`**: Cálculo de días hábiles bancarios y formato de fechas UTC T+2.
- **`colorette`**: Estilización cromática del terminal (banners de auditoría, badges y tablas).
- **`node:crypto`**: Algoritmos de digestión SHA-256 y HMAC con comparación en tiempo constante (`timingSafeEqual`).

---

## 🏗️ Arquitectura del Repositorio

```text
typescript-libs/
├── aura.mod                  # Descriptor de módulo Aura (modelo Golang)
├── package.json              # Configuración NPM, scripts y dependencias
├── tsconfig.json             # Configuración TypeScript (ES2022, emit .d.ts)
├── README.md                 # Documentación del proyecto (Inglés)
├── README_ES.md              # Documentación del proyecto (Español)
├── scripts/
│   ├── build.sh              # Pipeline de compilación: tsc -> aurac
│   ├── run.sh                # Script de compilación y ejecución directa
│   ├── inspect_types.sh      # Demostración del comando 'aurac dts-import'
│   └── test.sh               # Suite de tests automatizados
├── src/
│   ├── ts/                   # 📁 LIBRERÍAS TYPESCRIPT
│   │   ├── currency.ts       # Conversión FX, tasas multimoneda, redondeo y comisiones
│   │   ├── crypto_signer.ts  # Firmas HMAC-SHA256, hash criptográfico y tokens
│   │   ├── date_utils.ts     # Ventana de liquidación T+N usando NPM 'date-fns'
│   │   └── terminal_ui.ts    # Banners e indicadores usando NPM 'colorette'
│   └── aura/                 # 📁 APLICACIÓN AURA LANG
│       └── main.aura         # Orquestador financiero que integra las librerías
├── dist/                     # Artefactos compilados (.js, .d.ts y .mjs)
│   ├── ts/                   # Módulos JS y DTS generados por TypeScript
│   └── main.mjs              # Módulo ejecutable generado por Aura Compiler
└── tests/
    └── fin_test.aura         # Suite de pruebas unitarias en Aura Lang
```

---

## 🚀 Guía de Instalación y Ejecución

### Requisitos Previos
1. **Node.js** v18+ y **npm** instalados.
2. Compilador **`aurac`** instalado (disponible en `~/.cargo/bin/aurac` o en tu `PATH`).

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar la Aplicación Financiera
Compila automáticamente TypeScript con `tsc`, compila Aura con `aurac` y ejecuta en Node.js:
```bash
npm start
```
*O directamente con el script:*
```bash
bash scripts/run.sh
```

### 3. Inspeccionar Tipos de TypeScript con `aurac dts-import`
Muestra cómo el compilador `aurac` analiza nativamente los archivos `.d.ts`:
```bash
npm run inspect:types
```

### 4. Ejecutar Pruebas Unitarias
Compila y corre la suite de pruebas unitarias escrita en `tests/fin_test.aura`:
```bash
npm test
```

---

## 📊 Salida de Ejecución de Ejemplo

```text
==================================================================
   ⚡ AURA FIN - FINANCIAL SETTLEMENT & CLEARING ENGINE           
   Ecosistema TypeScript + Seguridad Estática Aura Lang           
==================================================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 1. INTEROPERABILIDAD Y CONSUMO DE LIBRERÍAS TYPESCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Trade Date (UTC)             : Oct 11, 2026
  • T+2 Settlement Date          : 2026-10-13
  • Business Day Confirmed       : true
  • EUR/USD Exchange Rate        : 1.085
  • USD/CLP Exchange Rate        : 945.5
  • Sample Formatted EUR         : EUR $15,420.50
  • Sample Formatted USD         : USD $16,731.24
  • Sample Formatted CLP         : CLP $15,819,385.00
[✓ TYPESCRIPT INTEGRATION ACTIVE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 2. TIPOS ALGEBRAICOS Y ELIMINACIÓN DE NULL / UNDEFINED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Lookup GBP/USD               : Tasa de cambio encontrada con éxito: 1 GBP = 1.295 USD
  • Screening $8,500             : Aprobado por AML: USD $8,500.00
  • Screening $25,000            : Rechazado por AML: Amount exceeds maximum allowable threshold of 10000
[✓ SAFETY GUARANTEES VERIFIED]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 3. PROCESAMIENTO CONCURRENTE CON WAITGROUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
────────────────────────────────────────────────────────────
  Transaction [◈ TX-mv3yuvp1-a4adbb474104] [✓ RISK: LOW]
  • Sender                       : ACC-CHILE-001
  • Receiver                     : ACC-USA-994
  • Original Sum                 : CLP $1,500,000.00
  • Target Exchange              : USD $1,585.50
  • Processing Fee               : USD $7.13
  • Net to Settle                : USD $1,578.37
  • HMAC Signature               : 952eedf311e50f65e5551da8eb1c3a43...
  ✔ SUCCESS: Cryptographic audit signature verified.
────────────────────────────────────────────────────────────
  ...
  ✔ SUCCESS: Todas las transacciones concurrentes finalizaron su ciclo de vida.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 4. RESUMEN DEL LOTE DE LIQUIDACIÓN FINANCIERA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Transacciones Procesadas     : 4 operaciones
  • Volumen Total Liquidado      : USD $81,190.00
  • Comisiones Recaudadas (45 bps) : USD $365.35
  • Distribución Bajo Riesgo     : 2 (Aprobación instantánea)
  • Distribución Riesgo Medio    : 1 (Monitoreo regular)
  • Distribución Alto Riesgo     : 1 (Marcado para auditoría)

==================================================================
   ✨ PROYECTO EJECUTADO CON ÉXITO - AURA LANG + TYPESCRIPT       
==================================================================
```

---

## ⚖️ Comparativa: Aura Lang vs. TypeScript Puro

| Característica | TypeScript Puro | Aura Lang |
| :--- | :--- | :--- |
| **Manejo de Ausencia de Valores** | `null` / `undefined` (riesgo de runtime crashes) | `Option<T>` (`Some`/`None`) con verificación exhaustiva |
| **Manejo de Errores** | `try / catch` no chequeado en firmas | `Result<T, E>` (`Ok`/`Err`) tipado explícitamente |
| **Control de Flujo** | `switch` / `if-else` | Pattern Matching exhaustivo (`match`) |
| **Modelo de Objetos** | Clases con herencia compleja | Structs puros + Receiver Methods desacoplados |
| **Concurrencia** | Promesas asíncronas estándar | Concurrencia CSP estructurada (`WaitGroup`, `Channel`) |
| **Interoperabilidad con Ecosistema TS** | Nativo | **Nativo y directo** vía ingestión `.d.ts` (`aurac dts-import`) |

---

## 📜 Licencia

Este proyecto está distribuido bajo la licencia [MIT](LICENSE).
