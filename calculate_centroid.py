import json

with open('backend/app/static/Lereng_Wonosobo.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Calculate overall bounds and centroid
all_lats = []
all_lngs = []
zones = {}

for feature in data['features']:
    props = feature.get('properties', {})
    kemiringan = props.get('Kemiringan', 'unknown')
    geom = feature.get('geometry', {})
    
    if geom.get('type') == 'MultiPolygon':
        for polygon in geom['coordinates']:
            for ring in polygon:
                for coord in ring:
                    all_lngs.append(coord[0])
                    all_lats.append(coord[1])
    elif geom.get('type') == 'Polygon':
        for ring in geom['coordinates']:
            for coord in ring:
                all_lngs.append(coord[0])
                all_lats.append(coord[1])

if all_lats and all_lngs:
    overall_lat = sum(all_lats) / len(all_lats)
    overall_lng = sum(all_lngs) / len(all_lngs)
    
    print(f"Overall GeoJSON Centroid:")
    print(f"  lat: {overall_lat:.4f}")
    print(f"  lng: {overall_lng:.4f}")
    
    print(f"\nMin/Max coordinates:")
    print(f"  lat range: {min(all_lats):.4f} to {max(all_lats):.4f}")
    print(f"  lng range: {min(all_lngs):.4f} to {max(all_lngs):.4f}")
    
    print(f"\nTotal coordinates parsed: {len(all_lats)}")
