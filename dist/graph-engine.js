/* Game Atlas Canvas engine.
 * Project-specific deterministic distance relaxation and component packing.
 * Each connected component minimizes graph-distance stress without velocity
 * integration. MusicalGraph was a visual inspiration, not a code dependency.
 */
(function(){
  'use strict';
  function layout(data){
    return relationshipLayout(data);
  }
  function relationshipLayout(data){
    const adjacency=new Map(data.nodes.map(n=>[n.id,[]]));
    for(const e of data.edges){adjacency.get(e.a)?.push(e.b);adjacency.get(e.b)?.push(e.a);}
    const seen=new Set(),components=[],points=new Map();
    for(const node of data.nodes){
      if(seen.has(node.id))continue;
      const queue=[node.id];seen.add(node.id);
      for(let i=0;i<queue.length;i++)for(const next of adjacency.get(queue[i]))if(!seen.has(next)){seen.add(next);queue.push(next);}
      components.push(queue);
    }
    const byId=new Map(data.nodes.map(n=>[n.id,n]));
    components.sort((a,b)=>b.length-a.length);
    const boxes=components.map(ids=>{
      ids.sort((a,b)=>adjacency.get(b).length-adjacency.get(a).length);
      const root=ids[0],depth=new Map([[root,0]]),queue=[root];
      for(let i=0;i<queue.length;i++)for(const next of adjacency.get(queue[i]))if(!depth.has(next)){depth.set(next,depth.get(queue[i])+1);queue.push(next);}
      const levels=new Map();for(const id of ids){const d=depth.get(id);if(!levels.has(d))levels.set(d,[]);levels.get(d).push(id);}
      for(const [d,level] of levels)level.forEach((id,i)=>{const angle=i/level.length*Math.PI*2+d*.7,r=d*145;points.set(id,{...byId.get(id),x:Math.cos(angle)*r,y:Math.sin(angle)*r,vx:0,vy:0});});
      const list=ids.map(id=>points.get(id)),valid=new Set(ids),edges=data.edges.filter(e=>valid.has(e.a)&&valid.has(e.b));
      // Build shortest graph distances once, then perform pairwise projections.
      // A cooling schedule makes the result repeatable and limits oscillation.
      const constraints=[];
      for(let i=0;i<ids.length;i++){
        const distances=new Map([[ids[i],0]]),frontier=[ids[i]];
        for(let q=0;q<frontier.length;q++)for(const id of adjacency.get(frontier[q])){
          if(!distances.has(id)){distances.set(id,distances.get(frontier[q])+1);frontier.push(id);}
        }
        for(let j=i+1;j<ids.length;j++){
          const hops=distances.get(ids[j]);
          constraints.push({i,j,length:130*Math.pow(hops,.72),weight:1/(hops*hops)});
        }
      }
      for(let sweep=0;sweep<240;sweep++){
        const rate=.32*(1-sweep/240)+.025;
        for(const pair of constraints){
          const left=list[pair.i],right=list[pair.j];
          let dx=right.x-left.x,dy=right.y-left.y,actual=Math.hypot(dx,dy);
          if(actual<.00001){const angle=(pair.i+pair.j)*2.399963;dx=Math.cos(angle);dy=Math.sin(angle);actual=1;}
          const correction=(actual-pair.length)*rate*pair.weight/2;
          const shiftX=dx/actual*correction,shiftY=dy/actual*correction;
          left.x+=shiftX;left.y+=shiftY;right.x-=shiftX;right.y-=shiftY;
        }
      }
      const minX=Math.min(...list.map(n=>n.x)),maxX=Math.max(...list.map(n=>n.x)),minY=Math.min(...list.map(n=>n.y)),maxY=Math.max(...list.map(n=>n.y));
      return {list,minX,minY,width:Math.max(180,maxX-minX+145),height:Math.max(150,maxY-minY+110)};
    });
    const placed=[];
    for(const box of boxes){
      let x=0,y=0;
      for(let i=0;i<16000;i++){
        const angle=i*2.399963229728653,r=18*Math.sqrt(i);
        x=Math.cos(angle)*r*1.15-box.width/2;y=Math.sin(angle)*r*.9-box.height/2;
        if(!placed.some(b=>x<b.x+b.width+24&&x+box.width+24>b.x&&y<b.y+b.height+24&&y+box.height+24>b.y))break;
      }
      placed.push({x,y,width:box.width,height:box.height});
      for(const n of box.list){n.x+=x-box.minX+65;n.y+=y-box.minY+45;n.vx=n.vy=0;}
    }
    return points;
  }
  function shortestPath(nodes,edges,start,end){
    const valid=new Set(nodes.map(n=>n.id));
    if(!valid.has(start)||!valid.has(end))return null;
    const adjacency=new Map(nodes.map(n=>[n.id,[]]));
    edges.forEach(e=>{if(valid.has(e.a)&&valid.has(e.b)){adjacency.get(e.a).push({id:e.b,edge:e});adjacency.get(e.b).push({id:e.a,edge:e});}});
    const queue=[start],seen=new Set([start]),previous=new Map();
    for(let i=0;i<queue.length;i++){
      const id=queue[i];if(id===end)break;
      for(const next of adjacency.get(id)){if(!seen.has(next.id)){seen.add(next.id);previous.set(next.id,{id,edge:next.edge});queue.push(next.id);}}
    }
    if(!seen.has(end))return null;
    const pathNodes=[end],pathEdges=[];
    while(pathNodes[0]!==start){const p=previous.get(pathNodes[0]);pathNodes.unshift(p.id);pathEdges.unshift(p.edge);}
    return {nodes:pathNodes,edges:pathEdges};
  }
  const api={layout,shortestPath};
  if(typeof window!=='undefined')window.GraphEngine=api;
  if(typeof module!=='undefined')module.exports=api;
})();
