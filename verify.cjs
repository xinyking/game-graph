const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const D=JSON.parse(fs.readFileSync(path.join(__dirname,'dist/data.json'),'utf8'));
const engine=require('./dist/graph-engine.js');
const mapEngine=require('./dist/map-layout.js');
const byId=new Map(D.nodes.map(n=>[n.id,n]));
const geographic=mapEngine.layout(D),cities=new Map();
for(const n of D.nodes){
  assert(n.attributes?.length>=5,'every node has structured attributes');
  if(!n.geo){assert.equal(n.kind,'investor');assert(n.locationNote);continue;}
  assert(n.geo,'every node has explicit geographic basis');
  assert(Number.isFinite(n.geo.lat)&&Math.abs(n.geo.lat)<=90);
  assert(Number.isFinite(n.geo.lon)&&Math.abs(n.geo.lon)<=180);
  assert(D.sources[n.geo.source],'location evidence exists');
  assert(n.geo.coordinateSource.startsWith('https://'),'coordinate evidence exists');
  const expected=mapEngine.project(n.geo.lon,n.geo.lat),actual=geographic.get(n.id);
  assert.equal(actual.x,expected.x,'no display offset from longitude');
  assert.equal(actual.y,expected.y,'no display offset from latitude');
  if(cities.has(n.geo.cityId)){assert.deepEqual(expected,cities.get(n.geo.cityId),'same city must share exactly one point');}else cities.set(n.geo.cityId,expected);
  if(n.kind==='game'){const parent=byId.get(n.geo.relatedOrganization);assert(parent&&parent.kind!=='game');assert.equal(n.geo.cityId,parent.geo.cityId);assert(n.geo.basis.includes('游戏不是地理机构'));}
}
assert.equal(byId.get('sony').geo.country,'美国');assert.equal(byId.get('sony').region,'北美');assert.equal(byId.get('sony').geo.cityId,'5392423');
assert.equal(byId.get('hoyo').geo.country,'新加坡');assert.equal(byId.get('mihoyo').geo.city,'上海');
assert.equal(byId.get('digital').geo.cityId,'6058560');assert(byId.get('digital').geo.lon<-80,'Canadian London, not UK London');
assert.equal(byId.get('nexon').geo.city,'东京');assert(byId.get('valve').geo.lat>47,'Bellevue WA, not Nebraska');
assert(D.nodes.filter(n=>n.kind==='company').length>=37,'expanded company coverage');
const ids=new Set(D.nodes.map(n=>n.id));assert.equal(ids.size,D.nodes.length,'unique node IDs');
const edgeIds=new Set();for(const e of D.edges){assert(ids.has(e.a)&&ids.has(e.b),'edge endpoints exist');assert.notEqual(e.a,e.b);assert(D.sources[e.source],'edge evidence exists');assert(!edgeIds.has(e.id),'unique edges');edgeIds.add(e.id);}
const positions=engine.layout(D),again=engine.layout(D);for(const n of D.nodes){const p=positions.get(n.id);assert(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.equal(p.x,again.get(n.id).x);assert.equal(p.y,again.get(n.id).y);}
const crossCompanyGraph={nodes:[{id:'a',kind:'company',group:'a'},{id:'b',kind:'company',group:'b'},{id:'g',kind:'game',group:'a'}],edges:[{a:'a',b:'g',kind:'develop'},{a:'b',b:'g',kind:'publish'}]};
const crossPositions=engine.layout(crossCompanyGraph);
for(const e of crossCompanyGraph.edges){const a=crossPositions.get(e.a),b=crossPositions.get(e.b);assert(Math.hypot(a.x-b.x,a.y-b.y)<200,'cross-company relations participate in springs');}
const tencent=engine.shortestPath(D.nodes,D.edges,'tencent','lol');assert.deepEqual(tencent.nodes,['tencent','riot','lol']);
const cross=engine.shortestPath(D.nodes,D.edges,'from','bandai');assert.deepEqual(cross.nodes,['from','elden','bandai']);assert.equal(cross.edges[0].kind,'develop');assert.equal(cross.edges[1].kind,'publish');
assert(!D.edges.some(e=>e.a==='bandai'&&e.b==='from'&&e.kind==='member'),'publisher is not owner');
assert.equal(engine.shortestPath(D.nodes,D.edges,'science','valve'),null);
assert.deepEqual(engine.shortestPath(D.nodes,D.edges,'riot','riot').nodes,['riot']);
assert.equal(engine.shortestPath(D.nodes,D.edges,'missing','riot'),null);
assert.equal(engine.shortestPath(D.nodes,D.edges.filter(e=>!['member','control','invest'].includes(e.kind)),'tencent','lol'),null);
const capitalEdges=D.edges.filter(e=>['control','invest'].includes(e.kind));
assert(capitalEdges.length>=15);
for(const e of capitalEdges){assert(e.asOf&&e.status&&e.temporalNote);assert(e.percentage===null||Number.isFinite(e.percentage)&&e.percentage>0&&e.percentage<=100);assert.notEqual(byId.get(e.b).kind,'game');}
const shared=engine.shortestPath(D.nodes,capitalEdges,'epic','remedy');assert.deepEqual(shared.nodes,['epic','tencenthold','remedy']);
assert.equal(capitalEdges.find(e=>e.a==='tencenthold'&&e.b==='from').kind,'invest');
assert.equal(capitalEdges.find(e=>e.a==='kadokawa'&&e.b==='from').kind,'control');
assert(!D.edges.some(e=>e.kind==='member'&&e.a==='sony'&&e.b==='from'),'minority shareholding does not imply ownership');
assert(D.nodes.filter(n=>n.kind==='game').length>=110);
assert(D.nodes.filter(n=>n.kind==='game').every(n=>n.genre&&n.description.length>10&&D.sources[n.descriptionSource]));
console.log(`PASS: ${D.nodes.length} nodes / ${D.edges.length} edges / ${Object.keys(D.sources).length} sources; all node attributes, game descriptions, dated capital edges, common-shareholder paths, geographic references, deterministic layout and path regressions.`);
