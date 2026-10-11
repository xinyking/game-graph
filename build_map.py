"""Prepare Natural Earth public-domain land outlines for offline Canvas use."""
import json
from pathlib import Path
root=Path(__file__).parent
source=root/'assets/source/world-land.geojson'
data=json.loads(source.read_text(encoding='utf-8'))
rings=[]
for feature in data['features']:
    geometry=feature['geometry']
    polygons=geometry['coordinates'] if geometry['type']=='MultiPolygon' else [geometry['coordinates']]
    for polygon in polygons:
        for ring in polygon:
            rings.append([[round((lon+180)*7,2),round((85-lat)*7,2)] for lon,lat in ring])
(root/'dist/world-map.js').write_text('window.WORLD_LAND='+json.dumps(rings,separators=(',',':'))+';\n',encoding='utf-8')
print(f'{len(rings)} land rings')
