"""
Quick script to check how many records exist for each commodity
"""
from app.db import get_db
from app.models.market_model import MarketPrice

db = next(get_db())

commodities = [
    'Kentang', 'Bawang Merah', 'Cabai Merah', 'Cabai Rawit', 
    'Wortel', 'Kubis', 'Tomat', 'Bawang Daun', 'Strawberry', 'Kopi Arabika'
]

print("=" * 60)
print("📊 Database Records Count")
print("=" * 60)

total = 0
for commodity in commodities:
    count = db.query(MarketPrice).filter(
        MarketPrice.commodity_name.ilike(f"%{commodity}%")
    ).count()
    print(f"{commodity:20} : {count:4} records")
    total += count

print("=" * 60)
print(f"{'TOTAL':20} : {total:4} records")
print("=" * 60)

# Show date range
if total > 0:
    oldest = db.query(MarketPrice).order_by(MarketPrice.date.asc()).first()
    newest = db.query(MarketPrice).order_by(MarketPrice.date.desc()).first()
    print(f"\nDate Range: {oldest.date} to {newest.date}")
