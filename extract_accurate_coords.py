import json
from collections import defaultdict

with open('backend/app/static/Lereng_Wonosobo.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Dictionary untuk store grid codes dan coordinate ranges
grid_zones = defaultdict(lambda: {'lats': [], 'lngs': []})

# Extract semua coordinate dari setiap feature
for feature in data['features']:
    props = feature.get('properties', {})
    grid_code = props.get('gridcode', 0)
    kelas_lere = props.get('Kelas_Lere', '')
    geom = feature.get('geometry', {})
    
    if geom.get('type') == 'MultiPolygon':
        for polygon in geom['coordinates']:
            for ring in polygon:
                for coord in ring:
                    grid_zones[grid_code]['lngs'].append(coord[0])
                    grid_zones[grid_code]['lats'].append(coord[1])
    elif geom.get('type') == 'Polygon':
        for ring in geom['coordinates']:
            for coord in ring:
                grid_zones[grid_code]['lngs'].append(coord[0])
                grid_zones[grid_code]['lats'].append(coord[1])

# Print untuk setiap zone
print("Grid Zone Centroids dari GeoJSON:")
print("=" * 60)
for grid_code in sorted(grid_zones.keys()):
    zone = grid_zones[grid_code]
    if zone['lats'] and zone['lngs']:
        center_lat = sum(zone['lats']) / len(zone['lats'])
        center_lng = sum(zone['lngs']) / len(zone['lngs'])
        min_lat = min(zone['lats'])
        max_lat = max(zone['lats'])
        min_lng = min(zone['lngs'])
        max_lng = max(zone['lngs'])
        
        print(f"\nGrid Code {grid_code}:")
        print(f"  Center: {center_lat:.4f}, {center_lng:.4f}")
        print(f"  Lat range: {min_lat:.4f} to {max_lat:.4f}")
        print(f"  Lng range: {min_lng:.4f} to {max_lng:.4f}")
        print(f"  Total coords: {len(zone['lats'])}")

# Now divide into 15 regions based on lat/lng distribution
print("\n\n" + "=" * 60)
print("Distribution for 15 Kecamatan:")
print("=" * 60)

# Get overall bounds
all_lats = []
all_lngs = []
for zone in grid_zones.values():
    all_lats.extend(zone['lats'])
    all_lngs.extend(zone['lngs'])

if all_lats and all_lngs:
    lat_min, lat_max = min(all_lats), max(all_lats)
    lng_min, lng_max = min(all_lngs), max(all_lngs)
    
    lat_range = lat_max - lat_min
    lng_range = lng_max - lng_min
    
    print(f"\nOverall bounds:")
    print(f"  Lat: {lat_min:.4f} to {lat_max:.4f} (range: {lat_range:.4f})")
    print(f"  Lng: {lng_min:.4f} to {lng_max:.4f} (range: {lng_range:.4f})")
    
    # Create grid 5x3 = 15 zones
    kecamatan_names = [
        'Wonosobo', 'Kejajar', 'Garung', 'Kertek', 'Sapuran',
        'Kalikajar', 'Kaliwiro', 'Leksono', 'Sukoharjo', 'Kalibawang',
        'Mojotengah', 'Watumalang', 'Wadaslintang', 'Kepil', 'Selomerto'
    ]
    
    # Divide by lat (north-south) 3 zones, lng (west-east) 5 zones
    lat_step = lat_range / 3
    lng_step = lng_range / 5
    
    print(f"\nGrid step: lat={lat_step:.4f}, lng={lng_step:.4f}")
    
    # Create grid coordinates
    idx = 0
    for lat_i in range(3):  # north to south
        for lng_i in range(5):  # west to east
            if idx < len(kecamatan_names):
                # Center of this cell
                cell_lat = lat_max - (lat_i + 0.5) * lat_step  # from north to south
                cell_lng = lng_min + (lng_i + 0.5) * lng_step  # from west to east
                
                kec_name = kecamatan_names[idx]
                print(f"  '{kec_name}': {{ coordinates: {{ lat: {cell_lat:.4f}, lng: {cell_lng:.4f} }} }},")
                idx += 1
