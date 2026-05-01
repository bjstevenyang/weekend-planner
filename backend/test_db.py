from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = "postgresql://postgres:weekend-plannerdemima@db.mffcbcnjfcofxdbydary.supabase.co:5432/postgres"
DATABASE_URL = "postgresql://postgres.mffcbcnjfcofxdbydary:weekend-plannerdemima@aws-1-ca-central-1.pooler.supabase.com:5432/postgres"
print(f"Connecting to: {DATABASE_URL[:50]}...")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print(f"✅ Connection successful!")
        print(f"PostgreSQL version: {version}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
