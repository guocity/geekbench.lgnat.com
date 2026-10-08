# SiliconBench - Apple Silicon & Geekbench Performance Matrix

A modern, lightweight, high-performance GitHub Pages web app for visualizing and comparing Apple Silicon (M1–M6 & A-Series) benchmark scores from Geekbench 6 across Macs, iPads, and iPhones.

- **Production URL**: [https://geekbench.lgnat.com](https://geekbench.lgnat.com)
- **Deployment**: Automatic GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- **Package Philosophy**: Minimal dependencies using **pnpm**, **TypeScript 7**, Vite, React, Recharts, Lucide, and Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- pnpm >= 9 (tested with pnpm 12)

### Local Development
```bash
# 1. Install dependencies with pnpm
pnpm install

# 2. Run local development server
pnpm run dev
```

### Type Check & Production Build
```bash
# Type check with TypeScript 7 and build production bundle into dist/
pnpm run build

# Preview production build locally
pnpm run preview
```

---

## 📦 Minimal Package Architecture

To ensure fast load times, zero bloat, and seamless GitHub Pages hosting, this project uses the absolute minimum required packages managed by **pnpm**:

### Runtime Dependencies (`dependencies`)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` | `^18.3.1` | Core UI library |
| `react-dom` | `^18.3.1` | DOM renderer |
| `recharts` | `^2.15.0` | Scatter & Bar visual charts |
| `lucide-react` | `^0.469.0` | Lightweight SVG icons |

### Build & Tooling (`devDependencies`)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `typescript` | `^7.0.2` | TypeScript 7 language engine & type checking |
| `@types/react` | `^18.3.18` | React type definitions |
| `@types/react-dom` | `^18.3.5` | React DOM type definitions |
| `vite` | `^6.0.7` | Blazing fast bundler & dev server |
| `@vitejs/plugin-react` | `^4.3.4` | Fast Refresh for React |
| `tailwindcss` | `^3.4.17` | Utility-first CSS |
| `postcss` / `autoprefixer` | `^8` / `^10` | CSS processing |

Total production bundle is a pure static site (`dist/index.html`, `dist/assets/`, `dist/devices.json`, `dist/processor.json`, `dist/images/`) that can be served directly from GitHub Pages or any CDN.

---

## 🗄️ Normalized Data Architecture: Single Source of Truth

To eliminate data redundancy and keep storage minimal, all data is organized into a clean relational structure stored in `public/`:
1. **`public/devices.json`** (~35 KB): Device benchmark facts (model, year, chip foreign key, CPU/GPU binning, clock, Geekbench 6 scores). Zero duplicated architectural specs.
2. **`public/processor.json`** (~25 KB): Authoritative silicon microarchitecture, fabrication processes, transistor technologies, cache hierarchies, RAM bandwidth scaling, and silicon die shots for each Apple Silicon SoC.

> [!NOTE]
> **Why `public/` and not `.gitignore`?**
> In Vite, `dist/` is the generated build output (which is git-ignored), whereas `public/` contains tracked source static assets (datasets, die shot images, and `CNAME`). By keeping the canonical datasets exclusively in `public/devices.json` and `public/processor.json`, we avoid duplicating files between the repository root and `public/`.

### 1. Normalized Device Benchmark Schema (`public/devices.json`)

```typescript
export interface AppleSiliconBenchmark {
  id: string;                     // Unique readable slug (e.g., "macbook-pro-14-inch-2026-m6-16gb-12c-12g")
  model: string;                  // Apple device model name
  device: string;                 // Category ("MacBook Pro", "Mac mini", "iPad", "iPhone", etc.)
  year: number;                   // Release year (2020 - 2026)
  chip: string;                   // Foreign key linking to processor.json (e.g., "M6", "M4 Max", "A20")
  ram?: string;                   // Installed unified memory when relevant to bandwidth (e.g., "16 GB", "24 GB / 32 GB")
  cpuCores: number;               // Device-specific active CPU core count
  gpuCores: number;               // Device-specific active GPU core count
  clock: string;                  // Frequency in GHz (e.g., "4.8")

  // --- Geekbench 6 Scores ---
  single: number;                 // Single-core CPU score
  multi: number;                  // Multi-core CPU score
  metal: number;                  // Metal GPU compute score
  opencl: number;                 // OpenCL GPU compute score
}
```

### 2. Processor Architecture Schema (`public/processor.json`)

```typescript
export interface ProcessorDetail {
  chip: string;                   // Primary key ("M6", "M5", "A20", etc.)
  name: string;                   // Full name ("Apple M6")
  family: Family;
  tier: Tier;
  processNode: string;            // TSMC fabrication node ("2nm (TSMC N2)")
  transistorTech?: string;        // "GAA Nanosheet" / "FinFET"
  dieSizeMm2?: number;            // Physical die area (e.g., 141.6 mm² for M6)
  packaging: string;              // "Apple SiP", "UltraFusion", "InFO-PoP"
  cpuCores: number | number[];    // Architectural core count(s)
  coreConfig?: string;            // e.g. "2 Super + 4P + 6E"
  gpuCores: number | number[];    // Architectural GPU core configs
  rayTracing?: boolean;
  neuralEngineCores?: number;     // e.g. 32 cores
  aneTops?: number;               // e.g. 55.0 TOPS
  l2Cache?: string;               // e.g. 20 MB for M6
  systemCache?: string;           // e.g. 16 MB SLC for M6
  busWidthBits?: number;          // e.g. 128-bit
  memoryType?: string;            // e.g. "LPDDR5X / LPDDR6"
  memorySpeed?: string;           // e.g. "9600 - 10667 MT/s"
  memoryBandwidth: number;        // Peak bandwidth in GB/s
  ramConfigurations?: RAMConfiguration[]; // RAM-specific speeds:
                                  // • 16 GB: 153.6 GB/s (9,600 MT/s DRAM)
                                  // • 24 & 32 GB: 170.7 GB/s (10,667 MT/s DRAM)
  dieShots?: DieShot[];           // Local die shot image paths & original high-res references
  specs: string;
}
```

### Dynamic In-Memory Relational Join
The frontend dynamically joins `public/devices.json` with `public/processor.json` on the fly using the `chip` key. Architectural fields, die shots, and RAM-dependent memory bandwidths are resolved automatically at runtime without storing any repeated data in `devices.json`.

### Auto-Enrichment Script
To enrich and synchronize `public/devices.json` and `public/processor.json`:
```bash
python3 scripts/enrich_data.py
```
This script computes P/E splits, RAM-dependent bandwidths, DRAM speeds, caches, ray tracing flags, and TOPS ratings automatically.

---

## 🌐 GitHub Pages Deployment

The repository includes a ready-to-use GitHub Actions workflow in `.github/workflows/deploy.yml` powered by `pnpm`.

### How to Deploy
1. Push your changes to the `main` (or `master`) branch on GitHub:
   ```bash
   git add .
   git commit -m "Deploy Geekbench Apple Silicon matrix with pnpm & TypeScript 7"
   git push origin main
   ```
2. In your GitHub repository settings:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. The action runs `pnpm install --frozen-lockfile` and `pnpm run build` (`tsc && vite build`) and deploys the `dist/` directory to `https://geekbench.lgnat.com`.
4. The `CNAME` file automatically configures the custom domain.
