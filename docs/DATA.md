# The data, and what is true in it

This page shows figures about real politicians, so it matters which numbers
are measured, which are estimated, and which are neither.

## The roll call

`data/uttar_pradesh_mlas_2026.csv` is the source of truth for the 18th Vidhan
Sabha. `frontend/src/data/mlas2026.ts` is generated from it: 403 typed rows,
AC 1 to 403 in order, so a strand's index is its AC number minus one.

The house as the file records it:

| Party | Seats |
|---|---|
| BJP | 258 |
| SP | 99 |
| AD(S) | 13 |
| RLD | 9 |
| SBSP | 6 |
| NISHAD | 5 |
| IND | 3 |
| INC | 2 |
| JD(L) | 2 |
| AD(K) | 1 |
| Vacant | 5 |

Vacant seats are drawn in neutral grey and read "Vacant" in the tray. They
are not given a party.

`joined` is the date the sitting member entered the house, so by-election
winners carry their own date rather than the 2022 general.

## Offices

Read from the CSV's `Notes` column, not hardcoded:

| Rank | Who | Count |
|---|---|---|
| 1 | Chief Minister | 1 |
| 2 | Deputy Chief Minister, Speaker | 2 |
| 3 | Cabinet Minister, Leader of the Opposition | 12 |
| 4 | Minister of State, independent charge | 10 |
| 5 | Minister of State | 17 |

That column also holds notes that are not offices (deaths, defections,
"Rebel"). Those score nothing.

## What is estimated

Two columns in the source are marked `GUESS` in their own header:

- `District_Economy_Est_Rs_Crore_GUESS`
- `District_Rating_1to10_GUESS`

Both are imported, because they are good enough to size a drawing. Neither is
printed as a fact: the economy figure only sets strand length in the ring,
and the rating is shown out of five with the tray's footer reading
"rating est.".

`popPerSeat` is also an estimate. It divides a district's 2026 projection
evenly across its seats, which real seats never are.

The tray prints the **district** population, labelled as such. It is not the
seat's electorate, and the two are different things.

## A numbering mismatch worth knowing

The older sample dataset in `frontend/src/data/upConstituencies.ts` numbers
its seats **differently from the real roll**. It puts Gorakhpur Urban at AC
343; the roll says 322. Lucknow Cantt is 171 there and 175 in truth.

Anything that joins that sample to real data by `acNumber` will attach the
wrong member. The Devanagari names were doing exactly that and now key by
name instead. If you add a feature that crosses the two, check it.

The sample also generates 392 of its 403 rows, with names like
"MLA Rae Bareli 215" and arithmetic elector counts. Those were being shown as
people before the CSV landed. Prefer `mlas2026.ts` for anything factual.

## Portraits

`scripts/fetch_mla_photos.py` fetches member portraits from **Wikidata** and
**Wikimedia Commons**:

    python3 scripts/fetch_mla_photos.py            # fetch what is missing
    python3 scripts/fetch_mla_photos.py --force    # refetch everything
    python3 scripts/fetch_mla_photos.py --limit 20 # try the first 20

It writes `frontend/public/mla/NNN.png`, square and 160px, named by
constituency number, plus `CREDITS.json` recording the Wikidata item, the
Commons file, the author and the licence for every portrait taken.

Rules it follows:

- Only Commons images, because they carry a licence that permits reuse. The
  portraits so far are CC BY-SA 4.0.
- A match must be a **human** who is a **politician** on Wikidata, which
  rejects most same-name collisions. The QID is recorded so any match can be
  checked by hand.
- A seat with no match is left without one. It is never filled with someone
  else's face.
- Two requests per member, with backoff on Wikimedia's 429.

**Coverage is partial and always will be.** Most backbench MLAs have no free
portrait anywhere. Where there is none, the tray draws the member's initials
in their party colour.

Fuller coverage would mean the UP Vidhan Sabha's own member pages or ECI
affidavit photos. Both need a licensing decision first, since neither is free
to reuse by default.
