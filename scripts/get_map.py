import urllib.request
import json
try:
    url = "https://raw.githubusercontent.com/datameet/maps/master/assembly-constituencies/UP.geojson"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print("Found UP.geojson")
except Exception:
    print("UP.geojson not found")
