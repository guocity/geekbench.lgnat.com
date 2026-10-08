import json
import re
import os

PROCESSORS_DATA = [
    {
        "chip": "M6",
        "name": "Apple M6",
        "family": "M6",
        "tier": "base",
        "processNode": "2nm (TSMC N2)",
        "transistorTech": "GAA Nanosheet",
        "dieSizeMm2": 141.6,
        "packaging": "Apple SiP",
        "cpuCores": 12,
        "superCores": 2,
        "pCores": 4,
        "eCores": 6,
        "coreConfig": "2 Super + 4P + 6E",
        "clock": "4.8",
        "gpuCores": 12,
        "rayTracing": True,
        "neuralEngineCores": 32,
        "aneTops": 55.0,
        "l2CacheMB": 20,
        "l2Cache": "20 MB",
        "slcMB": 16,
        "systemCache": "16 MB",
        "busWidthBits": 128,
        "memoryBusWidth": "128-bit",
        "memoryType": "LPDDR5X / LPDDR6",
        "memorySpeed": "9600 - 10667 MT/s",
        "memoryBandwidth": 170.7,
        "memoryBandwidthMin": 153.6,
        "memoryBandwidthMax": 170.7,
        "ramConfigurations": [
            {
                "ram": "16 GB",
                "memoryBandwidth": 153.6,
                "memoryType": "LPDDR5X-9600",
                "memorySpeed": "9600 MT/s",
                "busWidthBits": 128,
                "description": "Standard 16 GB tier running at 9,600 MT/s DRAM speed (153.6 GB/s bandwidth, matching M5)"
            },
            {
                "ram": "24 GB / 32 GB",
                "memoryBandwidth": 170.7,
                "memoryType": "LPDDR6-10667",
                "memorySpeed": "10667 MT/s",
                "busWidthBits": 128,
                "description": "Upgraded 24 GB and 32 GB tiers utilizing faster 10,667 MT/s DRAM (170.7 GB/s bandwidth)"
            }
        ],
        "dieShots": [
            {
                "url": "images/die-shots/m6-die-shot-1.jpg",
                "originalUrl": "https://pbs.twimg.com/media/HT2YKyUXsAA60ya?format=jpg&name=4096x4096",
                "caption": "Apple M6 Die Shot Overview (2nm TSMC N2 GAA Nanosheet, 141.6 mm²)"
            },
            {
                "url": "images/die-shots/m6-die-shot-2.jpg",
                "originalUrl": "https://pbs.twimg.com/media/HT2YKyTXkAAWp68?format=jpg&name=4096x4096",
                "caption": "Apple M6 Micro-Architecture Floorplan & Subsystem Layout"
            }
        ],
        "specs": "Apple M6 @ 4.8 GHz (2 Super + 4P + 6E CPU cores, 12 GPU cores, 20 MB L2, 16 MB SLC, 128-bit LPDDR5X/LPDDR6), 153.6 - 170.7 GB/s, 2nm (TSMC N2)"
    },
    {
        "chip": "M5 Ultra",
        "name": "Apple M5 Ultra",
        "family": "M5",
        "tier": "ultra",
        "processNode": "3nm (TSMC N3P)",
        "transistorTech": "FinFET",
        "packaging": "UltraFusion (2.5 TB/s)",
        "cpuCores": [30, 36],
        "pCores": 24,
        "eCores": 12,
        "coreConfig": "24P + 12E",
        "clock": "4.6",
        "gpuCores": [64, 80],
        "rayTracing": True,
        "neuralEngineCores": 32,
        "aneTops": 90.0,
        "slcMB": 128,
        "systemCache": "128 MB",
        "busWidthBits": 1024,
        "memoryBusWidth": "1024-bit",
        "memoryType": "LPDDR5X-9600",
        "memorySpeed": "9600 MT/s",
        "memoryBandwidth": 1365.3,
        "specs": "Apple M5 Ultra @ 4.6 GHz (24P + 12E CPU cores, 80 GPU cores, 128 MB SLC, 1024-bit LPDDR5X-9600), 1365.3 GB/s, 3nm (TSMC N3P)"
    },
    {
        "chip": "M5 Max",
        "name": "Apple M5 Max",
        "family": "M5",
        "tier": "max",
        "processNode": "3nm (TSMC N3P)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": 18,
        "pCores": 12,
        "eCores": 6,
        "coreConfig": "12P + 6E",
        "clock": "4.6",
        "gpuCores": [32, 40],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 45.0,
        "slcMB": 64,
        "systemCache": "64 MB",
        "busWidthBits": 512,
        "memoryBusWidth": "512-bit",
        "memoryType": "LPDDR5X-9600",
        "memorySpeed": "9600 MT/s",
        "memoryBandwidth": 682.6,
        "specs": "Apple M5 Max @ 4.6 GHz (12P + 6E CPU cores, 40 GPU cores, 64 MB SLC, 512-bit LPDDR5X-9600), 682.6 GB/s, 3nm (TSMC N3P)"
    },
    {
        "chip": "M5 Pro",
        "name": "Apple M5 Pro",
        "family": "M5",
        "tier": "pro",
        "processNode": "3nm (TSMC N3P)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": [15, 18],
        "pCores": 12,
        "eCores": 6,
        "coreConfig": "12P + 6E",
        "clock": "4.6",
        "gpuCores": [16, 20],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 45.0,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 256,
        "memoryBusWidth": "256-bit",
        "memoryType": "LPDDR5X-9600",
        "memorySpeed": "9600 MT/s",
        "memoryBandwidth": 341.3,
        "specs": "Apple M5 Pro @ 4.6 GHz (12P + 6E CPU cores, 20 GPU cores, 32 MB SLC, 256-bit LPDDR5X-9600), 341.3 GB/s, 3nm (TSMC N3P)"
    },
    {
        "chip": "M5",
        "name": "Apple M5",
        "family": "M5",
        "tier": "base",
        "processNode": "3nm (TSMC N3P)",
        "transistorTech": "FinFET",
        "dieSizeMm2": 154.0,
        "packaging": "Apple SiP",
        "cpuCores": 10,
        "pCores": 4,
        "eCores": 6,
        "coreConfig": "4P + 6E",
        "clock": "4.6",
        "gpuCores": [8, 10],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 45.0,
        "slcMB": 16,
        "systemCache": "16 MB",
        "busWidthBits": 128,
        "memoryBusWidth": "128-bit",
        "memoryType": "LPDDR5X-9600",
        "memorySpeed": "9600 MT/s",
        "memoryBandwidth": 153.6,
        "specs": "Apple M5 @ 4.6 GHz (4P + 6E CPU cores, 10 GPU cores, 16 MB SLC, 128-bit LPDDR5X-9600), 153.6 GB/s, 3nm (TSMC N3P)"
    },
    {
        "chip": "M4 Max",
        "name": "Apple M4 Max",
        "family": "M4",
        "tier": "max",
        "processNode": "3nm (TSMC N3E)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": [14, 16],
        "pCores": 12,
        "eCores": 4,
        "coreConfig": "12P + 4E",
        "clock": "4.5",
        "gpuCores": [32, 40],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 38.0,
        "slcMB": 64,
        "systemCache": "64 MB",
        "busWidthBits": 512,
        "memoryBusWidth": "384-bit / 512-bit",
        "memoryType": "LPDDR5X-8533",
        "memorySpeed": "8533 MT/s",
        "memoryBandwidth": 546.0,
        "memoryBandwidthMin": 410.0,
        "memoryBandwidthMax": 546.0,
        "ramConfigurations": [
            {
                "ram": "36 GB / 14-core CPU",
                "memoryBandwidth": 410.0,
                "memoryType": "LPDDR5X-8533",
                "memorySpeed": "8533 MT/s",
                "busWidthBits": 384,
                "description": "384-bit memory bus configuration (410 GB/s)"
            },
            {
                "ram": "48 GB / 64 GB / 128 GB",
                "memoryBandwidth": 546.0,
                "memoryType": "LPDDR5X-8533",
                "memorySpeed": "8533 MT/s",
                "busWidthBits": 512,
                "description": "Full 512-bit memory bus configuration (546 GB/s)"
            }
        ],
        "specs": "Apple M4 Max @ 4.5 GHz (12P + 4E CPU cores, 40 GPU cores, 64 MB SLC, 512-bit LPDDR5X-8533), 410 - 546 GB/s, 3nm (TSMC N3E)"
    },
    {
        "chip": "M4 Pro",
        "name": "Apple M4 Pro",
        "family": "M4",
        "tier": "pro",
        "processNode": "3nm (TSMC N3E)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": [12, 14],
        "pCores": 10,
        "eCores": 4,
        "coreConfig": "10P + 4E",
        "clock": "4.5",
        "gpuCores": [16, 20],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 38.0,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 256,
        "memoryBusWidth": "256-bit",
        "memoryType": "LPDDR5X-8533",
        "memorySpeed": "8533 MT/s",
        "memoryBandwidth": 273.0,
        "specs": "Apple M4 Pro @ 4.5 GHz (10P + 4E CPU cores, 20 GPU cores, 32 MB SLC, 256-bit LPDDR5X-8533), 273.0 GB/s, 3nm (TSMC N3E)"
    },
    {
        "chip": "M4",
        "name": "Apple M4",
        "family": "M4",
        "tier": "base",
        "processNode": "3nm (TSMC N3E)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": [8, 9, 10],
        "pCores": 4,
        "eCores": 6,
        "coreConfig": "4P + 6E",
        "clock": "4.4",
        "gpuCores": [8, 10],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 38.0,
        "slcMB": 8,
        "systemCache": "8 MB",
        "busWidthBits": 128,
        "memoryBusWidth": "128-bit",
        "memoryType": "LPDDR5X-7500",
        "memorySpeed": "7500 MT/s",
        "memoryBandwidth": 120.0,
        "specs": "Apple M4 @ 4.4 GHz (4P + 6E CPU cores, 10 GPU cores, 8 MB SLC, 128-bit LPDDR5X-7500), 120.0 GB/s, 3nm (TSMC N3E)"
    },
    {
        "chip": "M3 Ultra",
        "name": "Apple M3 Ultra",
        "family": "M3",
        "tier": "ultra",
        "processNode": "3nm (TSMC N3B)",
        "transistorTech": "FinFET",
        "packaging": "UltraFusion (2.5 TB/s)",
        "cpuCores": [28, 32],
        "pCores": 24,
        "eCores": 8,
        "coreConfig": "24P + 8E",
        "clock": "4.0",
        "gpuCores": [60, 80],
        "rayTracing": True,
        "neuralEngineCores": 32,
        "aneTops": 36.0,
        "slcMB": 96,
        "systemCache": "96 MB",
        "busWidthBits": 1024,
        "memoryBusWidth": "1024-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 819.2,
        "specs": "Apple M3 Ultra @ 4.0 GHz (24P + 8E CPU cores, 80 GPU cores, 96 MB SLC, 1024-bit LPDDR5-6400), 819.2 GB/s, 3nm (TSMC N3B)"
    },
    {
        "chip": "M3 Max",
        "name": "Apple M3 Max",
        "family": "M3",
        "tier": "max",
        "processNode": "3nm (TSMC N3B)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": [14, 16],
        "pCores": 12,
        "eCores": 4,
        "coreConfig": "12P + 4E",
        "clock": "4.1",
        "gpuCores": [30, 40],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 18.0,
        "slcMB": 48,
        "systemCache": "48 MB",
        "busWidthBits": 512,
        "memoryBusWidth": "384-bit / 512-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 409.6,
        "memoryBandwidthMin": 307.2,
        "memoryBandwidthMax": 409.6,
        "ramConfigurations": [
            {
                "ram": "36 GB / 14-core CPU",
                "memoryBandwidth": 307.2,
                "memoryType": "LPDDR5-6400",
                "memorySpeed": "6400 MT/s",
                "busWidthBits": 384,
                "description": "384-bit memory bus configuration (307.2 GB/s)"
            },
            {
                "ram": "48 GB / 64 GB / 128 GB",
                "memoryBandwidth": 409.6,
                "memoryType": "LPDDR5-6400",
                "memorySpeed": "6400 MT/s",
                "busWidthBits": 512,
                "description": "Full 512-bit memory bus configuration (409.6 GB/s)"
            }
        ],
        "specs": "Apple M3 Max @ 4.1 GHz (12P + 4E CPU cores, 40 GPU cores, 48 MB SLC, 512-bit LPDDR5-6400), 307.2 - 409.6 GB/s, 3nm (TSMC N3B)"
    },
    {
        "chip": "M3 Pro",
        "name": "Apple M3 Pro",
        "family": "M3",
        "tier": "pro",
        "processNode": "3nm (TSMC N3B)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": [11, 12],
        "pCores": 6,
        "eCores": 6,
        "coreConfig": "6P + 6E",
        "clock": "4.1",
        "gpuCores": [14, 18],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 18.0,
        "slcMB": 24,
        "systemCache": "24 MB",
        "busWidthBits": 192,
        "memoryBusWidth": "192-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 153.6,
        "specs": "Apple M3 Pro @ 4.1 GHz (6P + 6E CPU cores, 18 GPU cores, 24 MB SLC, 192-bit LPDDR5-6400), 153.6 GB/s, 3nm (TSMC N3B)"
    },
    {
        "chip": "M3",
        "name": "Apple M3",
        "family": "M3",
        "tier": "base",
        "processNode": "3nm (TSMC N3B)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": 8,
        "pCores": 4,
        "eCores": 4,
        "coreConfig": "4P + 4E",
        "clock": "4.1",
        "gpuCores": [8, 10],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 18.0,
        "slcMB": 8,
        "systemCache": "8 MB",
        "busWidthBits": 128,
        "memoryBusWidth": "128-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 102.4,
        "specs": "Apple M3 @ 4.1 GHz (4P + 4E CPU cores, 10 GPU cores, 8 MB SLC, 128-bit LPDDR5-6400), 102.4 GB/s, 3nm (TSMC N3B)"
    },
    {
        "chip": "M2 Ultra",
        "name": "Apple M2 Ultra",
        "family": "M2",
        "tier": "ultra",
        "processNode": "5nm (TSMC N4P/N5P)",
        "transistorTech": "FinFET",
        "packaging": "UltraFusion (2.5 TB/s)",
        "cpuCores": 24,
        "pCores": 16,
        "eCores": 8,
        "coreConfig": "16P + 8E",
        "clock": "3.7",
        "gpuCores": [60, 76],
        "rayTracing": False,
        "neuralEngineCores": 32,
        "aneTops": 31.6,
        "slcMB": 96,
        "systemCache": "96 MB",
        "busWidthBits": 1024,
        "memoryBusWidth": "1024-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 819.2,
        "specs": "Apple M2 Ultra @ 3.7 GHz (16P + 8E CPU cores, 76 GPU cores, 96 MB SLC, 1024-bit LPDDR5-6400), 819.2 GB/s, 5nm (TSMC N4P/N5P)"
    },
    {
        "chip": "M2 Max",
        "name": "Apple M2 Max",
        "family": "M2",
        "tier": "max",
        "processNode": "5nm (TSMC N4P/N5P)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": 12,
        "pCores": 8,
        "eCores": 4,
        "coreConfig": "8P + 4E",
        "clock": "3.7",
        "gpuCores": [30, 38],
        "rayTracing": False,
        "neuralEngineCores": 16,
        "aneTops": 15.8,
        "slcMB": 48,
        "systemCache": "48 MB",
        "busWidthBits": 512,
        "memoryBusWidth": "512-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 409.6,
        "specs": "Apple M2 Max @ 3.7 GHz (8P + 4E CPU cores, 38 GPU cores, 48 MB SLC, 512-bit LPDDR5-6400), 409.6 GB/s, 5nm (TSMC N4P/N5P)"
    },
    {
        "chip": "M2 Pro",
        "name": "Apple M2 Pro",
        "family": "M2",
        "tier": "pro",
        "processNode": "5nm (TSMC N4P/N5P)",
        "transistorTech": "FinFET",
        "packaging": "Apple SiP",
        "cpuCores": [10, 12],
        "pCores": 8,
        "eCores": 4,
        "coreConfig": "8P + 4E",
        "clock": "3.5",
        "gpuCores": [16, 19],
        "rayTracing": False,
        "neuralEngineCores": 16,
        "aneTops": 15.8,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 256,
        "memoryBusWidth": "256-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 204.8,
        "specs": "Apple M2 Pro @ 3.5 GHz (8P + 4E CPU cores, 19 GPU cores, 32 MB SLC, 256-bit LPDDR5-6400), 204.8 GB/s, 5nm (TSMC N4P/N5P)"
    },
    {
        "chip": "M2",
        "name": "Apple M2",
        "family": "M2",
        "tier": "base",
        "processNode": "5nm (TSMC N4P/N5P)",
        "transistorTech": "FinFET",
        "dieSizeMm2": 155.0,
        "packaging": "Apple SiP",
        "cpuCores": 8,
        "pCores": 4,
        "eCores": 4,
        "coreConfig": "4P + 4E",
        "clock": "3.5",
        "gpuCores": [8, 10],
        "rayTracing": False,
        "neuralEngineCores": 16,
        "aneTops": 15.8,
        "slcMB": 8,
        "systemCache": "8 MB",
        "busWidthBits": 128,
        "memoryBusWidth": "128-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 102.4,
        "specs": "Apple M2 @ 3.5 GHz (4P + 4E CPU cores, 10 GPU cores, 8 MB SLC, 128-bit LPDDR5-6400), 102.4 GB/s, 5nm (TSMC N4P/N5P)"
    },
    {
        "chip": "M1 Ultra",
        "name": "Apple M1 Ultra",
        "family": "M1",
        "tier": "ultra",
        "processNode": "5nm (TSMC N5)",
        "transistorTech": "FinFET",
        "dieSizeMm2": 864.0,
        "packaging": "UltraFusion (2.5 TB/s)",
        "cpuCores": 20,
        "pCores": 16,
        "eCores": 4,
        "coreConfig": "16P + 4E",
        "clock": "3.2",
        "gpuCores": [48, 64],
        "rayTracing": False,
        "neuralEngineCores": 32,
        "aneTops": 22.0,
        "slcMB": 96,
        "systemCache": "96 MB",
        "busWidthBits": 1024,
        "memoryBusWidth": "1024-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 819.2,
        "specs": "Apple M1 Ultra @ 3.2 GHz (16P + 4E CPU cores, 64 GPU cores, 96 MB SLC, 1024-bit LPDDR5-6400), 819.2 GB/s, 5nm (TSMC N5)"
    },
    {
        "chip": "M1 Max",
        "name": "Apple M1 Max",
        "family": "M1",
        "tier": "max",
        "processNode": "5nm (TSMC N5)",
        "transistorTech": "FinFET",
        "dieSizeMm2": 432.0,
        "packaging": "Apple SiP",
        "cpuCores": 10,
        "pCores": 8,
        "eCores": 2,
        "coreConfig": "8P + 2E",
        "clock": "3.2",
        "gpuCores": [24, 32],
        "rayTracing": False,
        "neuralEngineCores": 16,
        "aneTops": 11.0,
        "slcMB": 48,
        "systemCache": "48 MB",
        "busWidthBits": 512,
        "memoryBusWidth": "512-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 409.6,
        "specs": "Apple M1 Max @ 3.2 GHz (8P + 2E CPU cores, 32 GPU cores, 48 MB SLC, 512-bit LPDDR5-6400), 409.6 GB/s, 5nm (TSMC N5)"
    },
    {
        "chip": "M1 Pro",
        "name": "Apple M1 Pro",
        "family": "M1",
        "tier": "pro",
        "processNode": "5nm (TSMC N5)",
        "transistorTech": "FinFET",
        "dieSizeMm2": 245.0,
        "packaging": "Apple SiP",
        "cpuCores": [8, 10],
        "pCores": 8,
        "eCores": 2,
        "coreConfig": "8P + 2E",
        "clock": "3.2",
        "gpuCores": [14, 16],
        "rayTracing": False,
        "neuralEngineCores": 16,
        "aneTops": 11.0,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 256,
        "memoryBusWidth": "256-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 204.8,
        "specs": "Apple M1 Pro @ 3.2 GHz (8P + 2E CPU cores, 16 GPU cores, 32 MB SLC, 256-bit LPDDR5-6400), 204.8 GB/s, 5nm (TSMC N5)"
    },
    {
        "chip": "M1",
        "name": "Apple M1",
        "family": "M1",
        "tier": "base",
        "processNode": "5nm (TSMC N5)",
        "transistorTech": "FinFET",
        "dieSizeMm2": 120.0,
        "packaging": "Apple SiP",
        "cpuCores": 8,
        "pCores": 4,
        "eCores": 4,
        "coreConfig": "4P + 4E",
        "clock": "3.2",
        "gpuCores": [7, 8],
        "rayTracing": False,
        "neuralEngineCores": 16,
        "aneTops": 11.0,
        "slcMB": 8,
        "systemCache": "8 MB",
        "busWidthBits": 128,
        "memoryBusWidth": "128-bit",
        "memoryType": "LPDDR4X-4266",
        "memorySpeed": "4266 MT/s",
        "memoryBandwidth": 68.25,
        "specs": "Apple M1 @ 3.2 GHz (4P + 4E CPU cores, 8 GPU cores, 8 MB SLC, 128-bit LPDDR4X-4266), 68.25 GB/s, 5nm (TSMC N5)"
    },
    {
        "chip": "A20",
        "name": "Apple A20",
        "family": "M6",
        "tier": "A-Series",
        "processNode": "2nm (TSMC N2)",
        "transistorTech": "GAA Nanosheet",
        "packaging": "InFO-PoP",
        "cpuCores": 6,
        "pCores": 2,
        "eCores": 4,
        "coreConfig": "2P + 4E",
        "clock": "4.6",
        "gpuCores": 5,
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 45.0,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 64,
        "memoryBusWidth": "64-bit",
        "memoryType": "LPDDR5X-9600",
        "memorySpeed": "9600 MT/s",
        "memoryBandwidth": 76.8,
        "dieShots": [
            {
                "url": "images/die-shots/a20-die-shot-1.jpg",
                "originalUrl": "https://pbs.twimg.com/media/HTLCq_LWQAAFZMI?format=jpg&name=4096x4096",
                "caption": "Apple A20 Die Shot Overview (2nm TSMC N2)"
            },
            {
                "url": "images/die-shots/a20-die-shot-2.jpg",
                "originalUrl": "https://pbs.twimg.com/media/HTLDM5oWwAEldCw?format=jpg&name=4096x4096",
                "caption": "Apple A20 Annotated Silicon Floorplan & Functional Blocks"
            }
        ],
        "specs": "Apple A20 @ 4.6 GHz (2P + 4E CPU cores, 5 GPU cores, 32 MB SLC, 64-bit LPDDR5X-9600), 76.8 GB/s, 2nm (TSMC N2)"
    },
    {
        "chip": "A20 Pro",
        "name": "Apple A20 Pro",
        "family": "M6",
        "tier": "A-Series",
        "processNode": "2nm (TSMC N2)",
        "transistorTech": "GAA Nanosheet",
        "packaging": "WMCM",
        "cpuCores": 6,
        "pCores": 2,
        "eCores": 4,
        "coreConfig": "2P + 4E",
        "clock": "4.8",
        "gpuCores": 7,
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 45.0,
        "slcMB": 36,
        "systemCache": "36 MB",
        "busWidthBits": 96,
        "memoryBusWidth": "96-bit",
        "memoryType": "LPDDR5X-9600",
        "memorySpeed": "9600 MT/s",
        "memoryBandwidth": 115.2,
        "dieShots": [
            {
                "url": "images/die-shots/a20-die-shot-1.jpg",
                "originalUrl": "https://pbs.twimg.com/media/HTLCq_LWQAAFZMI?format=jpg&name=4096x4096",
                "caption": "Apple A20 Pro Die Shot Overview (2nm TSMC N2)"
            },
            {
                "url": "images/die-shots/a20-die-shot-2.jpg",
                "originalUrl": "https://pbs.twimg.com/media/HTLDM5oWwAEldCw?format=jpg&name=4096x4096",
                "caption": "Apple A20 Pro Annotated Silicon Floorplan & Functional Blocks"
            }
        ],
        "specs": "Apple A20 Pro @ 4.8 GHz (2P + 4E CPU cores, 7 GPU cores, 36 MB SLC, 96-bit LPDDR5X-9600), 115.2 GB/s, 2nm (TSMC N2)"
    },
    {
        "chip": "A19",
        "name": "Apple A19",
        "family": "M5",
        "tier": "A-Series",
        "processNode": "3nm (TSMC N3P)",
        "transistorTech": "FinFET",
        "packaging": "InFO-PoP",
        "cpuCores": 6,
        "pCores": 2,
        "eCores": 4,
        "coreConfig": "2P + 4E",
        "clock": "4.4",
        "gpuCores": 5,
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 38.0,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 64,
        "memoryBusWidth": "64-bit",
        "memoryType": "LPDDR5X-9600",
        "memorySpeed": "9600 MT/s",
        "memoryBandwidth": 76.8,
        "specs": "Apple A19 @ 4.4 GHz (2P + 4E CPU cores, 5 GPU cores, 32 MB SLC, 64-bit LPDDR5X-9600), 76.8 GB/s, 3nm (TSMC N3P)"
    },
    {
        "chip": "A19 Pro",
        "name": "Apple A19 Pro",
        "family": "M5",
        "tier": "A-Series",
        "processNode": "3nm (TSMC N3P)",
        "transistorTech": "FinFET",
        "packaging": "InFO-PoP",
        "cpuCores": 6,
        "pCores": 2,
        "eCores": 4,
        "coreConfig": "2P + 4E",
        "clock": "4.6",
        "gpuCores": 6,
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 38.0,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 64,
        "memoryBusWidth": "64-bit",
        "memoryType": "LPDDR5X-9600",
        "memorySpeed": "9600 MT/s",
        "memoryBandwidth": 76.8,
        "specs": "Apple A19 Pro @ 4.6 GHz (2P + 4E CPU cores, 6 GPU cores, 32 MB SLC, 64-bit LPDDR5X-9600), 76.8 GB/s, 3nm (TSMC N3P)"
    },
    {
        "chip": "A18",
        "name": "Apple A18",
        "family": "M4",
        "tier": "A-Series",
        "processNode": "3nm (TSMC N3E)",
        "transistorTech": "FinFET",
        "packaging": "InFO-PoP",
        "cpuCores": 6,
        "pCores": 2,
        "eCores": 4,
        "coreConfig": "2P + 4E",
        "clock": "4.04",
        "gpuCores": 5,
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 35.0,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 64,
        "memoryBusWidth": "64-bit",
        "memoryType": "LPDDR5X-7500",
        "memorySpeed": "7500 MT/s",
        "memoryBandwidth": 60.0,
        "specs": "Apple A18 @ 4.04 GHz (2P + 4E CPU cores, 5 GPU cores, 32 MB SLC, 64-bit LPDDR5X-7500), 60.0 GB/s, 3nm (TSMC N3E)"
    },
    {
        "chip": "A18 Pro",
        "name": "Apple A18 Pro",
        "family": "M4",
        "tier": "A-Series",
        "processNode": "3nm (TSMC N3E)",
        "transistorTech": "FinFET",
        "packaging": "InFO-PoP",
        "cpuCores": 6,
        "pCores": 2,
        "eCores": 4,
        "coreConfig": "2P + 4E",
        "clock": "4.04",
        "gpuCores": [5, 6],
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 35.0,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 64,
        "memoryBusWidth": "64-bit",
        "memoryType": "LPDDR5X-7500",
        "memorySpeed": "7500 MT/s",
        "memoryBandwidth": 60.0,
        "specs": "Apple A18 Pro @ 4.04 GHz (2P + 4E CPU cores, 6 GPU cores, 32 MB SLC, 64-bit LPDDR5X-7500), 60.0 GB/s, 3nm (TSMC N3E)"
    },
    {
        "chip": "A17 Pro",
        "name": "Apple A17 Pro",
        "family": "M3",
        "tier": "A-Series",
        "processNode": "3nm (TSMC N3B)",
        "transistorTech": "FinFET",
        "packaging": "InFO-PoP",
        "cpuCores": 6,
        "pCores": 2,
        "eCores": 4,
        "coreConfig": "2P + 4E",
        "clock": "3.78",
        "gpuCores": 6,
        "rayTracing": True,
        "neuralEngineCores": 16,
        "aneTops": 35.0,
        "slcMB": 24,
        "systemCache": "24 MB",
        "busWidthBits": 64,
        "memoryBusWidth": "64-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 51.2,
        "specs": "Apple A17 Pro @ 3.78 GHz (2P + 4E CPU cores, 6 GPU cores, 24 MB SLC, 64-bit LPDDR5-6400), 51.2 GB/s, 3nm (TSMC N3B)"
    },
    {
        "chip": "A16 Bionic",
        "name": "Apple A16 Bionic",
        "family": "M2",
        "tier": "A-Series",
        "processNode": "4nm (TSMC N4)",
        "transistorTech": "FinFET",
        "packaging": "InFO-PoP",
        "cpuCores": 6,
        "pCores": 2,
        "eCores": 4,
        "coreConfig": "2P + 4E",
        "clock": "3.46",
        "gpuCores": 5,
        "rayTracing": False,
        "neuralEngineCores": 16,
        "aneTops": 17.0,
        "slcMB": 24,
        "systemCache": "24 MB",
        "busWidthBits": 64,
        "memoryBusWidth": "64-bit",
        "memoryType": "LPDDR5-6400",
        "memorySpeed": "6400 MT/s",
        "memoryBandwidth": 51.2,
        "specs": "Apple A16 Bionic @ 3.46 GHz (2P + 4E CPU cores, 5 GPU cores, 24 MB SLC, 64-bit LPDDR5-6400), 51.2 GB/s, 4nm (TSMC N4)"
    },
    {
        "chip": "A15 Bionic",
        "name": "Apple A15 Bionic",
        "family": "M1",
        "tier": "A-Series",
        "processNode": "5nm (TSMC N5P)",
        "transistorTech": "FinFET",
        "packaging": "InFO-PoP",
        "cpuCores": 6,
        "pCores": 2,
        "eCores": 4,
        "coreConfig": "2P + 4E",
        "clock": "3.23",
        "gpuCores": 5,
        "rayTracing": False,
        "neuralEngineCores": 16,
        "aneTops": 15.8,
        "slcMB": 32,
        "systemCache": "32 MB",
        "busWidthBits": 64,
        "memoryBusWidth": "64-bit",
        "memoryType": "LPDDR4X-4266",
        "memorySpeed": "4266 MT/s",
        "memoryBandwidth": 34.1,
        "specs": "Apple A15 Bionic @ 3.23 GHz (2P + 4E CPU cores, 5 GPU cores, 32 MB SLC, 64-bit LPDDR4X-4266), 34.1 GB/s, 5nm (TSMC N5P)"
    }
]

