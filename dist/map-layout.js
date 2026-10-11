(function(){
  'use strict';
  // Fixed city reference coordinates in the same projection as world-map.js.
  function project(lon,lat){return {x:(lon+180)*7,y:(85-lat)*7};}
  function layout(data){return new Map(data.nodes.filter(n=>n.geo).map(n=>[n.id,{...n,...project(n.geo.lon,n.geo.lat)}]));}
  function clusters(nodes,points,zoom){
    const groups=[];
    for(const node of [...nodes].sort((a,b)=>a.id.localeCompare(b.id))){
      const p=points.get(node.id);if(!p)continue;
      let group=groups.find(g=>Math.hypot(g.x-p.x,g.y-p.y)*zoom<56);
      if(!group){group={x:p.x,y:p.y,members:[]};groups.push(group);}
      group.members.push(node);
      group.x=group.members.reduce((sum,n)=>sum+points.get(n.id).x,0)/group.members.length;
      group.y=group.members.reduce((sum,n)=>sum+points.get(n.id).y,0)/group.members.length;
    }
    return groups.map(g=>({...g,key:g.members[0].id}));
  }
  const api={layout,project,clusters};
  if(typeof window!=='undefined')window.MapLayout=api;
  if(typeof module!=='undefined')module.exports=api;
})();
