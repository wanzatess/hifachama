import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

# Debugging Output
print("DEBUG (supabase_client.py) - SUPABASE_URL:", os.getenv("SUPABASE_URL"))
print("DEBUG (supabase_client.py) - SUPABASE_ANON_KEY:", "Loaded" if os.getenv("SUPABASE_ANON_KEY") else "Not Loaded")

# Fetch credentials (Correct way)
SUPABASE_URL = os.getenv("SUPABASE_URL")  
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")  

# Ensure credentials exist
if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Supabase credentials are missing!")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


