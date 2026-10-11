# ⚡ AuraFin: Financial Settlement Engine (Aura Lang + TypeScript)

> **Advanced example project demonstrating how Aura Lang directly consumes TypeScript libraries and the npm ecosystem without manual wrappers, combining the static safety of the Golang model and algebraic data types.**

[![Aura Lang](https://img.shields.io/badge/Aura_Lang-v0.1.0-blueviolet?style=for-the-badge)](https://github.com/mrojasb2000/aura-lang)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-6%20Passing-success?style=for-the-badge)](tests/fin_test.aura)

**English** | [Español](README_ES.md)

---

## 🎯 Project Goal

Demonstrate in a mission-critical real-world use case (multi-currency international financial settlement, cryptographic signatures, and T+2 settlement window calculations) the **core qualities of [Aura Lang](https://github.com/mrojasb2000/aura-lang)** in seamless synergy with the **TypeScript / NPM** ecosystem.

Aura Lang does not seek to replace the JavaScript/TypeScript ecosystem, but rather elevate it: it allows consuming any existing TypeScript-typed module or npm package, while guaranteeing **complete elimination of runtime `null`/`undefined` errors**, **structured CSP concurrency**, and **clean Golang-style syntax**.

---

## 🌟 Aura Lang Qualities Demonstrated in this Project

### 1. Direct TypeScript Type Ingestion (`.d.ts`) with `aurac dts-import`
Aura Lang features a native TypeScript declaration parser (`DtsParser`). You do not need to write manual FFI bindings or wrappers:
- Compile your TypeScript modules to `.d.ts`.
- Pass files via `--dts <file.d.ts>` to the `aurac` compiler.
- Use the `aurac dts-import <file.d.ts>` command to inspect types and functions registered in the Hindley-Milner type system.

```typescript
// In TypeScript (src/ts/currency.ts):
export interface FxRate { pair: string; rate: number; }
export function convertCurrency(amount: number, from: string, to: string): number;
```

```aura
// In Aura Lang (src/aura/main.aura):
import { convertCurrency, getExchangeRate } from "./ts/currency.js";

fn main() {
    // Static inference and strict typing guaranteed by aurac:
    let totalUsd: Float = convertCurrency(100.0, "EUR", "USD");
    println(totalUsd);
}
```

---

### 2. Complete Elimination of `null` and `undefined` with Algebraic Data Types (`Option<T>` and `Result<T, E>`)
In traditional TypeScript, a failed lookup can silently return `undefined` and crash in production with `TypeError: Cannot read properties of undefined`. 

In Aura Lang, `null` and `undefined` **do not exist in the language semantics**:
- Operations where a value may be absent return `Option<T>` (`Some(value)` or `None`).
- Operations subject to validation or error return `Result<T, E>` (`Ok(value)` or `Err(error)`).

```aura
// Safe return with Option<Float>
fn safeLookupRate(fromCurr: String, toCurr: String): Option<Float> {
    let rate = getExchangeRate(fromCurr, toCurr);
    if (rate <= 0.0) {
        return None;
    } else {
        return Some(rate);
    }
}

// Financial compliance validation with Result<Float, String>
fn screenAmlLimits(amount: Float, maxThreshold: Float): Result<Float, String> {
    if (amount <= 0.0) {
        return Err("Transaction amount must be strictly positive");
    } else if (amount > maxThreshold) {
        return Err(`Amount exceeds maximum allowable threshold of ${maxThreshold}`);
    } else {
        return Ok(amount);
    }
}
```

---

### 3. Exhaustive Pattern Matching (`match`)
Expressive and compile-time checked control flow replacing fragile nested `switch` or `if/else` statements:

```aura
let rateMessage = match safeLookupRate("GBP", "USD") {
    Some(r) => `Exchange rate found: 1 GBP = ${r} USD`,
    None => "Rate not available in order book."
};

let amlDecision = match screenAmlLimits(25000.0, 10000.0) {
    Ok(val) => `Approved by AML: ${formatCurrency(val, "USD")}`,
    Err(err) => `Rejected by AML: ${err}`
};
```

---

### 4. Golang-Style Data Model: Structs and Receiver Methods
Instead of complex class hierarchies and inheritance, Aura adopts the purity of decoupled data structs with receiver methods:

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

// Value receiver method
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

### 5. CSP Concurrency and Structured Synchronization (`WaitGroup`)
Aura Lang integrates first-class concurrent synchronization primitives (`WaitGroup`, `Channel`, `Mutex`, `routine`). In this project, a batch of financial transactions is processed and cryptographically signed concurrently:

```aura
let wg = WaitGroup.new();
wg.add(4);

for item in batch {
    await processTransactionWorker(item, secretKey, wg);
}

await wg.wait();
println("All concurrent transactions have finished.");
```

---

### 6. Full Integration with NPM Packages
The project directly consumes TypeScript and NPM community libraries:
- **`date-fns`**: Banking business day calculations and UTC T+2 date formatting.
- **`colorette`**: Terminal color styling (audit banners, badges, and tables).
- **`node:crypto`**: SHA-256 digest and HMAC algorithms with constant-time comparison (`timingSafeEqual`).

---

## 🏗️ Repository Architecture

```text
typescript-libs/
├── aura.mod                  # Aura module descriptor (Golang model)
├── package.json              # NPM configuration, scripts, and dependencies
├── tsconfig.json             # TypeScript configuration (ES2022, emit .d.ts)
├── README.md                 # Project documentation (English)
├── README_ES.md              # Project documentation (Spanish)
├── scripts/
│   ├── build.sh              # Build pipeline: tsc -> aurac
│   ├── run.sh                # Direct build & run execution script
│   ├── inspect_types.sh      # Demonstration of 'aurac dts-import' command
│   └── test.sh               # Automated test suite runner
├── src/
│   ├── ts/                   # 📁 TYPESCRIPT LIBRARIES
│   │   ├── currency.ts       # FX conversion, multi-currency rates, rounding, and fees
│   │   ├── crypto_signer.ts  # HMAC-SHA256 signatures, cryptographic hashing, and tokens
│   │   ├── date_utils.ts     # T+N settlement window using NPM 'date-fns'
│   │   └── terminal_ui.ts    # Banners and indicators using NPM 'colorette'
│   └── aura/                 # 📁 AURA LANG APPLICATION
│       └── main.aura         # Financial orchestrator integrating all libraries
├── dist/                     # Compiled artifacts (.js, .d.ts, and .mjs)
│   ├── ts/                   # JS and DTS modules generated by TypeScript
│   └── main.mjs              # Executable module generated by Aura Compiler
└── tests/
    └── fin_test.aura         # Unit test suite in Aura Lang
```

---

## 🚀 Installation & Execution Guide

### Prerequisites
1. **Node.js** v18+ and **npm** installed.
2. **`aurac`** compiler installed (available at `~/.cargo/bin/aurac` or in your `PATH`).

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Financial Application
Automatically compiles TypeScript with `tsc`, compiles Aura with `aurac`, and executes under Node.js:
```bash
npm start
```
*Or directly via script:*
```bash
bash scripts/run.sh
```

### 3. Inspect TypeScript Types with `aurac dts-import`
Demonstrates how the `aurac` compiler natively parses `.d.ts` declaration files:
```bash
npm run inspect:types
```

### 4. Run Unit Tests
Compiles and executes the unit test suite written in `tests/fin_test.aura`:
```bash
npm test
```

---

## 📊 Sample Execution Output

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

## ⚖️ Feature Comparison: Aura Lang vs. Pure TypeScript

| Feature | Pure TypeScript | Aura Lang |
| :--- | :--- | :--- |
| **Handling Absence of Values** | `null` / `undefined` (risk of runtime crashes) | `Option<T>` (`Some`/`None`) with exhaustive verification |
| **Error Handling** | Unchecked `try / catch` in signatures | `Result<T, E>` (`Ok`/`Err`) explicitly typed |
| **Control Flow** | `switch` / `if-else` | Exhaustive Pattern Matching (`match`) |
| **Object Model** | Classes with complex inheritance hierarchies | Pure structs + decoupled receiver methods |
| **Concurrency** | Standard asynchronous Promises | Structured CSP concurrency (`WaitGroup`, `Channel`) |
| **TS Ecosystem Interoperability** | Native | **Native and direct** via `.d.ts` ingestion (`aurac dts-import`) |

---

## 📜 License

This project is distributed under the [MIT](LICENSE) license.
