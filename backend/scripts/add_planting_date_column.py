import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def add_column():
    try:
        # Connect to your postgres DB
        conn = psycopg2.connect(DATABASE_URL)
        
        # Open a cursor to perform database operations
        cur = conn.cursor()
        
        # Execute a command: this creates a new table
        print("Checking if 'planting_date' column exists...")
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='market_prices' AND column_name='planting_date';")
        
        if cur.fetchone():
            print("Column 'planting_date' already exists.")
        else:
            print("Adding 'planting_date' column to 'market_prices' table...")
            cur.execute("ALTER TABLE market_prices ADD COLUMN planting_date DATE;")
            conn.commit()
            print("Column added successfully!")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_column()
