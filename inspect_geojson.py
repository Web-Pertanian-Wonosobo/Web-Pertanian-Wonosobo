import json

with open('backend/app/static/Lereng_Wonosobo.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Check first 3 features
for i, feature in enumerate(data['features'][:3]):
    print(f"Feature {i}:")
    props = feature.get("properties", {})
    print(f"  Properties keys: {list(props.keys())}")
    print(f"  Geometry type: {feature.get('geometry', {}).get('type')}")
    for k, v in list(props.items())[:8]:
        print(f"    {k}: {v}")
    print()

print(f"\nTotal features: {len(data['features'])}")
