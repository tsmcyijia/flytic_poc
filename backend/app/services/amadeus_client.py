
import os
from amadeus import Client
def get_amadeus():
    cid = os.getenv("AMADEUS_CLIENT_ID"); cs = os.getenv("AMADEUS_CLIENT_SECRET")
    if not cid or not cs: return None
    try: return Client(client_id=cid, client_secret=cs)
    except Exception: return None
