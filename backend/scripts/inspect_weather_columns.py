from sqlalchemy import text
from app.db import engine

query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='weather_data' ORDER BY ordinal_position;"

with engine.connect() as conn:
    result = conn.execute(text(query))
    rows = result.fetchall()

print('columns for table weather_data:')
for name, dtype in rows:
    print(f"- {name} : {dtype}")
