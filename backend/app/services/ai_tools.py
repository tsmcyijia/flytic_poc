# Flytic v2 更新版: 真實 Amadeus 查詢 + 總時長 + 台灣時區
import os, json
from datetime import datetime
import pytz
from amadeus import Client

def get_amadeus():
    return Client(client_id=os.getenv("AMADEUS_CLIENT_ID"), client_secret=os.getenv("AMADEUS_CLIENT_SECRET"))

def parse_duration(dur):
    import re
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?", dur)
    return (int(m.group(1) or 0)*60 + int(m.group(2) or 0)) if m else 0

def search_flights(origin, destination, depart_date, return_date=None, adults=1):
    ama = get_amadeus()
    tz = pytz.timezone("Asia/Taipei")
    params = dict(originLocationCode=origin, destinationLocationCode=destination, departureDate=depart_date, adults=adults, max=5)
    if return_date: params["returnDate"] = return_date
    try:
        resp = ama.shopping.flight_offers_search.get(**params)
        flights = []
        for o in resp.data:
            segs = []
            total_fly = 0
            first_dep, last_arr = None, None
            for it in o.get("itineraries", []):
                for s in it.get("segments", []):
                    dep = datetime.fromisoformat(s["departure"]["at"].replace("Z","+00:00")).astimezone(tz)
                    arr = datetime.fromisoformat(s["arrival"]["at"].replace("Z","+00:00")).astimezone(tz)
                    dur = s.get("duration","PT0H0M")
                    segs.append(dict(origin=s["departure"]["iataCode"], destination=s["arrival"]["iataCode"],
                                     departure=dep.strftime("%Y-%m-%d %H:%M"), arrival=arr.strftime("%Y-%m-%d %H:%M"),
                                     carrier=s.get("carrierCode"), flightNumber=s.get("number"), duration=dur))
                    total_fly += parse_duration(dur)
                    if not first_dep: first_dep = dep
                    last_arr = arr
            total_trip = (last_arr - first_dep).total_seconds()/60 if first_dep and last_arr else total_fly
            flights.append(dict(origin=origin, destination=destination, departure=first_dep.strftime("%Y-%m-%d %H:%M"),
                                arrival=last_arr.strftime("%Y-%m-%d %H:%M"), segments=segs, price=o["price"]["total"],
                                currency=o["price"]["currency"], total_flight_minutes=total_fly,
                                total_trip_minutes=total_trip))
        return json.dumps({"flights":flights})
    except Exception as e:
        return json.dumps({"flights":[], "error":str(e)})
