import json
from collections import defaultdict

with open('backend/app/static/Lereng_Wonosobo.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Group by kecamatan
kecamatan_data = defaultdict(lambda: {'villages': set(), 'coords': []})

for feature in data['features']:
    props = feature.get('properties', {})
    kec = props.get('kecamatan', '')
    des = props.get('desa', '')
    
    if kec and des:
        kecamatan_data[kec]['villages'].add(des)
        
        # Get centroid dari geometry
        geom = feature.get('geometry', {})
        if geom.get('type') == 'Polygon':
            coords = geom['coordinates'][0]
            lngs = [c[0] for c in coords]
            lats = [c[1] for c in coords]
            center_lng = sum(lngs) / len(lngs)
            center_lat = sum(lats) / len(lats)
            kecamatan_data[kec]['coords'].append((center_lat, center_lng))
        elif geom.get('type') == 'MultiPolygon':
            coords = geom['coordinates'][0][0]
            lngs = [c[0] for c in coords]
            lats = [c[1] for c in coords]
            center_lng = sum(lngs) / len(lngs)
            center_lat = sum(lats) / len(lats)
            kecamatan_data[kec]['coords'].append((center_lat, center_lng))

# Output format untuk JavaScript
print("// Extracted from GeoJSON - accurate coordinates")
print("const wonosoboData = {")
for kec in sorted(kecamatan_data.keys()):
    if kecamatan_data[kec]['coords']:
        avg_lat = sum(c[0] for c in kecamatan_data[kec]['coords']) / len(kecamatan_data[kec]['coords'])
        avg_lng = sum(c[1] for c in kecamatan_data[kec]['coords']) / len(kecamatan_data[kec]['coords'])
        villages = sorted(list(kecamatan_data[kec]['villages']))
        print(f"  '{kec}': {{")
        print(f"    coordinates: {{ lat: {avg_lat:.4f}, lng: {avg_lng:.4f} }},")
        print(f"    villages: {villages}")
        print(f"  }},")
print("};")
