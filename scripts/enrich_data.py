import json
import re

def enrich():
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

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

        # 1. Base slug id
        raw_slug = re.sub(r'[^a-z0-9]+', '-', f"{model}-{chip}-{cpu_cores}c-{gpu_cores}g".lower()).strip('-')
        slug = raw_slug
        counter = 1
        while slug in seen_ids:
            slug = f"{raw_slug}-{counter}"
            counter += 1
        seen_ids.add(slug)
        d['id'] = slug

        # 2. Process Node
        if 'processNode' not in d:
            if 'A15' in chip: d['processNode'] = '5nm (TSMC N5P)'
            elif 'A16' in chip: d['processNode'] = '4nm (TSMC N4)'
            elif 'A17' in chip: d['processNode'] = '3nm (TSMC N3B)'
            elif 'A18' in chip: d['processNode'] = '3nm (TSMC N3E)'
            elif 'A19' in chip: d['processNode'] = '3nm (TSMC N3P)'
            elif 'A20' in chip: d['processNode'] = '2nm (TSMC N2)'
            elif 'M1' in chip: d['processNode'] = '5nm (TSMC N5)'
            elif 'M2' in chip: d['processNode'] = '5nm (TSMC N4P/N5P)'
            elif 'M3' in chip: d['processNode'] = '3nm (TSMC N3B)'
            elif 'M4' in chip: d['processNode'] = '3nm (TSMC N3E)'
            elif 'M5' in chip: d['processNode'] = '3nm (TSMC N3P)'
            elif 'M6' in chip: d['processNode'] = '2nm (TSMC N2)'
            else: d['processNode'] = 'TSMC Advanced'

        # 3. CPU Core split (Performance & Efficiency)
        if 'A' in chip:
            d['pCores'] = 2
            d['eCores'] = 4
            d['coreConfig'] = '2P + 4E'
        elif 'Ultra' in chip:
            if cpu_cores == 20: d['pCores'], d['eCores'] = 16, 4
            elif cpu_cores == 24: d['pCores'], d['eCores'] = 16, 8
            elif cpu_cores == 28: d['pCores'], d['eCores'] = 20, 8
            elif cpu_cores == 32: d['pCores'], d['eCores'] = 24, 8
            elif cpu_cores == 30: d['pCores'], d['eCores'] = 20, 10
            elif cpu_cores == 36: d['pCores'], d['eCores'] = 24, 12
            else: d['pCores'], d['eCores'] = max(cpu_cores - 8, 4), 8
            d['coreConfig'] = f"{d['pCores']}P + {d['eCores']}E"
        elif 'M1' in chip:
            if 'Pro' in chip or 'Max' in chip:
                if cpu_cores == 8: d['pCores'], d['eCores'] = 6, 2
                else: d['pCores'], d['eCores'] = 8, 2
            else:
                d['pCores'], d['eCores'] = 4, 4
            d['coreConfig'] = f"{d['pCores']}P + {d['eCores']}E"
        elif 'M2' in chip:
            if 'Pro' in chip or 'Max' in chip:
                if cpu_cores == 10: d['pCores'], d['eCores'] = 6, 4
                else: d['pCores'], d['eCores'] = 8, 4
            else:
                d['pCores'], d['eCores'] = 4, 4
            d['coreConfig'] = f"{d['pCores']}P + {d['eCores']}E"
        elif 'M3' in chip:
            if 'Pro' in chip:
                if cpu_cores == 11: d['pCores'], d['eCores'] = 5, 6
                else: d['pCores'], d['eCores'] = 6, 6
            elif 'Max' in chip:
                if cpu_cores == 14: d['pCores'], d['eCores'] = 10, 4
                else: d['pCores'], d['eCores'] = 12, 4
            else:
                d['pCores'], d['eCores'] = 4, 4
            d['coreConfig'] = f"{d['pCores']}P + {d['eCores']}E"
        elif 'M4' in chip:
            if 'Pro' in chip:
                if cpu_cores == 12: d['pCores'], d['eCores'] = 8, 4
                else: d['pCores'], d['eCores'] = 10, 4
            elif 'Max' in chip:
                if cpu_cores == 14: d['pCores'], d['eCores'] = 10, 4
                else: d['pCores'], d['eCores'] = 12, 4
            else:
                if cpu_cores == 8: d['pCores'], d['eCores'] = 2, 6
                elif cpu_cores == 9: d['pCores'], d['eCores'] = 3, 6
                else: d['pCores'], d['eCores'] = 4, 6
            d['coreConfig'] = f"{d['pCores']}P + {d['eCores']}E"
        elif 'M5' in chip:
            if 'Pro' in chip:
                if cpu_cores == 15: d['pCores'], d['eCores'] = 9, 6
                else: d['pCores'], d['eCores'] = 12, 6
            elif 'Max' in chip:
                d['pCores'], d['eCores'] = 12, 6
            else:
                d['pCores'], d['eCores'] = 4, 6
            d['coreConfig'] = f"{d['pCores']}P + {d['eCores']}E"
        elif 'M6' in chip:
            d['pCores'], d['eCores'] = 6, 6
            d['coreConfig'] = '6P + 6E'
        else:
            d['pCores'], d['eCores'] = cpu_cores // 2, cpu_cores - (cpu_cores // 2)
            d['coreConfig'] = f"{d['pCores']}P + {d['eCores']}E"

        # 4. Memory Subsystem
        if 'busWidthBits' not in d:
            if 'A15' in chip or 'A16' in chip or 'A17' in chip or 'A18' in chip or 'A19' in chip or (chip == 'A20' and gpu_cores <= 5):
                d['busWidthBits'] = 64
                d['memoryBusWidth'] = '64-bit'
            elif chip == 'A20 Pro':
                d['busWidthBits'] = 96
                d['memoryBusWidth'] = '96-bit'
            elif 'Ultra' in chip:
                d['busWidthBits'] = 1024
                d['memoryBusWidth'] = '1024-bit'
            elif 'Max' in chip:
                if ('M3 Max' in chip or 'M4 Max' in chip) and cpu_cores == 14:
                    d['busWidthBits'] = 384
                    d['memoryBusWidth'] = '384-bit'
                else:
                    d['busWidthBits'] = 512
                    d['memoryBusWidth'] = '512-bit'
            elif 'Pro' in chip:
                if 'M3 Pro' in chip:
                    d['busWidthBits'] = 192
                    d['memoryBusWidth'] = '192-bit'
                else:
                    d['busWidthBits'] = 256
                    d['memoryBusWidth'] = '256-bit'
            else: # Base M-series
                d['busWidthBits'] = 128
                d['memoryBusWidth'] = '128-bit'

        if 'memoryType' not in d:
            if 'A15' in chip or chip == 'M1':
                d['memoryType'] = 'LPDDR4X-4266'
                d['memorySpeed'] = '4266 MT/s'
            elif 'A16' in chip or 'A17' in chip or 'M2' in chip or 'M3' in chip or 'M1 Pro' in chip or 'M1 Max' in chip or 'M1 Ultra' in chip:
                d['memoryType'] = 'LPDDR5-6400'
                d['memorySpeed'] = '6400 MT/s'
            elif 'A18' in chip or chip == 'M4':
                d['memoryType'] = 'LPDDR5X-7500'
                d['memorySpeed'] = '7500 MT/s'
            elif 'M4 Pro' in chip or 'M4 Max' in chip:
                d['memoryType'] = 'LPDDR5X-8533'
                d['memorySpeed'] = '8533 MT/s'
            elif 'A19' in chip or 'M5' in chip:
                d['memoryType'] = 'LPDDR5X-9600'
                d['memorySpeed'] = '9600 MT/s'
            elif 'A20' in chip or 'M6' in chip:
                d['memoryType'] = 'LPDDR6'
                d['memorySpeed'] = '10667 MT/s'

        # 5. System Cache (SLC)
        if 'slcMB' not in d:
            if 'A15' in chip: d['slcMB'], d['systemCache'] = 32, '32 MB'
            elif 'A16' in chip or 'A17' in chip: d['slcMB'], d['systemCache'] = 24, '24 MB'
            elif 'A18' in chip or 'A19' in chip or 'A20' in chip: d['slcMB'], d['systemCache'] = 32, '32 MB'
            elif 'Ultra' in chip:
                if 'M5 Ultra' in chip: d['slcMB'], d['systemCache'] = 128, '128 MB'
                else: d['slcMB'], d['systemCache'] = 96, '96 MB'
            elif 'Max' in chip:
                if 'M4 Max' in chip or 'M5 Max' in chip: d['slcMB'], d['systemCache'] = 64, '64 MB'
                else: d['slcMB'], d['systemCache'] = 48, '48 MB'
            elif 'Pro' in chip:
                if 'M1 Pro' in chip and cpu_cores == 8: d['slcMB'], d['systemCache'] = 24, '24 MB'
                elif 'M3 Pro' in chip: d['slcMB'], d['systemCache'] = 24, '24 MB'
                else: d['slcMB'], d['systemCache'] = 32, '32 MB'
            else:
                if 'M5' in chip or 'M6' in chip: d['slcMB'], d['systemCache'] = 16, '16 MB'
                else: d['slcMB'], d['systemCache'] = 8, '8 MB'

        # 6. Packaging & Interconnect
        if 'packaging' not in d:
            if 'Ultra' in chip: d['packaging'] = 'UltraFusion (2.5 TB/s)'
            elif 'A' in chip: d['packaging'] = 'InFO-PoP'
            else: d['packaging'] = 'Apple SiP'

        # 7. GPU Hardware Features & Ray Tracing
        d['rayTracing'] = any(x in chip for x in ['M3', 'M4', 'M5', 'M6', 'A17 Pro', 'A18', 'A19', 'A20'])

        # 8. Neural Engine (NPU) TOPS
        if 'neuralEngineCores' not in d:
            if 'Ultra' in chip: d['neuralEngineCores'] = 32
            else: d['neuralEngineCores'] = 16

        if 'aneTops' not in d:
            if 'A15' in chip: d['aneTops'] = 15.8
            elif 'A16' in chip: d['aneTops'] = 17.0
            elif 'A17' in chip or 'A18' in chip: d['aneTops'] = 35.0
            elif 'A19' in chip: d['aneTops'] = 38.0
            elif 'A20' in chip: d['aneTops'] = 45.0
            elif 'M1 Ultra' in chip: d['aneTops'] = 22.0
            elif 'M1' in chip: d['aneTops'] = 11.0
            elif 'M2 Ultra' in chip: d['aneTops'] = 31.6
            elif 'M2' in chip: d['aneTops'] = 15.8
            elif 'M3 Ultra' in chip: d['aneTops'] = 36.0
            elif 'M3' in chip: d['aneTops'] = 18.0
            elif 'M4' in chip: d['aneTops'] = 38.0
            elif 'M5 Ultra' in chip: d['aneTops'] = 90.0
            elif 'M5' in chip: d['aneTops'] = 45.0
            elif 'M6' in chip: d['aneTops'] = 55.0
            else: d['aneTops'] = 16.0

        # Update specs text to be comprehensive and rich for searching
        d['specs'] = (
            f"Apple {chip} @ {clock} GHz "
            f"({d['coreConfig']} CPU cores, {gpu_cores} GPU cores, "
            f"{d['systemCache']} SLC, {d['memoryBusWidth']} {d['memoryType']}), "
            f"{bw} GB/s, {d['processNode']}"
        )

        enriched.append(d)

    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(enriched, f, indent=2, ensure_ascii=False)

    import os
    os.makedirs('public', exist_ok=True)
    with open('public/data.json', 'w', encoding='utf-8') as f:
        json.dump(enriched, f, indent=2, ensure_ascii=False)

    print(f"Successfully enriched {len(enriched)} items and saved to data.json & public/data.json")

if __name__ == '__main__':
    enrich()
