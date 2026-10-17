import urllib.request
import json
import urllib.parse
try:
    url = "https://api.github.com/search/repositories?q=india+constituencies+geojson"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for item in data.get('items', []):
            print(item['full_name'], item['html_url'])
except Exception as e:
    print(e)
