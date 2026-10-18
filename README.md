# UP27

Election intelligence terminal for the 2027 Uttar Pradesh Vidhan Sabha, and
the landing page in front of it.

    frontend/     the app: Vite, React 19, Tailwind 4
      public/     the processed artwork the page actually loads
      src/data/   the datasets, including mlas2026.ts generated from data/
    data/         source data. uttar_pradesh_mlas_2026.csv is the roll call
                  for all 403 seats and the source of src/data/mlas2026.ts;
                  india_youth_employment_education.csv is national, not UP
    scripts/      python helpers: the map and tree scrapes, and
                  fetch_mla_photos.py which pulls member portraits from
                  Wikidata and Commons
    source/       raw artwork and reference footage, NOT tracked: these are
                  the originals the public/ assets were made from
    .tastemaker/  the design system's style lock and decision log

## Running it

    cd frontend && npm install && npm run dev

## Docs

- `docs/TUNING.md` every dial on the landing page and what it does
- `docs/DATA.md` what is measured, what is estimated, and the licensing of
  the member portraits

## Regenerating the roll call

`frontend/src/data/mlas2026.ts` is generated from the CSV in `data/`. The
file's own header documents its fields and which of them are estimates: the
source's economy and rating columns are marked GUESS, so they size drawings
and are labelled as estimates, never printed as fact.
