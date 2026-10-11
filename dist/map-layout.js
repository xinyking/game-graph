(function(){
  'use strict';
  // Fixed city reference coordinates in the same projection as world-map.js.
  function project(lon,lat){return {x:(lon+180)*7,y:(85-lat)*7};}
  function layout(data){return new Map(data.nodes.filter(n=>n.geo).map(n=>[n.id,{...n,...project(n.geo.lon,n.geo.lat)}]));}
  const api={layout,project};
  if(typeof window!=='undefined')window.MapLayout=api;
  if(typeof module!=='undefined')module.exports=api;
})();
