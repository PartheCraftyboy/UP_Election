#!/usr/bin/env python3
"""Fetch real MLA portraits from Wikidata and Wikimedia Commons.

    python3 scripts/fetch_mla_photos.py            # fetch what is missing
    python3 scripts/fetch_mla_photos.py --force    # refetch everything
    python3 scripts/fetch_mla_photos.py --limit 20 # try the first 20 only

Writes frontend/public/mla/NNN.png, square and 160px, named by constituency
number, plus CREDITS.json recording the Wikidata item, the Commons file, the
author and the licence for every portrait taken.

Only Commons images are used, because they carry a licence that permits reuse.
Coverage will be partial: many members have no free portrait, and a seat with
no match is simply left without one rather than filled with someone else's
face. Matching requires the Wikidata item to be a human who is a politician,
which rejects most of the same-name collisions; the QID is recorded so any
match can be checked by hand.

Needs ImageMagick on PATH. No third-party Python packages.
"""
import csv, json, os, re, subprocess, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV = os.path.join(ROOT, "data", "uttar_pradesh_mlas_2026.csv")
OUT = os.path.join(ROOT, "frontend", "public", "mla")
CREDITS = os.path.join(OUT, "CREDITS.json")
SIZE = 160
PAUSE = 0.7                       # be a polite client
RETRIES = 5
UA = "UP27-election-terminal/1.0 (local research project; contact: repo owner)"

HUMAN, POLITICIAN = "Q5", "Q82955"
FORCE = "--force" in sys.argv
LIMIT = next((int(a.split("=")[1]) for a in sys.argv if a.startswith("--limit=")), None)
if "--limit" in sys.argv:
    i = sys.argv.index("--limit")
    if i + 1 < len(sys.argv):
        LIMIT = int(sys.argv[i + 1])


def get(url):
    """Fetch with backoff: Wikimedia answers 429 when pushed, and says wait."""
    delay = PAUSE
    for attempt in range(RETRIES):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or attempt == RETRIES - 1:
                raise
            wait = float(e.headers.get("Retry-After") or 0) or delay * 2
            time.sleep(min(wait, 30))
            delay *= 2


def get_json(url):
    return json.loads(get(url).decode("utf-8"))


POLITICAL = re.compile(r"politic|legislative assembly|\bmla\b|minister|member of parliament", re.I)


def search_candidates(name):
    """Search once, and keep only the hits that read as a politician.

    The search result carries a description, so most same-name collisions are
    rejected here without spending a second request on them."""
    url = ("https://www.wikidata.org/w/api.php?action=wbsearchentities"
           "&search=%s&language=en&uselang=en&type=item&limit=8&format=json"
           % urllib.parse.quote(name))
    hits = get_json(url).get("search", [])
    keep = [h["id"] for h in hits if POLITICAL.search(h.get("description") or "")]
    # If nothing described itself as political, still try the top hit: many
    # items carry no description at all.
    return keep or [h["id"] for h in hits[:2]]


def entities(qids):
    """One request for up to 50 items, instead of one request each."""
    if not qids:
        return {}
    url = ("https://www.wikidata.org/w/api.php?action=wbgetentities&ids=%s"
           "&props=claims|descriptions&languages=en&format=json"
           % urllib.parse.quote("|".join(qids[:50])))
    return get_json(url).get("entities", {})


def claim_ids(ent, prop):
    out = []
    for c in ent.get("claims", {}).get(prop, []):
        v = c.get("mainsnak", {}).get("datavalue", {}).get("value", {})
        if isinstance(v, dict) and "id" in v:
            out.append(v["id"])
    return out


def claim_str(ent, prop):
    for c in ent.get("claims", {}).get(prop, []):
        v = c.get("mainsnak", {}).get("datavalue", {}).get("value")
        if isinstance(v, str):
            return v
    return None


def find_portrait(name):
    """Return (qid, commons filename) for a politician of this name, or None."""
    qids = search_candidates(name)
    time.sleep(PAUSE)
    found = entities(qids)
    for qid in qids:
        ent = found.get(qid, {})
        if HUMAN not in claim_ids(ent, "P31"):
            continue
        desc = (ent.get("descriptions", {}).get("en", {}) or {}).get("value", "")
        if POLITICIAN not in claim_ids(ent, "P106") and not POLITICAL.search(desc):
            continue
        img = claim_str(ent, "P18")
        if img:
            return qid, img
    return None


def licence_of(filename):
    url = ("https://commons.wikimedia.org/w/api.php?action=query&titles=File:%s"
           "&prop=imageinfo&iiprop=extmetadata&format=json"
           % urllib.parse.quote(filename))
    pages = get_json(url).get("query", {}).get("pages", {})
    for p in pages.values():
        meta = (p.get("imageinfo") or [{}])[0].get("extmetadata", {})
        strip = lambda s: re.sub(r"<[^>]+>", "", s or "").strip()
        return {
            "author": strip(meta.get("Artist", {}).get("value")),
            "licence": strip(meta.get("LicenseShortName", {}).get("value")),
            "credit": strip(meta.get("Credit", {}).get("value")),
        }
    return {}


def square(src, dst):
    subprocess.run(
        ["magick", src, "-auto-orient", "-gravity", "north",
         "-resize", "%dx%d^" % (SIZE, SIZE), "-extent", "%dx%d" % (SIZE, SIZE),
         "-strip", dst],
        check=True, capture_output=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    credits = {}
    if os.path.exists(CREDITS):
        credits = json.load(open(CREDITS))

    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    if LIMIT:
        rows = rows[:LIMIT]

    got = skipped = missed = 0
    for r in rows:
        ac = int(r["Constituency_No"])
        name = r["MLA_Name"].strip()
        dst = os.path.join(OUT, "%03d.png" % ac)

        if not name or name.lower() == "vacant":
            continue
        if os.path.exists(dst) and not FORCE:
            skipped += 1
            continue

        try:
            hit = find_portrait(name)
            time.sleep(PAUSE)
            if not hit:
                missed += 1
                print("  --  %3d %-32s no free portrait" % (ac, name[:32]))
                continue
            qid, filename = hit
            url = ("https://commons.wikimedia.org/wiki/Special:FilePath/%s?width=600"
                   % urllib.parse.quote(filename))
            tmp = os.path.join(OUT, "_tmp")
            open(tmp, "wb").write(get(url))
            square(tmp, dst)
            os.remove(tmp)
            credits["%03d" % ac] = dict(
                ac=ac, name=name, wikidata=qid, file=filename, **licence_of(filename))
            got += 1
            print("  ok  %3d %-32s %s" % (ac, name[:32], qid))
            json.dump(credits, open(CREDITS, "w"), indent=1, ensure_ascii=False)
            time.sleep(PAUSE)
        except Exception as e:
            missed += 1
            print("  !!  %3d %-32s %s" % (ac, name[:32], e))

    json.dump(credits, open(CREDITS, "w"), indent=1, ensure_ascii=False)
    print("\nfetched %d, already had %d, no portrait %d, of %d rows"
          % (got, skipped, missed, len(rows)))


if __name__ == "__main__":
    main()
