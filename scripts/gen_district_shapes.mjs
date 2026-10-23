import fs from 'fs';
const g = JSON.parse(fs.readFileSync('frontend/public/up-constituencies.geojson','utf8'));
// Painted-artwork registration, measured from up-map.png's largest alpha blob.
const ART = 2048, BX = 262, BY = 251, BW = 1674, BH = 1594;
let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
const each=c=>{if(typeof c[0]==='number'){x0=Math.min(x0,c[0]);x1=Math.max(x1,c[0]);y0=Math.min(y0,c[1]);y1=Math.max(y1,c[1]);}else c.forEach(each);};
g.features.forEach(f=>each(f.geometry.coordinates));
const toArt = ([lon,lat]) => [
  (BX + (lon-x0)/(x1-x0)*BW) / ART,
  (BY + (y1-lat)/(y1-y0)*BH) / ART
];
// Douglas-Peucker on the normalised ring.
const dp = (pts, tol) => {
  if (pts.length < 3) return pts;
  let max = 0, idx = 0;
  const [ax,ay] = pts[0], [bx,by] = pts[pts.length-1];
  const dx = bx-ax, dy = by-ay, len = Math.hypot(dx,dy) || 1e-9;
  for (let i=1;i<pts.length-1;i++){
    const d = Math.abs((pts[i][0]-ax)*dy - (pts[i][1]-ay)*dx)/len;
    if (d>max){max=d;idx=i;}
  }
  if (max <= tol) return [pts[0], pts[pts.length-1]];
  return [...dp(pts.slice(0,idx+1),tol).slice(0,-1), ...dp(pts.slice(idx),tol)];
};
// A closed ring has pts[0] === pts[last], so a single DP pass measures every
// point against a zero-length baseline and collapses the ring to two points.
// Splitting it at the point farthest from the start gives two open arcs.
const dpRing = (ring, tol) => {
  const pts = ring.slice(0, -1);
  if (pts.length < 4) return ring;
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0]-pts[0][0], pts[i][1]-pts[0][1]);
    if (d > fd) { fd = d; far = i; }
  }
  const a = dp(pts.slice(0, far + 1), tol);
  const b = dp([...pts.slice(far), pts[0]], tol);
  return [...a.slice(0, -1), ...b];
};
const TOL = Number(process.argv[2] ?? 0.0006);
// The geometry layer still carries the pre-rename district names (Allahabad
// for Prayagraj, Kheri for Lakhimpur Kheri, Mahrajganj for Maharajganj), so
// each district takes the name its own seats carry in the member roll. The AC
// numbering itself agrees across the two: 391 of 403 seat names match exactly
// and the twelve that differ are spellings of the same seat.
const roll = fs.readFileSync('frontend/src/data/mlas2026.ts','utf8');
const rollDistrict = new Map(
  [...roll.matchAll(/\{ ac: (\d+), seat: "[^"]*", district: "([^"]*)"/g)]
    .map(m => [Number(m[1]), m[2]])
);
const byDistrict = new Map();
const unplaced = [];
let acCount = 0;
for (const f of g.features) {
  const ac = f.properties.AC_NO;
  // The ROLL decides which district a seat is in, not the geometry layer.
  // That layer still carries pre-rename names (Allahabad for Prayagraj,
  // Kheri for Lakhimpur Kheri) and it mislabels AC 92, Bah, as Rajasthan's
  // Dhaulpur, which would split Agra into two districts of the same name.
  const name = rollDistrict.get(ac);
  if (!name) { unplaced.push(ac); continue; }
  const polys = f.geometry.type==='Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  // Outer ring only: holes do not exist in this layer and would cost bytes.
  // Keeping the unsimplified ring where simplification would drop a seat
  // below a drawable shape: four constituencies are small enough that the
  // tolerance erases them, and a district with a hole in it misses hovers.
  const rings = polys
    .map(p => {
      const full = p[0].map(toArt);
      const cut = dpRing(full, TOL);
      return cut.length >= 4 ? cut : full;
    })
    .filter(r => r.length >= 4);
  if (!rings.length) continue;
  acCount += 1;
  if (!byDistrict.has(name)) byDistrict.set(name, []);
  byDistrict.get(name).push({ ac, name: f.properties.AC_NAME, rings });
}
const r3 = v => Number(v.toFixed(4));
const districts = [...byDistrict.entries()].map(([name, acs]) => ({
  name,
  seats: acs.map(a=>a.ac).sort((p,q)=>p-q),
  rings: acs.flatMap(a=>a.rings.map(r=>r.flatMap(p=>[r3(p[0]), r3(p[1])])))
}));
districts.sort((a,b)=>a.name.localeCompare(b.name));
const pts = districts.reduce((n,d)=>n+d.rings.reduce((m,r)=>m+r.length/2,0),0);
const out = `/**
 * District outlines for the painted locator map, traced from the Election
 * Commission's 403 constituency polygons in \`public/up-constituencies.geojson\`
 * and grouped into districts by \`mlas2026.ts\`, which is what says where a
 * seat sits. The geometry layer's own district names are not used: they are
 * pre-rename (Allahabad, Kheri, Mahrajganj) and one of them puts AC 92, Bah,
 * in Rajasthan's Dhaulpur, which would split Agra in two.
 *
 * COORDINATES are fractions of the MAP ARTWORK, not of the screen: (0, 0) is
 * the top left of \`up-map.png\` and (1, 1) its bottom right, so they survive
 * any change to MAP_WIDTH and ride along with the map's own offsets. The fit
 * comes from the artwork's largest opaque blob, measured at ${BW}x${BH}+${BX}+${BY}
 * in the 2048 square, matched to the geometry's own bounds
 * (lon ${x0.toFixed(3)}..${x1.toFixed(3)}, lat ${y0.toFixed(3)}..${y1.toFixed(3)}).
 *
 * A district is kept as its constituencies' rings rather than a true union:
 * filling them all with no stroke between reads as one district, and a point
 * is in the district when it is in any of them. That avoids shipping a
 * polygon-union library for a hover test.
 *
 * Simplified at ${TOL} (Douglas-Peucker, in the same fractional units), which
 * is well under a pixel at the sizes this map is drawn.
 */
export interface DistrictShape {
  name: string;
  /** AC numbers in this district, ascending. */
  seats: number[];
  /** Flat [x0, y0, x1, y1, ...] rings, in artwork fractions. */
  rings: number[][];
}

export const DISTRICT_SHAPES: DistrictShape[] = ${JSON.stringify(districts)};
`;
fs.writeFileSync('frontend/src/data/upDistrictShapes.ts', out);
if (unplaced.length) throw new Error('seats missing from the roll: ' + unplaced.join(','));
console.log(`districts ${districts.length}  constituencies ${acCount}  points ${pts}  tol ${TOL}`);
