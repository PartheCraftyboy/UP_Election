import urllib.request
import json
try:
    url = "https://api.github.com/repos/GaneshKathar/india-geojson/git/trees/master?recursive=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for item in data.get('tree', []):
            if 'uttar' in item['path'].lower():
                print(item['path'])
except Exception as e:
    print(e)
