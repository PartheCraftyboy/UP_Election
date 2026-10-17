import fs from 'fs';
import { voronoi } from '@turf/voronoi';
import intersect from '@turf/intersect';
import bbox from '@turf/bbox';
import { point, featureCollection } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

console.log("Loading UP boundary...");
const upGeoJson = JSON.parse(fs.readFileSync('/tmp/uttar-pradesh.geojson', 'utf8'));
const upFeature = upGeoJson.features[0];
const bounds = bbox(upFeature);

console.log("Generating 403 points inside UP...");
const points = [];
let attempts = 0;
while (points.length < 403 && attempts < 100000) {
    attempts++;
    const x = Math.random() * (bounds[2] - bounds[0]) + bounds[0];
    const y = Math.random() * (bounds[3] - bounds[1]) + bounds[1];
    const pt = point([x, y]);
    if (booleanPointInPolygon(pt, upFeature)) {
        points.push(pt);
    }
}

const ptsCollection = featureCollection(points);
const voronoiPolygons = voronoi(ptsCollection, { bbox: bounds });

console.log("Clipping to UP boundary...");
const clipped = [];
voronoiPolygons.features.forEach((vPoly) => {
    if (vPoly && vPoly.geometry) {
        try {
            const intersection = intersect(featureCollection([vPoly, upFeature]));
            if (intersection) {
                clipped.push(intersection);
            }
        } catch(e) {}
    }
});

console.log(`Clipped ${clipped.length} regions.`);

const tsData = fs.readFileSync('src/data/upConstituencies.ts', 'utf8');
const regex = /acNumber:\s*(\d+).*?name:\s*"([^"]+)"/gs;
const constituencies = [];
let match;
while ((match = regex.exec(tsData)) !== null) {
    constituencies.push({
        ac_no: parseInt(match[1]),
        ac_name: match[2]
    });
}

const finalFeatures = clipped.map((feat, i) => {
    const cData = constituencies[i] || { ac_no: i + 1, ac_name: `Constituency ${i + 1}` };
    return {
        type: "Feature",
        properties: {
            AC_NO: cData.ac_no,
            AC_NAME: cData.ac_name
        },
        geometry: feat.geometry
    };
});

fs.writeFileSync('public/up-constituencies.geojson', JSON.stringify({
    type: "FeatureCollection",
    features: finalFeatures
}));

console.log("Done! Created public/up-constituencies.geojson");
