#!/usr/bin/env python3
"""Fetch freely-licensed MLA portraits from Wikipedia/Wikimedia Commons into
mla_photo/, named so link_photos.py picks them up.

    pip install requests
    python3 fetch_photos.py

Only downloads images whose licence is actually free, and records the licence
and author for every file in mla_photo/CREDITS.csv. Resumable: files already
present are skipped, so you can stop and re-run it.
"""
import csv, os, re, sys, time
import requests

CSV, DIR = "uttar_pradesh_mlas_2026.csv", "mla_photo"
API = "https://en.wikipedia.org/w/api.php"
UA = "UP-MLA-table/1.0 (personal research project; contact: you@example.com)"
PAUSE = 0.5          # be polite; Wikimedia asks for serial, unhurried requests

FREE = ("cc-by", "cc-by-sa", "cc0", "public domain", "pd-", "attribution")

s = requests.Session()
s.headers["User-Agent"] = UA

def slug(n):
    return re.sub(r"[^A-Za-z0-9]+", "_", n).strip("_") or "Unknown"

def lookup(name, constituency):
    """Find a page for this MLA and return (file_url, licence, author, page)."""
    r = s.get(API, params={
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": f'{name} MLA Uttar Pradesh', "gsrlimit": 3,
        "prop": "pageimages|imageinfo", "piprop": "original",
    }, timeout=30).json()
    for page in (r.get("query", {}).get("pages") or {}).values():
        orig = page.get("original", {}).get("source")
        if not orig:
            continue
        # pull licence metadata for that file
        fn = "File:" + orig.rsplit("/", 1)[-1]
        m = s.get(API, params={
            "action": "query", "format": "json", "titles": fn,
            "prop": "imageinfo", "iiprop": "extmetadata|url",
        }, timeout=30).json()
        for p in (m.get("query", {}).get("pages") or {}).values():
            info = (p.get("imageinfo") or [{}])[0]
            meta = info.get("extmetadata", {})
            lic = (meta.get("LicenseShortName", {}).get("value") or "").lower()
            author = re.sub("<[^>]+>", "", meta.get("Artist", {}).get("value") or "").strip()
            if any(f in lic for f in FREE):
                return info.get("url", orig), lic, author, page.get("title", "")
        return None            # found a photo but it is not freely licensed
    return None

os.makedirs(DIR, exist_ok=True)
rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
have = {int(m.group(1)) for f in os.listdir(DIR)
        if (m := re.match(r"(\d{1,3})", f)) and not f.endswith(".png.placeholder")}

credits, got, skipped = [], 0, 0
for r in rows:
    no, name = int(r["Constituency_No"]), r["MLA_Name"]
    if name == "VACANT":
        continue
    target = os.path.join(DIR, f"{no:03d}_{slug(name)}.jpg")
    if os.path.exists(target):
        continue
    try:
        hit = lookup(name, r["Constituency"])
    except Exception as e:
        print(f"  {no:3d} {name}: error {e}", file=sys.stderr); hit = None
    time.sleep(PAUSE)
    if not hit:
        skipped += 1
        continue
    url, lic, author, page = hit
    img = s.get(url, timeout=60)
    if img.ok and img.headers.get("content-type", "").startswith("image/"):
        open(target, "wb").write(img.content)
        credits.append({"Constituency_No": no, "MLA_Name": name, "File": target,
                        "Licence": lic, "Author": author, "Source_Page": page})
        got += 1
        print(f"  {no:3d} {name}: {lic}")
    time.sleep(PAUSE)

if credits:
    newfile = not os.path.exists(f"{DIR}/CREDITS.csv")
    with open(f"{DIR}/CREDITS.csv", "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(credits[0].keys()))
        if newfile:
            w.writeheader()
        w.writerows(credits)

print(f"\ndownloaded {got}, no free image found for {skipped}")
print("placeholders remain for the rest -- re-run link_photos.py to rebuild")
