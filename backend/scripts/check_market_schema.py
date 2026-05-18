import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def check_schema():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='market_prices';")
        columns = cur.fetchall()
        print("Columns in 'market_prices':")
        for col in columns:
            print(f" - {col[0]}: {col[1]}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