def load_base_devices():
    source_file = 'public/devices.json'
    with open(source_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Filter out existing M6 Mac entries so they are not duplicated on re-runs
    cleaned = []
    for item in data:
        if item.get('chip') == 'M6' and any(m in item.get('model', '') for m in ['MacBook', 'Mac mini']):
            continue
        cleaned.append(item)

    # Add the M6 models with different RAM speeds
    m6_devices = [
        {
            "model": "MacBook Pro 14-inch (2026, M6 - 16GB)",
            "family": "M6",
            "tier": "base",
            "chip": "M6",
            "year": 2026,
            "device": "MacBook Pro",
            "ram": "16 GB",
            "cpuCores": 12,
            "gpuCores": 12,
            "clock": "4.8",
            "single": 4689,
            "multi": 21177,
            "metal": 101075,
            "opencl": 63200,
            "memoryBandwidth": 153.6,
            "specs": "Apple M6 @ 4.8 GHz (2 Super + 4P + 6E CPU cores, 12 GPU cores, 20 MB L2, 16 MB SLC, 128-bit LPDDR5X-9600, 16 GB), 153.6 GB/s, 2nm (TSMC N2)",
            "id": "macbook-pro-14-inch-2026-m6-16gb-12c-12g",
            "processNode": "2nm (TSMC N2)",
            "transistorTech": "GAA Nanosheet",
            "dieSizeMm2": 141.6,
            "superCores": 2,
            "pCores": 4,
            "eCores": 6,
            "coreConfig": "2 Super + 4P + 6E",
            "busWidthBits": 128,
            "memoryBusWidth": "128-bit",
            "memoryType": "LPDDR5X-9600",
            "memorySpeed": "9600 MT/s",
            "slcMB": 16,
            "systemCache": "16 MB",
            "l2CacheMB": 20,
            "l2Cache": "20 MB",
            "packaging": "Apple SiP",
            "rayTracing": True,
            "neuralEngineCores": 32,
            "aneTops": 55.0
        },
        {
            "model": "MacBook Pro 14-inch (2026, M6 - 24/32GB)",
            "family": "M6",
            "tier": "base",
            "chip": "M6",
            "year": 2026,
            "device": "MacBook Pro",
            "ram": "24 GB / 32 GB",
            "cpuCores": 12,
            "gpuCores": 12,
            "clock": "4.8",
            "single": 4689,
            "multi": 21177,
            "metal": 101075,
            "opencl": 63200,
            "memoryBandwidth": 170.7,
            "specs": "Apple M6 @ 4.8 GHz (2 Super + 4P + 6E CPU cores, 12 GPU cores, 20 MB L2, 16 MB SLC, 128-bit LPDDR6-10667, 24/32 GB), 170.7 GB/s, 2nm (TSMC N2)",
            "id": "macbook-pro-14-inch-2026-m6-24-32gb-12c-12g",
            "processNode": "2nm (TSMC N2)",
            "transistorTech": "GAA Nanosheet",
            "dieSizeMm2": 141.6,
            "superCores": 2,
            "pCores": 4,
            "eCores": 6,
            "coreConfig": "2 Super + 4P + 6E",
            "busWidthBits": 128,
            "memoryBusWidth": "128-bit",
            "memoryType": "LPDDR6",
            "memorySpeed": "10667 MT/s",
            "slcMB": 16,
            "systemCache": "16 MB",
            "l2CacheMB": 20,
            "l2Cache": "20 MB",
            "packaging": "Apple SiP",
            "rayTracing": True,
            "neuralEngineCores": 32,
            "aneTops": 55.0
        },
        {
            "model": "Mac mini (2026, M6 - 16GB)",
            "family": "M6",
            "tier": "base",
            "chip": "M6",
            "year": 2026,
            "device": "Mac mini",
            "ram": "16 GB",
            "cpuCores": 12,
            "gpuCores": 12,
            "clock": "4.8",
            "single": 4685,
            "multi": 21150,
            "metal": 100900,
            "opencl": 63100,
            "memoryBandwidth": 153.6,
            "specs": "Apple M6 @ 4.8 GHz (2 Super + 4P + 6E CPU cores, 12 GPU cores, 20 MB L2, 16 MB SLC, 128-bit LPDDR5X-9600, 16 GB), 153.6 GB/s, 2nm (TSMC N2)",
            "id": "mac-mini-2026-m6-16gb-12c-12g",
            "processNode": "2nm (TSMC N2)",
            "transistorTech": "GAA Nanosheet",
            "dieSizeMm2": 141.6,
            "superCores": 2,
            "pCores": 4,
            "eCores": 6,
            "coreConfig": "2 Super + 4P + 6E",
            "busWidthBits": 128,
            "memoryBusWidth": "128-bit",
            "memoryType": "LPDDR5X-9600",
            "memorySpeed": "9600 MT/s",
            "slcMB": 16,
            "systemCache": "16 MB",
            "l2CacheMB": 20,
            "l2Cache": "20 MB",
            "packaging": "Apple SiP",
            "rayTracing": True,
            "neuralEngineCores": 32,
            "aneTops": 55.0
        },
        {
            "model": "Mac mini (2026, M6 - 24/32GB)",
            "family": "M6",
            "tier": "base",
            "chip": "M6",
            "year": 2026,
            "device": "Mac mini",
            "ram": "24 GB / 32 GB",
            "cpuCores": 12,
            "gpuCores": 12,
            "clock": "4.8",
            "single": 4689,
            "multi": 21177,
            "metal": 101075,
            "opencl": 63200,
            "memoryBandwidth": 170.7,
            "specs": "Apple M6 @ 4.8 GHz (2 Super + 4P + 6E CPU cores, 12 GPU cores, 20 MB L2, 16 MB SLC, 128-bit LPDDR6-10667, 24/32 GB), 170.7 GB/s, 2nm (TSMC N2)",
            "id": "mac-mini-2026-m6-24-32gb-12c-12g",
            "processNode": "2nm (TSMC N2)",
            "transistorTech": "GAA Nanosheet",
            "dieSizeMm2": 141.6,
            "superCores": 2,
            "pCores": 4,
            "eCores": 6,
            "coreConfig": "2 Super + 4P + 6E",
            "busWidthBits": 128,
            "memoryBusWidth": "128-bit",
            "memoryType": "LPDDR6",
            "memorySpeed": "10667 MT/s",
            "slcMB": 16,
            "systemCache": "16 MB",
            "l2CacheMB": 20,
            "l2Cache": "20 MB",
            "packaging": "Apple SiP",
            "rayTracing": True,
            "neuralEngineCores": 32,
            "aneTops": 55.0
        }
    ]

    cleaned.extend(m6_devices)
    return cleaned

def enrich():
    data = load_base_devices()
    proc_map = {p['chip']: p for p in PROCESSORS_DATA}

    enriched = []
    seen_ids = set()

    for item in data:
        d = dict(item)
        chip = d.get('chip', '')
        family = d.get('family', '')
        tier = d.get('tier', '')
        model = d.get('model', '')
        device = d.get('device', '')
        cpu_cores = int(d.get('cpuCores', 0))
        gpu_cores = int(d.get('gpuCores', 0))
        bw = float(d.get('memoryBandwidth', 0))
        clock = str(d.get('clock', '-'))
        ram = d.get('ram')

        # 1. Base slug id
        ram_tag = f"-{ram.replace(' ', '').replace('/', '-').lower()}" if ram else ""
        raw_slug = re.sub(r'[^a-z0-9]+', '-', f"{model}-{chip}{ram_tag}-{cpu_cores}c-{gpu_cores}g".lower()).strip('-')
        slug = raw_slug
        counter = 1
        while slug in seen_ids:
            slug = f"{raw_slug}-{counter}"
            counter += 1
        seen_ids.add(slug)
        d['id'] = slug

        # Look up processor baseline specs
        p_info = proc_map.get(chip)

        # 2. Process Node
        if 'processNode' not in d:
            if p_info and 'processNode' in p_info:
                d['processNode'] = p_info['processNode']
            else:
                d['processNode'] = 'TSMC Advanced'

        # 3. CPU Core split
        if 'coreConfig' not in d or not d['coreConfig']:
            if p_info and 'coreConfig' in p_info and 'pCores' in p_info and 'eCores' in p_info:
                d['pCores'] = p_info['pCores']
                d['eCores'] = p_info['eCores']
                d['coreConfig'] = p_info['coreConfig']
            else:
                d['pCores'], d['eCores'] = cpu_cores // 2, cpu_cores - (cpu_cores // 2)
                d['coreConfig'] = f"{d['pCores']}P + {d['eCores']}E"

        # 4. Memory Subsystem
        if 'busWidthBits' not in d and p_info and 'busWidthBits' in p_info:
            d['busWidthBits'] = p_info['busWidthBits']
            d['memoryBusWidth'] = p_info.get('memoryBusWidth', f"{d['busWidthBits']}-bit")

        if 'memoryType' not in d and p_info and 'memoryType' in p_info:
            d['memoryType'] = p_info['memoryType']
            d['memorySpeed'] = p_info.get('memorySpeed', '')

        # 5. Cache
        if 'slcMB' not in d and p_info and 'slcMB' in p_info:
            d['slcMB'] = p_info['slcMB']
            d['systemCache'] = p_info.get('systemCache', f"{d['slcMB']} MB")

        # 6. Packaging & Interconnect
        if 'packaging' not in d and p_info and 'packaging' in p_info:
            d['packaging'] = p_info['packaging']

        # 7. Ray Tracing
        if 'rayTracing' not in d:
            d['rayTracing'] = p_info.get('rayTracing', False) if p_info else False

        # 8. Neural Engine (NPU) TOPS
        if 'neuralEngineCores' not in d and p_info and 'neuralEngineCores' in p_info:
            d['neuralEngineCores'] = p_info['neuralEngineCores']

        if 'aneTops' not in d and p_info and 'aneTops' in p_info:
            d['aneTops'] = p_info['aneTops']

        # Specs summary string
        ram_str = f", {ram} RAM" if ram else ""
        d['specs'] = (
            f"Apple {chip} @ {clock} GHz "
            f"({d['coreConfig']} CPU cores, {gpu_cores} GPU cores, "
            f"{d.get('systemCache', '')} SLC, {d.get('memoryBusWidth', '')} {d.get('memoryType', '')}{ram_str}), "
            f"{bw} GB/s, {d['processNode']}"
        )

        enriched.append(d)

    # Ensure public output directory exists
    os.makedirs('public', exist_ok=True)

    # Save canonical processor specifications
    with open('public/processor.json', 'w', encoding='utf-8') as f:
        json.dump(PROCESSORS_DATA, f, indent=2, ensure_ascii=False)

    # Clean normalized devices (referencing processor by chip, eliminating duplicated processor specs)
    normalized_devices = []
    for item in data:
        dev = {
            'id': item['id'],
            'model': item['model'],
            'device': item['device'],
            'year': item['year'],
            'chip': item['chip']
        }
        if item.get('ram'):
            dev['ram'] = item['ram']
        dev['cpuCores'] = item['cpuCores']
        dev['gpuCores'] = item['gpuCores']
        dev['clock'] = item['clock']
        dev['single'] = item['single']
        dev['multi'] = item['multi']
        dev['metal'] = item['metal']
        dev['opencl'] = item['opencl']
        normalized_devices.append(dev)

    # Save canonical normalized devices
    with open('public/devices.json', 'w', encoding='utf-8') as f:
        json.dump(normalized_devices, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated public/processor.json ({len(PROCESSORS_DATA)} processors) and public/devices.json ({len(normalized_devices)} devices).")

if __name__ == '__main__':
    enrich()
