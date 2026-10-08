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

Total production bundle is a pure static site (`dist/index.html`, `dist/assets/`, `dist/data.json`) that can be served directly from GitHub Pages or any CDN.

---

## 🗄️ Redesigned `data.json` Schema

The benchmark dataset has been completely redesigned to include comprehensive hardware specifications while preserving 100% backward compatibility with all existing fields.

### TypeScript Interface Definition (`src/types.ts`)

```typescript
export interface AppleSiliconBenchmark {
  // --- Device Identification ---
  id?: string;                    // Unique readable slug (e.g., "mac-mini-2024-m4-pro-14c-20g")
  model: string;                  // Apple device model name
  device: string;                 // Category ("MacBook Pro", "iPad", "iPhone", etc.)
  year: number;                   // Release year (2020 - 2026)

  // --- Silicon Architecture ---
  family: "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | string;
  tier: "base" | "pro" | "max" | "ultra" | "A-Series" | string;
  chip: string;                   // Marketing name (e.g., "M4 Pro", "A18 Pro")
  processNode?: string;           // Fabrication process (e.g., "3nm (TSMC N3E)")
  packaging?: string;             // Interconnect (e.g., "Apple SiP", "UltraFusion", "InFO-PoP")

  // --- CPU Architecture ---
  cpuCores: number;               // Total CPU cores (e.g., 14)
  pCores?: number;                // Performance cores (e.g., 10)
  eCores?: number;                // Efficiency cores (e.g., 4)
  coreConfig?: string;            // Configuration string (e.g., "10P + 4E")
  clock: string;                  // Peak frequency in GHz (e.g., "4.5")

  // --- GPU & Accelerators ---
  gpuCores: number;               // Total GPU cores (e.g., 20)
  rayTracing?: boolean;           // Hardware Ray Tracing support (M3/A17 Pro+)
  neuralEngineCores?: number;     // Neural Engine cores (e.g., 16 or 32)
  aneTops?: number;               // Apple Neural Engine TOPS (e.g., 38.0)

  // --- Memory Subsystem ---
  memoryBandwidth: number;        // Memory bandwidth in GB/s (e.g., 273.0)
  memoryType?: string;            // Type (e.g., "LPDDR5X-8533")
  memorySpeed?: string;           // Speed (e.g., "8533 MT/s")
  busWidthBits?: number;          // Bus width in bits (e.g., 256)
  memoryBusWidth?: string;        // Bus width label (e.g., "256-bit")
  slcMB?: number;                 // System Level Cache in MB (e.g., 32)
  systemCache?: string;           // Cache label (e.g., "32 MB")

  // --- Geekbench 6 Scores ---
  single: number;                 // Single-core CPU score
  multi: number;                  // Multi-core CPU score
  metal: number;                  // Metal GPU compute score
  opencl: number;                 // OpenCL GPU compute score

  // --- Compatibility & Search ---
  specs: string;                  // Comprehensive description for full-text search
}
```

### Auto-Enrichment Script
To update or enrich new benchmark runs in `data.json`:
```bash
python3 scripts/enrich_data.py
```
This script computes P/E splits, memory types, bus widths, cache sizes, ray tracing flags, and TOPS ratings automatically.

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
