import sys
from sqlalchemy import text
from app.db import engine

if len(sys.argv) < 2:
    print('Usage: python run_sql_via_sqlalchemy.py <sql_file>')
    sys.exit(1)

p = sys.argv[1]
with open(p, 'r', encoding='utf-8') as f:
    sql = f.read()

with engine.begin() as conn:
    conn.execute(text(sql))

print('SQL executed from', p)
