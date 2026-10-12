"""Import a saved official Steam chart and store metadata, without live build requests."""
import hashlib,re,html
snapshot=json.loads((ROOT/'steam-snapshot.json').read_text(encoding='utf8'))
chart=snapshot['chart']
game_ids={730:'cs',570:'dota',578080:'pubg',1172470:'apex',440:'tf2',230410:'warframe',2767030:'marvel',292030:'witcher',359550:'siege',271590:'gta5',2054970:'dd2',1086940:'bg3',1091500:'cyberpunk',1203220:'naraka',394360:'hoi4',1174180:'rdr2',489830:'skyrim',1085660:'destiny',550:'l4d2',1245620:'elden',582660:'blackdesert',1222670:'sims4',1158310:'ck3',2344520:'diablo',582010:'mhworld',2139460:'once',39210:'ff14',216150:'maple',1446780:'mhrise'}
org_ids={'Square Enix':'square','Pearl Abyss':'pearl','Valve':'valve','Electronic Arts':'ea','KRAFTON, Inc.':'krafton','PUBG Corporation':'krafton','Respawn':'respawn','NetEase Games':'netease','24 Entertainment':'24ent','CAPCOM Co., Ltd.':'capcom','CD PROJEKT RED':'cdp','Larian Studios':'larian','FromSoftware, Inc.':'from','Bandai Namco Entertainment':'bandai','Bandai Namco Entertainment Inc.':'bandai','Bethesda Game Studios':'bethesda','Digital Extremes':'digital','Bungie':'bungie','Rockstar Games':'rockstar','Ubisoft':'ubisoft','Ubisoft Montreal':'montreal','SEGA':'sega','Paradox Interactive':'paradox','Blizzard Entertainment, Inc.':'blizzard','KONAMI':'konami','Xbox Game Studios':'xbox','TiMi Studio Group':'timi'}
clean=lambda s:html.unescape(re.sub('<[^>]+>','',s)).strip()
lookup={n['id']:n for n in nodes}
source('steam_chart',chart['title'],chart['url'],chart['capturedAt'])
for entry in chart['entries']:
    aid=entry['appid'];nid=game_ids.get(aid,'steam_'+str(aid));entry['nodeId']=nid
    entry['name']=re.sub(r'\(not available in your region\)','',entry['name']).strip()
    meta=snapshot['storeMetadata'].get(str(aid),{})
    src='steam_'+str(aid);url=f'https://store.steampowered.com/app/{aid}/'
    source(src,'Steam 商店：'+entry['name'],url,chart['capturedAt'])
    sources[src]['checked']=chart['capturedAt'][:10]
    devs=[x.strip() for x in meta.get('developers',[])];pubs=[x.strip() for x in meta.get('publishers',[])]
    related=[]
    for role,names in [('develop',devs),('publish',pubs)]:
        for name in names:
            oid=org_ids.get(name,'steam_org_'+hashlib.sha1(name.casefold().encode()).hexdigest()[:12])
            if oid not in lookup:
                node(oid,name,'company','未核对',name,'Steam 商店列出的开发或发行主体；法律实体、地点及股东信息尚未核对。',url=url)
                n=nodes[-1];n.update(geo=None,steamImported=True,locationNote='尚未核对城市；只在关系图谱展示。',attributes=[dict(label=k,value=v) for k,v in [('主体名称',name),('主体口径','Steam 商店署名'),('资料来源','Steam 官方商店'),('机构地点','尚未核对'),('股东信息','尚未收录；不代表没有股东')]])
                lookup[oid]=n
            related.append(oid)
            if not any(e['a']==oid and e['b']==nid and e['kind']==role for e in edges):edge(oid,nid,role,src,'Steam 商店该 app 的署名；不推断股权或唯一开发方。')
    translations={'Action':'动作','Adventure':'冒险','RPG':'角色扮演','Strategy':'策略','Simulation':'模拟','Casual':'休闲','Indie':'独立','Massively Multiplayer':'大型多人在线','Free To Play':'免费游玩','Sports':'体育','Racing':'竞速','Early Access':'抢先体验','Utilities':'实用工具','Design & Illustration':'设计与绘画','Animation & Modeling':'动画与建模','Video Production':'视频制作','Audio Production':'音频制作','Software Training':'软件教学'}
    genre=' / '.join(translations.get(g['description'],g['description']) for g in meta.get('genres',[])) or '商店资料受地区限制'
    excerpt=clean(meta.get('short_description',''))
    description=('类型：'+genre+'。'+('Steam 英文简介节选：'+excerpt+'…' if meta.get('descriptionExcerpt') else excerpt)) if excerpt else entry['name']+'：已收录在 Steam 官方当前在线人数榜单；商店资料受地区限制，开发与发行署名暂未取得。'
    if nid not in lookup:
        node(nid,meta.get('name',entry['name']),'game','未核对',entry['name'],description,group=related[0] if related else nid,url=url)
        lookup[nid]=nodes[-1]
        lookup[nid].update(genre=genre,descriptionSource=src,geo=None,steamImported=True,locationNote='关联开发组织的城市尚未核对；不定位作品。',attributes=[dict(label=k,value=v) for k,v in [('条目类型',meta.get('type','商店资料暂缺')),('游戏 / 软件类型',genre),('开发方','、'.join(devs) or '资料暂缺'),('发行方','、'.join(pubs) or '资料暂缺'),('作品口径','Steam app '+str(aid)),('说明来源','Steam 商店官方简介（原文）')]])
    n=lookup[nid]
    n['steam']=dict(appid=aid,rank=entry['rank'],currentPlayers=entry['currentPlayers'],peakToday=entry['peakToday'],capturedAt=chart['capturedAt'],type=meta.get('type','unknown'),metadataAvailable=bool(meta))
    n['aliases']+=' '+entry['name'];n['url']=url
    n['attributes'] += [dict(label='Steam 榜单排名',value=str(entry['rank'])),dict(label='当前在线人数（快照）',value=str(entry['currentPlayers'])),dict(label='榜单采集时间',value=chart['capturedAt'])]
    if not n.get('geo'):
        parent=next((lookup[x] for x in related if lookup[x].get('geo')),None)
        if parent:
            n['region']=parent['region'];n['geo']=dict(parent['geo'],relatedOrganization=parent['id'],basis='关联开发或发行组织城市；游戏不是地理机构')
    entry['metadataAvailable']=bool(meta)
