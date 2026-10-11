(function(){
  'use strict';
  const D=window.GAME_GRAPH, E=window.GraphEngine;
  const $=id=>document.getElementById(id);
  const canvas=$('graph'),ctx=canvas.getContext('2d');
  let points=E.layout(D);
  const byId=new Map(D.nodes.map(n=>[n.id,n]));
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  const landPath=new Path2D();
  for(const ring of window.WORLD_LAND){ring.forEach(([x,y],i)=>i?landPath.lineTo(x,y):landPath.moveTo(x,y));landPath.closePath();}
  let phase=0;
  let cityGroups=new Map();
  const COLORS={company:'#e8c578',studio:'#92b9b0',game:'#989cbb',member:'#92b9b0',develop:'#989cbb',publish:'#d2ac62',investor:'#bd97dc',control:'#bd97dc',invest:'#d9a1bd'};
  const LABELS={company:'厂商 / 品牌',studio:'工作室 / 团队',game:'游戏 / 系列',member:'组织归属',develop:'开发',publish:'发行',investor:'股东 / 控股主体',control:'控制关系',invest:'参股投资'};
  const S={mode:'stars',selected:null,hover:null,tab:'graph',path:null,region:'all',kinds:new Set(['company','studio','game','investor']),relations:new Set(['control','invest','member','develop','publish']),view:{x:0,y:0,zoom:1},width:0,height:0,labels:[]};
  let filteredNodes=[],filteredEdges=[],visibleNodes=[],visibleEdges=[];
  const escape=v=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeUrl=u=>/^https?:\/\//.test(u)?escape(u):'#';
  const link=(url,text,cls='')=>`<a class="${cls}" href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${escape(text)} ↗</a>`;
  const sourceHtml=e=>{const src=D.sources[e.source];return link(src.url,'查看来源')+(src.dated?` · ${escape(src.dated)}`:'');};
  function announce(text){$('announce').textContent=text;}
  $('hero-stats').innerHTML=`${D.nodes.filter(n=>n.kind==='company').length} 家厂商 <i>/</i> ${D.nodes.filter(n=>n.kind==='studio').length} 个工作室 <i>/</i> ${D.nodes.filter(n=>n.kind==='game').length} 款游戏与系列 <i>/</i> ${D.nodes.filter(n=>n.kind==='investor').length} 个股东主体`;
  function attributesHtml(n){return `<section class="node-attributes"><h3>节点属性</h3><dl>${(n.attributes||[]).map(a=>`<div><dt>${escape(a.label)}</dt><dd>${escape(a.value)}</dd></div>`).join('')}</dl></section>`;}
  function capitalLabel(e){return (e.kind==='control'?'控制':'参股')+(e.percentage!==null&&e.percentage!==undefined?' '+e.percentage.toFixed(2).replace(/\.00$/,'')+'%':'');}
  function geoHtml(n){const g=n.geo;if(!g)return '';return `<section class="geo-detail"><span class="eyebrow">${n.kind==='game'?'关联组织城市':'机构地点'}</span><h3>${escape(g.country)} · ${escape(g.city)}</h3><p>${escape(g.basis)}<br>${Math.abs(g.lat).toFixed(4)}°${g.lat>=0?'N':'S'} / ${Math.abs(g.lon).toFixed(4)}°${g.lon>=0?'E':'W'}</p><p class="connection-note">${escape(g.precision)}${g.note?'。'+escape(g.note):''}${g.relatedOrganization?'。对应机构：'+escape(byId.get(g.relatedOrganization).name):''}</p><div class="geo-links">${link(D.sources[g.source].url,'地点依据')}${link(g.coordinateSource,'城市坐标来源')}</div></section>`;}
  function queryNodes(){
    const q=$('search').value.trim().toLocaleLowerCase();
    return filteredNodes.filter(n=>q?`${n.name} ${n.aliases}`.toLocaleLowerCase().includes(q):["company","investor"].includes(n.kind));
  }
  function directory(){
    const q=$('search').value.trim(),list=queryNodes();
    $('list-title').textContent=q?'搜索结果':'厂商与股东';$('list-count').textContent=list.length;
    $('directory').innerHTML=list.length?list.map(n=>`<button role="listitem" class="directory-item ${S.selected===n.id?'selected':''}" data-node="${escape(n.id)}"><i class="dot ${n.kind}"></i><span>${escape(n.name)}</span><small>${q?LABELS[n.kind].split(' / ')[0]:n.region}</small></button>`).join(''):`<div class="directory-empty">${q?'没有找到该名称，可尝试英文名或别名。':'没有符合条件的厂商；可搜索工作室或游戏。'}</div>`;
  }
  function refresh(fit=true){
    filteredNodes=D.nodes.filter(n=>S.kinds.has(n.kind)&&(S.region==='all'||S.region===n.region)&&(S.mode!=='map'||n.geo));
    const ids=new Set(filteredNodes.map(n=>n.id));
    filteredEdges=D.edges.filter(e=>S.relations.has(e.kind)&&ids.has(e.a)&&ids.has(e.b));
    if(S.selected&&!ids.has(S.selected)){S.selected=null;document.body.classList.remove('detail-open');}
    let scope=null;
    if(S.path){scope=new Set(S.path.nodes);visibleEdges=S.path.edges.filter(e=>filteredEdges.some(x=>x.id===e.id));}
    else if(S.selected){
      scope=new Set([S.selected]);let frontier=[S.selected];
      const depth=byId.get(S.selected).kind==='company'?2:1;
      for(let level=0;level<depth;level++){
        const next=[];
        for(const id of frontier)for(const e of filteredEdges){const peer=e.a===id?e.b:e.b===id?e.a:null;if(peer&&!scope.has(peer)){scope.add(peer);next.push(peer);}}
        frontier=next;
      }
      visibleEdges=filteredEdges.filter(e=>scope.has(e.a)&&scope.has(e.b));
    }else visibleEdges=filteredEdges;
    visibleNodes=filteredNodes.filter(n=>!scope||scope.has(n.id));
    $('empty').classList.toggle('hidden',visibleNodes.length>0);
    $('map-title').textContent=S.path?'关系路径':S.selected?byId.get(S.selected).name:S.mode==='map'?'游戏的世界坐标':'全球游戏星图';
    $('clear-focus').classList.toggle('hidden',!S.selected&&!S.path);
    const counts={company:0,studio:0,game:0,investor:0};visibleNodes.forEach(n=>counts[n.kind]++);
    $('counts').innerHTML=Object.entries(counts).map(([k,c])=>`<span class="count"><b>${c}</b>${LABELS[k].split(' / ')[0]}</span>`).join('')+`<span class="count"><b>${visibleEdges.length}</b>关系</span>`;
    directory();if(fit)fitView();else draw();
    if(S.tab==='graph')detail();
  }
  function fitView(){
    if(!S.width||!S.height)return;
    if(!visibleNodes.length){draw();return;}
    const ps=S.mode==='map'&&!S.selected&&!S.path&&S.region==='all'?[{x:0,y:0},{x:2520,y:1120}]:visibleNodes.map(n=>points.get(n.id));
    const minX=Math.min(...ps.map(n=>n.x)),maxX=Math.max(...ps.map(n=>n.x));
    const minY=Math.min(...ps.map(n=>n.y)),maxY=Math.max(...ps.map(n=>n.y));
    const availableW=Math.max(100,S.width-135),availableH=Math.max(100,S.height-265);
    S.view.zoom=Math.min(1.35,availableW/Math.max(220,maxX-minX),availableH/Math.max(180,maxY-minY));
    S.view.zoom=Math.max(.1,S.view.zoom);S.view.x=(minX+maxX)/2;S.view.y=(minY+maxY)/2;draw();
  }
  function screen(n){return {x:(n.x-S.view.x)*S.view.zoom+S.width/2,y:(n.y-S.view.y)*S.view.zoom+S.height/2+38};}
  function world(x,y){return {x:(x-S.width/2)/S.view.zoom+S.view.x,y:(y-S.height/2-38)/S.view.zoom+S.view.y};}
  function radius(n){return n.kind==='investor'?8:n.kind==='company'?6:n.kind==='studio'?4:3;}
  function isBright(n){return !S.hover||n.id===S.hover||visibleEdges.some(e=>(e.a===S.hover&&e.b===n.id)||(e.b===S.hover&&e.a===n.id));}
  function draw(){
    const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,S.width,S.height);
    if(S.mode==='map'){
      ctx.save();ctx.translate(S.width/2-S.view.x*S.view.zoom,S.height/2+38-S.view.y*S.view.zoom);ctx.scale(S.view.zoom,S.view.zoom);
      ctx.globalAlpha=1;ctx.fillStyle='#1f2425';ctx.strokeStyle='#8e9a9860';ctx.lineWidth=.7/S.view.zoom;ctx.fill(landPath);ctx.stroke(landPath);
      ctx.strokeStyle='#ffffff09';ctx.lineWidth=.5/S.view.zoom;
      for(let x=0;x<=2520;x+=210){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1120);ctx.stroke();}
      for(let y=0;y<=1120;y+=210){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(2520,y);ctx.stroke();}
      ctx.restore();
    }
    // Sparse coordinate grid, restrained enough to keep connections legible.
    ctx.fillStyle='#8b8375';for(let i=0;i<100;i++){const x=((i*7919+61)%1009)/1009*S.width,y=((i*3571+37)%997)/997*S.height;ctx.globalAlpha=i%7===0?.35:.13;ctx.beginPath();ctx.arc(x,y,i%7===0?.8:.45,0,Math.PI*2);ctx.fill();}
    for(const e of visibleEdges){
      const a=screen(points.get(e.a)),b=screen(points.get(e.b));
      const bright=!S.hover||e.a===S.hover||e.b===S.hover;
      ctx.globalAlpha=bright?((S.selected||S.path)? .8 : S.mode==='map'?.19:.68):.1;
      ctx.strokeStyle=COLORS[e.kind];ctx.lineWidth=['control','invest'].includes(e.kind)?1.8:e.kind==='member'?1.45:1.1;ctx.setLineDash(e.kind==='publish'?[5,3]:e.kind==='invest'?[7,4]:[]);
      const bend=S.mode==='map'?Math.min(65,Math.hypot(b.x-a.x,b.y-a.y)*.18):0;
      const control={x:(a.x+b.x)/2,y:(a.y+b.y)/2-bend};
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(control.x,control.y,b.x,b.y);ctx.stroke();
      if(S.mode==='stars'&&(S.selected||S.path)&&bright){
        const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
        if(Math.hypot(b.x-a.x,b.y-a.y)>65&&mx>40&&mx<S.width-40&&my>170&&my<S.height-95){
          const text=['control','invest'].includes(e.kind)?capitalLabel(e):{member:'旗下团队',develop:'开发',publish:'发行'}[e.kind];
          ctx.save();ctx.globalAlpha=.92;ctx.font='9px "Microsoft YaHei",sans-serif';const width=ctx.measureText(text).width;
          ctx.fillStyle='#111113';ctx.fillRect(mx-width/2-5,my-7,width+10,15);ctx.fillStyle=COLORS[e.kind];ctx.textAlign='center';ctx.fillText(text,mx,my+4);ctx.restore();
        }
      }
      if(!motionPreference.matches&&bright&&(S.selected||S.path||e.kind==='member')){
        const progress=(phase*.00009+visibleEdges.indexOf(e)*.137)%1;
        const t=progress,u=1-t;
        ctx.globalAlpha=.85;ctx.fillStyle=COLORS[e.kind];ctx.shadowBlur=9;ctx.shadowColor=COLORS[e.kind];ctx.beginPath();ctx.arc(u*u*a.x+2*u*t*control.x+t*t*b.x,u*u*a.y+2*u*t*control.y+t*t*b.y,1.6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      }
      if((S.mode==='stars'||S.selected||S.path)&&bright){
        const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len>25){const ux=dx/len,uy=dy/len;const ex=b.x-ux*(radius(byId.get(e.b))+5),ey=b.y-uy*(radius(byId.get(e.b))+5);ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(ex-ux*5-uy*2,ey-uy*5+ux*2);ctx.lineTo(ex,ey);ctx.lineTo(ex-ux*5+uy*2,ey-uy*5-ux*2);ctx.stroke();}
      }
    }
    ctx.globalAlpha=1;ctx.setLineDash([]);
    cityGroups=new Map();
    for(const n of visibleNodes){if(!n.geo||S.mode==='map'&&n.kind==='game'&&!S.selected&&!S.path)continue;const key=n.geo.cityId;if(!cityGroups.has(key))cityGroups.set(key,[]);cityGroups.get(key).push(n);}
    const cityNodes=[...cityGroups].map(([cityId,ns])=>{const organization=ns.find(n=>n.kind==='company')||ns.find(n=>n.kind==='studio')||ns[0];return {...organization,cityId,name:organization.geo.city+(ns.length>1?' · '+ns.length:''),members:ns};});
    const ordered=(S.mode==='map'?cityNodes:[...visibleNodes]).sort((a,b)=>({investor:0,company:1,studio:2,game:3}[a.kind]-{investor:0,company:1,studio:2,game:3}[b.kind]));
    for(const n of ordered){
      const p=screen(points.get(n.id)),r=radius(n);ctx.globalAlpha=isBright(n)?1:.23;ctx.fillStyle=COLORS[n.kind];
      if(n.id===S.selected||n.id===S.hover||n.members?.some(m=>m.id===S.selected)){ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(p.x,p.y,16,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
      ctx.shadowColor=COLORS[n.kind];ctx.shadowBlur=n.kind==='company'?18+(!motionPreference.matches?Math.sin(phase*.0013+ordered.indexOf(n)) *5:0):8;
      if(n.kind==='investor'){ctx.beginPath();ctx.moveTo(p.x,p.y-r);ctx.lineTo(p.x+r,p.y);ctx.lineTo(p.x,p.y+r);ctx.lineTo(p.x-r,p.y);ctx.closePath();ctx.fill();}else if(n.kind==='company'){ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#e8c57855';ctx.beginPath();ctx.arc(p.x,p.y,r+5,0,Math.PI*2);ctx.stroke();}else{ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;
    }
    ctx.globalAlpha=1;S.labels=[];
    // Label priority and collision filtering keep overview names readable.
    const priority=[...ordered].sort((a,b)=>(b.id===S.hover?1:0)-(a.id===S.hover?1:0)||(b.id===S.selected?1:0)-(a.id===S.selected?1:0));
    for(const n of priority){
      if(S.mode==='map'&&n.kind==='game'&&!S.selected&&!S.path&&S.view.zoom<.65&&n.id!==S.hover)continue;
      if(S.mode==='map'&&n.kind==='studio'&&!S.selected&&!S.path&&S.view.zoom<.3&&n.id!==S.hover)continue;
      const p=screen(points.get(n.id));if(p.x<0||p.x>S.width||p.y<155||p.y>S.height-96)continue;
      const size=n.kind==='company'?12:11;ctx.font=`${n.kind==='company'?500:400} ${size}px "Microsoft YaHei",sans-serif`;
      const w=ctx.measureText(n.name).width,y=p.y+radius(n)+18;
      const x=Math.max(8,Math.min(S.width-w-8,p.x-w/2));
      const bounds={x:x-4,y:y-size-2,w:w+8,h:size+8};
      if(w>S.width-16)continue;
      if(S.labels.some(l=>bounds.x<l.x+l.w&&bounds.x+bounds.w>l.x&&bounds.y<l.y+l.h&&bounds.y+bounds.h>l.y)&&n.id!==S.hover&&n.id!==S.selected)continue;
      ctx.globalAlpha=isBright(n)?1:.25;ctx.strokeStyle='#0a0a0c';ctx.lineWidth=4;ctx.lineJoin='round';ctx.strokeText(n.name,x,y);
      ctx.fillStyle=n.kind==='company'?'#e7ddc8':'#a6a6af';ctx.fillText(n.name,x,y);S.labels.push({...bounds,text:n.name,tx:x,ty:y,size,color:ctx.fillStyle,id:S.mode==='map'?'city:'+n.cityId:n.id});
    }
    ctx.globalAlpha=1;$('zoom-level').value=Math.round(S.view.zoom*100)+'%';
  }
  function detail(){
    if(!S.selected){
      $('detail-content').innerHTML=`<div class="detail-label">A MAP, NOT A RANKING</div><h2>游戏背后，<br>是谁在创造？</h2><p>从熟悉的游戏走向开发团队，再看它们与厂商的连接。</p><div class="detail-meta"><span>${D.nodes.length} 个节点</span><span>${D.edges.length} 条有来源关系</span></div><h3>选择一个起点</h3>${[['tencenthold','共同股东：腾讯的控股与投资'],['sonygroup','索尼集团的资本连接'],['tencent','腾讯与它的开发团队'],['sony','PlayStation 的工作室'],['elden','谁开发、谁发行艾尔登法环？'],['science','从黑神话找到游戏科学']].map(([id,t])=>`<button class="featured" data-node="${id}">${escape(t)}<span>↗</span></button>`).join('')}<h3>如何阅读图谱</h3><p class="explainer">金色光点是厂商，青色与紫灰色光点是团队和作品，紫色菱形是股东主体。连接颜色表达关系类型；点击节点可查看方向与证据。</p><p class="explainer">这是精选样本，不是完整产业地图。组织归属可能省略中间主体，历史报告来源会单独标注。</p>`;return;
    }
    const n=byId.get(S.selected),es=filteredEdges.filter(e=>e.a===n.id||e.b===n.id);
    const sections=['control','invest','member','develop','publish'].map(kind=>{
      const items=es.filter(e=>e.kind===kind);if(!items.length)return '';
      return `<h3>${LABELS[kind]} <span style="font-weight:400;color:#8b938c">${items.length}</span></h3>`+items.map(e=>{
        const outbound=e.a===n.id,peer=byId.get(outbound?e.b:e.a);
        const verb=['control','invest'].includes(kind)?capitalLabel(e)+' · '+(outbound?'被投资 / 控制对象':'股东 / 控制主体'):kind==='member'?(outbound?'旗下 / 组织成员':'归属组织'):kind==='develop'?(outbound?'开发作品':'开发方'):(outbound?'发行作品':'发行方');
        return `<div class="connection"><button class="connection-name" data-node="${peer.id}">${escape(peer.name)}</button><div class="connection-meta"><span>${verb}</span><span>${sourceHtml(e)}</span></div>${e.asOf?`<p class="capital-date">报告期 ${escape(e.asOf)} · ${escape(e.status)}${e.via?'<br>经由 '+escape(e.via):''}</p>`:''}${e.note?`<p class="connection-note">${escape(e.note)}</p>`:''}${e.temporalNote?`<p class="connection-note">${escape(e.temporalNote)}</p>`:''}</div>`;
      }).join('');
    }).join('');
    $('detail-content').innerHTML=`<div class="detail-label"><i class="dot ${n.kind}"></i>${LABELS[n.kind]}</div><h2>${escape(n.name)}</h2><p class="alias">${escape(n.aliases)}</p><div class="detail-meta"><span>${escape(n.region)}</span><span>${es.length} 条直接关系</span></div><p>${escape(n.description)}</p><p>${link(n.url,'官方资料')}</p>${attributesHtml(n)}${geoHtml(n)}${!n.geo?`<p>${escape(n.locationNote)}</p>`:''}${sections||'<p>当前筛选下没有直接关系。可开启其他节点或关系类型。</p>'}`;
  }
  function select(id){
    if(!byId.has(id))return;
    const n=byId.get(id);if(S.mode==='map'&&!n.geo)setMode('stars');if(!filteredNodes.some(x=>x.id===id)){resetFilters(false);}
    S.selected=id;S.path=null;setTab('graph',false);document.body.classList.add('detail-open');refresh();announce(`已选中${n.name}，显示相关节点与来源。`);
  }
  function cityView(cityId){const ns=cityGroups.get(cityId);if(!ns?.length)return;setTab('graph',false);document.body.classList.add('detail-open');const g=ns[0].geo;$('detail-content').innerHTML=`<div class="detail-label">ONE CITY, MANY CREATORS</div><h2>${escape(g.city)}</h2><p>${escape(g.country)} · 此视图 ${ns.length} 个节点共享城市参考坐标。标记保持原位，请选择机构查看对应地点与来源。</p>${ns.map(n=>`<button class="location-item" data-node="${n.id}"><span>${escape(n.name)}</span><small>${escape(n.geo.basis)}</small><b>↗</b></button>`).join('')}`;announce(g.city+'，'+ns.length+'个节点');}
  function locationsView(){setTab('sources',false);document.body.classList.add('detail-open');const ns=filteredNodes.filter(n=>n.kind!=='game'&&n.geo);$('detail-content').innerHTML=`<div class="detail-label">VERIFIED ORGANIZATION LOCATIONS</div><h2>厂商地点对照</h2><p>${ns.length} 家厂商与团队逐项对应城市坐标。机构点位固定，重叠时合并选择。游戏坐标继承关联团队，仅表达作品关系。</p><p>城市参考点不等同于办公楼地址。总部、主要工作室与官方联系城市分别注明。</p>${ns.map(n=>`<div class="location-record"><button data-node="${n.id}">${escape(n.name)} ↗</button><p>${escape(n.geo.country)} · ${escape(n.geo.city)}<br>${escape(n.geo.basis)}</p><small>${n.geo.lat.toFixed(5)}, ${n.geo.lon.toFixed(5)}</small><div>${link(D.sources[n.geo.source].url,'地点依据')}${link(n.geo.coordinateSource,'坐标')}</div></div>`).join('')}`;}
  function clear(){S.selected=null;S.path=null;S.hover=null;document.body.classList.remove('detail-open');setTab('graph',false);refresh();location.hash='';}
  function setTab(tab,render=true){
    S.tab=tab;for(const name of ['graph','path','sources']){$(name+'-tab').classList.toggle('active',name===tab);$(name+'-tab').setAttribute('aria-pressed',name===tab);}
    if(tab!=='graph')document.body.classList.add('detail-open');
    if(!render)return;if(tab==='graph')detail();else if(tab==='sources')sourcesView();else pathView();
  }
  function pathView(){
    const options=filteredNodes.map(n=>`<option value="${n.id}">${escape(n.name)}</option>`).join('');
    $('detail-content').innerHTML=`<div class="detail-label">FOLLOW A CONNECTION</div><h2>关系路径</h2><p>在当前筛选内，寻找两个节点之间的最短连接。</p><form id="path-form" class="path-form"><label for="path-start">起点</label><select id="path-start">${options}</select><label for="path-end">终点</label><select id="path-end">${options}</select><button class="primary" type="submit">查找路径 →</button></form><div id="path-result"></div><h3>读图提示</h3><p class="explainer">查询允许双向遍历，但关系含义仍按原始箭头方向展示。不存在记录的连接时，不推断隐含关系。</p>`;
    if(filteredNodes.some(n=>n.id==='from'))$('path-start').value='from';
    if(filteredNodes.some(n=>n.id==='bandai'))$('path-end').value='bandai';
  }
  function findPath(event){
    event.preventDefault();const start=$('path-start').value,end=$('path-end').value;
    const path=E.shortestPath(filteredNodes,filteredEdges,start,end);S.selected=null;S.path=path;refresh();
    if(!path){$('path-result').innerHTML='<h3>没有找到路径</h3><p>本数据集没有记录可连接的关系，也可能被筛选条件排除。没有路径不代表现实中不存在关系。</p>';announce('当前数据与筛选下没有路径。');return;}
    $('path-result').innerHTML=`<h3>${path.edges.length} 步连接</h3>`+path.nodes.map((id,i)=>`<div class="path-step"><button data-node="${id}">${escape(byId.get(id).name)}</button>${i<path.edges.length?`<small>${escape(byId.get(path.edges[i].a).name)} → ${LABELS[path.edges[i].kind]} → ${escape(byId.get(path.edges[i].b).name)}</small><small>${sourceHtml(path.edges[i])}</small>`:''}</div>`).join('');
    announce(`找到${path.edges.length}步连接。`);
  }
  function sourcesView(){
    $('detail-content').innerHTML=`<div class="detail-label">DATA & METHODOLOGY</div><h2>数据与边界</h2><p>${escape(D.meta.note)}</p><div class="detail-meta"><span>资料核对日期</span><span>${D.meta.checked}</span></div><h3>关系口径</h3><p>组织归属：内部团队或附属公司关系，详情说明是否省略中间层。开发：作品或系列的开发记录，可能有其他协作团队。发行：按来源明确的作品与地区口径。</p><p>上海米哈游与新加坡 HoYoverse 已拆开定位；微软 / Xbox 仍是业务视图。地点采用官方可核对的城市，具体口径见地点对照。股东通过控制与参股关系连接厂商；百分比仅对应各条关系的报告期。未披露比例、间接持股与附交割条件的公告分别标注，不能据此推断完整或实时股权结构。</p><h3>参考项目</h3><p>${link(D.meta.provenance.repo,'Essie363 / MusicalGraph')}</p><p class="explainer">沿用零依赖 Canvas 星图、搜索聚焦和详情面板的结构，适配了力学布局；音乐剧数据与原项目后端未接入。</p><h3>${Object.keys(D.sources).length} 个公开来源</h3>${Object.values(D.sources).map(s=>`<div class="source-item">${link(s.url,s.title)}<small>${s.dated?'来源时间：'+escape(s.dated)+' · ':''}核对：${s.checked}</small></div>`).join('')}`;
  }
  function resetFilters(render=true){
    S.region='all';$('region').value='all';S.kinds=new Set(['company','studio','game','investor']);S.relations=new Set(['control','invest','member','develop','publish']);
    document.querySelectorAll('.kinds input,.relations input').forEach(i=>i.checked=true);$('search').value='';S.path=null;S.selected=null;if(render)refresh();
  }
  function resize(){const box=canvas.getBoundingClientRect();S.width=box.width;S.height=box.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);fitView();}
  function zoom(factor,x=S.width/2,y=S.height/2+38){
    const before=world(x,y);S.view.zoom=Math.max(.1,Math.min(3,S.view.zoom*factor));const after=world(x,y);S.view.x+=before.x-after.x;S.view.y+=before.y-after.y;draw();
  }
  function local(event){const r=canvas.getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top};}
  function hit(x,y){
    for(const label of S.labels)if(x>=label.x&&x<=label.x+label.w&&y>=label.y&&y<=label.y+label.h)return label.id;
    if(S.mode==='map'){let nearest=null,distance=15;for(const [cityId,ns] of cityGroups){const p=screen(points.get(ns[0].id)),d=Math.hypot(x-p.x,y-p.y);if(d<distance){distance=d;nearest='city:'+cityId;}}return nearest;}
    let nearest=null,distance=15;for(const n of visibleNodes){const p=screen(points.get(n.id)),d=Math.hypot(x-p.x,y-p.y);if(d<distance){distance=d;nearest=n.id;}}return nearest;
  }
  const pointers=new Map();let gesture=null;
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0&&event.pointerType!=='touch')return;const p=local(event);pointers.set(event.pointerId,p);canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');$('tooltip').classList.add('hidden');
    if(pointers.size===1)gesture={start:p,last:p,moved:false,pinch:false};
    else{const [a,b]=[...pointers.values()];gesture={pinch:true,distance:Math.hypot(a.x-b.x,a.y-b.y),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},moved:true};}
  });
  canvas.addEventListener('pointermove',event=>{
    const p=local(event);if(pointers.has(event.pointerId)){
      pointers.set(event.pointerId,p);
      if(pointers.size>1){const[a,b]=[...pointers.values()],dist=Math.hypot(a.x-b.x,a.y-b.y),mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(gesture?.distance>0)zoom(dist/gesture.distance,mid.x,mid.y);S.view.x-=(mid.x-gesture.mid.x)/S.view.zoom;S.view.y-=(mid.y-gesture.mid.y)/S.view.zoom;gesture={pinch:true,distance:dist,mid,moved:true};draw();}
      else if(gesture&&!gesture.pinch){const dx=p.x-gesture.last.x,dy=p.y-gesture.last.y;S.view.x-=dx/S.view.zoom;S.view.y-=dy/S.view.zoom;if(Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>5)gesture.moved=true;gesture.last=p;draw();}
      return;
    }
    const id=hit(p.x,p.y),ns=id?.startsWith('city:')?cityGroups.get(id.slice(5)):null,hoverId=ns?ns[0].id:id;if(S.hover!==hoverId){S.hover=hoverId;draw();}canvas.style.cursor=id?'pointer':'grab';
    if(id){$('tooltip').textContent=ns?ns[0].geo.city+' · '+ns.map(n=>n.name).join(' / '):byId.get(id).name+' · '+LABELS[byId.get(id).kind];$('tooltip').classList.remove('hidden');$('tooltip').style.left=Math.min(p.x+14,Math.max(4,S.width-$('tooltip').offsetWidth-10))+'px';$('tooltip').style.top=Math.max(0,p.y-38)+'px';}else $('tooltip').classList.add('hidden');
  });
  function endPointer(event){const p=local(event),click=gesture&&!gesture.moved&&!gesture.pinch;pointers.delete(event.pointerId);if(!pointers.size){canvas.classList.remove('dragging');gesture=null;}else{const remaining=[...pointers.values()][0];gesture={start:remaining,last:remaining,moved:true,pinch:false};}if(click){const id=hit(p.x,p.y);if(id?.startsWith('city:'))cityView(id.slice(5));else if(id)select(id);else if(S.selected||S.path)clear();}}
  canvas.addEventListener('pointerup',endPointer);canvas.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);gesture=null;canvas.classList.remove('dragging');});
  canvas.addEventListener('pointerleave',()=>{if(!pointers.size){S.hover=null;$('tooltip').classList.add('hidden');draw();}});
  canvas.addEventListener('wheel',event=>{event.preventDefault();const p=local(event);zoom(Math.exp(-event.deltaY*.0015),p.x,p.y);},{passive:false});
  canvas.addEventListener('keydown',event=>{const actions={ArrowLeft:()=>S.view.x-=50/S.view.zoom,ArrowRight:()=>S.view.x+=50/S.view.zoom,ArrowUp:()=>S.view.y-=50/S.view.zoom,ArrowDown:()=>S.view.y+=50/S.view.zoom,'+':()=>zoom(1.2),'=':()=>zoom(1.2),'-':()=>zoom(1/1.2)};if(actions[event.key]){event.preventDefault();actions[event.key]();draw();}});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-node]');if(button)select(button.dataset.node);});
  $('search').addEventListener('input',directory);$('search').addEventListener('keydown',event=>{if(event.key==='Enter'){const first=queryNodes()[0];if(first)select(first.id);}});
  $('region').addEventListener('change',()=>{S.region=$('region').value;S.path=null;refresh();if(S.tab==='path')pathView();});
  for(const [selector,key] of [['.kinds input','kinds'],['.relations input','relations']])document.querySelectorAll(selector).forEach(input=>input.addEventListener('change',()=>{S[key]=new Set([...document.querySelectorAll(selector)].filter(i=>i.checked).map(i=>i.value));S.path=null;refresh();if(S.tab==='path')pathView();}));
  $('zoom-in').onclick=()=>zoom(1.25);$('zoom-out').onclick=()=>zoom(.8);$('fit').onclick=fitView;$('reset').onclick=()=>{resetFilters();clear();};$('clear-focus').onclick=clear;document.querySelector('.brand').onclick=e=>{e.preventDefault();resetFilters();clear();};
  function showGraph(){document.body.classList.add('in-graph');$('landing').classList.add('hidden');resize();}
  $('enter-graph').onclick=()=>{showGraph();setMode('stars');setTab('graph');};
  $('enter-map').onclick=()=>{showGraph();setMode('map');setTab('graph');};
  $('home-tab').onclick=()=>{document.body.classList.remove('in-graph','detail-open');$('landing').classList.remove('hidden');};
  $('locations').onclick=locationsView;
  function setMode(mode){S.mode=mode;points=mode==='map'?window.MapLayout.layout(D):E.layout(D);$('map-mode').classList.toggle('active',mode==='map');$('stars-mode').classList.toggle('active',mode==='stars');$('map-mode').setAttribute('aria-pressed',mode==='map');$('stars-mode').setAttribute('aria-pressed',mode==='stars');$('map-help').textContent=mode==='map'?'城市坐标 · 同城点击展开 · 未定位股东仅在星图展示':'点击节点查看连接 · 拖动平移 · 滚轮或双指缩放';refresh();}
  for(const [id,mode] of [['map-mode','map'],['stars-mode','stars']])$(id).onclick=()=>setMode(mode);
  for(const tab of ['graph','path','sources'])$(tab+'-tab').onclick=()=>{showGraph();setTab(tab);};
  document.addEventListener('submit',e=>{if(e.target.id==='path-form')findPath(e);});
  $('mobile-close').onclick=()=>document.body.classList.remove('detail-open');
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(document.activeElement===$('search')){$('search').value='';directory();$('search').blur();}else clear();}});
  function download(text,type,name){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);announce('已导出'+name);}
  $('export-data').onclick=()=>{const used=new Set([...visibleEdges.map(e=>e.source),...visibleNodes.flatMap(n=>[n.geo?.source,n.descriptionSource]).filter(Boolean)]);const out={meta:D.meta,nodes:visibleNodes,edges:visibleEdges,sources:Object.fromEntries([...used].map(k=>[k,D.sources[k]]))};download(JSON.stringify(out,null,2),'application/json','game-atlas-data.json');};
  $('export-svg').onclick=()=>{
    const geography=S.mode==='map'?window.WORLD_LAND.map(ring=>`<polygon points="${ring.map(([x,y])=>{const p=screen({x,y});return p.x.toFixed(2)+','+p.y.toFixed(2);}).join(' ')}" fill="#1f2425" stroke="#56615f" stroke-width=".7"/>`).join(''):'';
    const lines=visibleEdges.map(e=>{const a=screen(points.get(e.a)),b=screen(points.get(e.b)),bend=S.mode==='map'?Math.min(65,Math.hypot(b.x-a.x,b.y-a.y)*.18):0;return `<path d="M ${a.x.toFixed(2)} ${a.y.toFixed(2)} Q ${((a.x+b.x)/2).toFixed(2)} ${((a.y+b.y)/2-bend).toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}" fill="none" stroke="${COLORS[e.kind]}" stroke-opacity=".4" stroke-width="1"${e.kind==='publish'?' stroke-dasharray="3 4"':''}/>`;}).join('');
    const exportNodes=S.mode==='map'?[...cityGroups.values()].map(ns=>ns.find(n=>n.kind==='company')||ns.find(n=>n.kind==='studio')||ns[0]):visibleNodes;
    const dots=exportNodes.map(n=>{const p=screen(points.get(n.id)),r=radius(n);return `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${COLORS[n.kind]}"/>`+(n.kind==='company'?`<circle cx="${p.x}" cy="${p.y}" r="${r+5}" fill="none" stroke="#e8c57855"/>`:'');}).join('');
    const labels=S.labels.map(l=>`<text x="${l.tx}" y="${l.ty}" font-size="${l.size}" fill="${l.color}" paint-order="stroke" stroke="#0a0a0c" stroke-width="3">${escape(l.text)}</text>`).join('');
    download(`<svg xmlns="http://www.w3.org/2000/svg" width="${S.width}" height="${S.height}" viewBox="0 0 ${S.width} ${S.height}"><title>${escape($('map-title').textContent)} · 游戏厂商图谱</title><desc>${escape(D.meta.note)}</desc><defs><clipPath id="bounds"><rect width="${S.width}" height="${S.height}"/></clipPath></defs><rect width="100%" height="100%" fill="#0a0a0c"/><g clip-path="url(#bounds)">${geography}${lines}${dots}<g font-family="Microsoft YaHei,sans-serif">${labels}</g></g><rect width="100%" height="105" fill="#0a0a0c"/><text x="30" y="42" font-family="Microsoft YaHei,sans-serif" font-size="22" fill="#eee9df">${escape($('map-title').textContent)}</text><text x="30" y="71" font-family="Microsoft YaHei,sans-serif" font-size="11" fill="#96939a">游戏厂商图谱 · 核对 ${D.meta.checked} · ${visibleNodes.length} 个节点 / ${visibleEdges.length} 条关系</text></svg>`,'image/svg+xml','game-atlas.svg');
  };
  new ResizeObserver(resize).observe(canvas);refresh();
  let lastFrame=0;
  function animate(time){if(time-lastFrame>40){phase=time;lastFrame=time;if(!document.hidden&&document.body.classList.contains('in-graph')&&!motionPreference.matches)draw();}requestAnimationFrame(animate);}
  requestAnimationFrame(animate);
})();



