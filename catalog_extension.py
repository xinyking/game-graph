"""Official-source catalogue expansion and organization-level city mapping.
Executed by build_data.py with its node / edge / source helpers.
"""
source('nexon','Nexon：公司、总部与代表游戏','https://www.nexon.co.jp/en/about/')
source('netmarble','Netmarble：官方游戏目录','https://company.netmarble.com/en/business/games')
source('krafton','KRAFTON：PUBG 品牌资料','https://www.krafton.com/wp-content/uploads/2021/07/PUBG_BG_Brand_Guidelines_2021_External.pdf','2021')
source('pearl','Pearl Abyss：官方游戏目录','https://www.pearlabyss.com/en-us/Company/About/Games')
source('konami','Konami：官方游戏目录','https://www.konami.com/games/us/en/products/list/')
source('koei','Koei Tecmo：官方游戏目录','https://www.koeitecmoamerica.com/games/')
source('snk','SNK：The King of Fighters XV','https://www.snk-corp.co.jp/official/kof-xv/index.html')
source('take2','Take-Two：旗下厂牌','https://www.take2games.com/companies')
source('rockstar','Rockstar：官方游戏目录','https://store.rockstargames.com/view-all-games')
source('blizzard','Blizzard：官方游戏目录','https://www.blizzard.com/en-us/games')
source('blizzmember','Xbox：Activision Blizzard 加入公告','https://news.xbox.com/en-us/2023/10/13/xbox-activision-blizzard/','2023-10-13')
source('bungie','Bungie：Destiny 2 开发方','https://help.bungie.net/hc/en-us/articles/44229874536468--1-Getting-Started-with-Destiny-2')
source('bungiemember','Bungie：公司归属声明','https://www.bungie.net/7/en/Legal/PrivacyPolicy')
source('remedy','Remedy：官方游戏目录','https://www.remedygames.com/games')
source('hello','Hello Games：团队与自开发作品','https://hellogames.org/about-us/')
source('paradox','Paradox：公司与作品目录','https://www.paradoxinteractive.com/our-company')
source('supergiant','Supergiant：公司与作品','https://www.supergiantgames.com/')
source('11bit','11 bit studios：开发作品与华沙所在地','https://ir.11bitstudios.com/en/who-we-are/')
source('digital','Digital Extremes：团队与 Warframe','https://www.digitalextremes.com/about')
new_companies=[
 ('nexon','Nexon','日本','乐线 ネクソン','全球总部位于东京；韩国业务与子公司地点分开记录。'),
 ('netmarble','Netmarble','韩国','网石 넷마블','韩国游戏开发与发行公司。'),
 ('krafton','KRAFTON','韩国','魁匠团 蓝洞','以 PUBG 等游戏品牌为代表的韩国游戏公司。'),
 ('pearl','Pearl Abyss','韩国','珍艾碧丝','黑色沙漠开发商；总部位于果川。'),
 ('konami','科乐美','日本','Konami Digital Entertainment KONAMI','本节点代表科乐美数字娱乐的游戏业务主体。'),
 ('koei','光荣特库摩','日本','Koei Tecmo Games KT','本节点代表游戏业务；所在地采用横滨游戏公司总部。'),
 ('snk','SNK','日本','拳皇 新日本企划','大阪的游戏公司，以格斗游戏系列闻名。'),
 ('take2','Take-Two Interactive','北美','T2 Take Two','旗下包括 Rockstar、2K 与 Zynga 等厂牌。'),
 ('rockstar','Rockstar Games','北美','R星 R* Rockstar','本节点为纽约总部与发行厂牌；作品开发由多个团队参与。'),
 ('blizzard','暴雪娱乐','北美','Blizzard 魔兽 暗黑','图中省略 Activision Blizzard 中间主体，连接至 Xbox。'),
 ('bungie','Bungie','北美','棒鸡 命运','Destiny 系列开发团队，属于索尼互动娱乐。'),
 ('remedy','Remedy Entertainment','欧洲','绿美迪 心灵杀手','芬兰叙事动作游戏开发商。'),
 ('hello','Hello Games','欧洲','无人深空','英国独立开发与发行团队，主要工作室位于吉尔福德。'),
 ('paradox','Paradox Interactive','欧洲','P社 悖论互动','斯德哥尔摩的策略与模拟游戏开发发行公司。'),
 ('supergiant','Supergiant Games','北美','超巨 哈迪斯','旧金山的独立游戏开发团队。'),
 ('11bit','11 bit studios','欧洲','11位 冰汽时代','华沙的开发与发行公司。'),
 ('digital','Digital Extremes','北美','DE 星际战甲','总部位于加拿大安大略省伦敦，不是英国伦敦。')]
for id,name,region,aliases,description in new_companies:
    company(id,name,region,aliases,description,id)
edge('take2','rockstar','member','take2')
edge('xbox','blizzard','member','blizzmember','通过 Activision Blizzard 归入 Xbox；省略中间主体。')
edge('sony','bungie','member','bungiemember')
for id,name,publisher,aliases,genre in [
 ('maple','冒险岛','nexon','MapleStory','大型多人在线角色扮演'),
 ('mabinogi','洛奇','nexon','Mabinogi','大型多人在线角色扮演'),
 ('seven','七骑士 Re:BIRTH','netmarble','Seven Knights Rebirth','角色扮演'),
 ('pubg','PUBG：绝地求生','krafton','PUBG Battlegrounds 吃鸡','多人战术竞技'),
 ('metalgear','合金装备 Δ：食蛇者','konami','Metal Gear Solid Delta Snake Eater','潜行动作'),
 ('silenthill','寂静岭 f','konami','Silent Hill f','恐怖冒险'),
 ('nioh','仁王2','koei','Nioh 2','动作角色扮演'),
 ('dynasty','真·三国无双9 帝国','koei','Dynasty Warriors 9 Empires','动作策略'),
 ('kof','拳皇 XV','snk','The King of Fighters XV KOF15','格斗'),
 ('gta5','侠盗猎车手 V','rockstar','Grand Theft Auto V GTA5 GTA V','开放世界动作冒险'),
 ('rdr2','荒野大镖客：救赎2','rockstar','Red Dead Redemption 2 RDR2','开放世界动作冒险'),
 ('wow','魔兽世界','blizzard','World of Warcraft WOW','大型多人在线角色扮演'),
 ('diablo','暗黑破坏神 IV','blizzard','Diablo IV Diablo4','动作角色扮演'),
 ('stellaris','群星','paradox','Stellaris','太空策略'),
 ('ck3','十字军之王 III','paradox','Crusader Kings III CK3','大战略')]:
    published(id,name,publisher,aliases,genre,publisher)
for id,name,developer,aliases,genre in [
 ('blackdesert','黑色沙漠','pearl','Black Desert','大型多人在线角色扮演'),
 ('destiny','命运2','bungie','Destiny 2','多人在线射击'),
 ('alanwake','心灵杀手2','remedy','Alan Wake 2','生存恐怖'),
 ('control','控制','remedy','Control','动作冒险'),
 ('nms','无人深空','hello','No Man Sky NMS','宇宙探索'),
 ('hades','哈迪斯','supergiant','Hades','Roguelike 动作'),
 ('hades2','哈迪斯 II','supergiant','Hades II Hades2','Roguelike 动作'),
 ('frostpunk','冰汽时代','11bit','Frostpunk','生存城市建造'),
 ('twom','这是我的战争','11bit','This War of Mine','生存模拟'),
 ('warframe','星际战甲','digital','Warframe','多人动作射击')]:
    game(id,name,developer,aliases,genre,developer)

# Split a merged brand view into separate geographic organizations.
hoyo=next(n for n in nodes if n['id']=='hoyo')
hoyo.update(name='HoYoverse',region='新加坡',aliases='Cognosphere HoYo',description='Cognosphere / HoYoverse 的新加坡全球总部；与上海米哈游分开定位。')
source('mihoyo','米哈游：上海联系地址','https://uploadstatic.mihoyo.com/bh3/upload/officialsites/202008/privacy-V20200820-1.1_1597895224_9041.pdf','2020-08')
company('mihoyo','米哈游','中国','miHoYo 上海米哈游','上海米哈游主体。国际发行 HoYoverse 在新加坡另设节点；本图不推断完整法律股权链。','mihoyo')
source('mihoyogame','米哈游：崩坏3 官方隐私与运营主体','https://uploadstatic.mihoyo.com/bh3/upload/officialsites/202006/privacy-1_1591963361_7217.pdf','2020-05')
published('bh3','崩坏3','mihoyo','Honkai Impact 3rd','动作角色扮演','mihoyogame')
next(n for n in nodes if n['id']=='sony')['region']='北美'

# City IDs reference an offline extract of GeoNames, with country/state checks.
cities=json.loads((ROOT/'city-reference.json').read_text(encoding='utf-8'))
locations={
 'tencent':('1795565','深圳','中国','全球总部','https://www.tencent.com/en-us/about.html.html',''),
 'netease':('1808926','杭州','中国','官网列示中国办公室','https://www.neteasegames.com/','同时设有广州、上海办公室；不把单一办公室称为全部游戏业务总部。'),
 'hoyo':('1880252','新加坡','新加坡','全球总部','https://sdk.hoyoverse.com/hyp/agreement/index.html?language=en-us&launcher_id=VYTpXlbWo8&prev=false&type=2',''),
 'mihoyo':('1796236','上海','中国','官方联系城市','https://uploadstatic.mihoyo.com/bh3/upload/officialsites/202008/privacy-V20200820-1.1_1597895224_9041.pdf','官方来源为 2020 年隐私文件；标记城市级位置，不声称当前具体楼宇。'),
 'kuro':('1809858','广州','中国','公司所在地','https://pns.kurogames.com/p/privacy.html',''),
 'science':('1795565','深圳','中国','官方办公城市','https://gamesci.cn/about.html','团队另有其他开发地点；此处定位官方列示深圳办公室。'),
 'sony':('5392423','圣马特奥','美国','全球总部','https://sonyinteractive.com/en/office/global-headquarters/','索尼互动娱乐 SIE，不是东京的索尼集团总部。'),
 'nintendo':('1857910','京都','日本','总部','https://www.nintendo.co.jp/corporate/en/outline/index.html',''),
 'capcom':('1853909','大阪','日本','总部','https://www.capcom.co.jp/ir/english/company/info.html',''),
 'sega':('1850147','东京','日本','总部','https://www.sega.co.jp/en/company/outline/',''),
 'square':('1850147','东京','日本','总部','https://web.jp.square-enix.com/company/en/outline/',''),
 'bandai':('1850147','东京','日本','总部','https://www.bandainamcoent.co.jp/corporate/overview/detail/',''),
 'from':('1850147','东京','日本','总部','https://www.fromsoftware.jp/ww/company_access.html',''),
 'xbox':('5808079','雷德蒙德','美国','微软总部／Xbox 业务定位','https://www.microsoft.com/en-us/about/office-locations','采用微软总部城市，不表示所有 Xbox 团队均在此办公。'),
 'ea':('5386834','雷德伍德城','美国','全球总部','https://www.ea.com/about',''),
 'valve':('5786882','贝尔维尤','美国','公司城市','https://www.valvesoftware.com/company/Valve_Handbook_LowRes.pdf','官方员工手册列示城市；不定位具体楼宇。'),
 'epic':('4459467','卡里','美国','总部','https://www.epicgames.com/site/about?lang=en-US',''),
 'ubisoft':('2978621','圣芒代','法国','全球总部','https://www.ubisoft.com/fr-fr/company/careers/locations/paris-area/ubisoft-worldwide-hq','位于巴黎都市圈，地图使用圣芒代城市坐标。'),
 'cdp':('756135','华沙','波兰','公司所在地','https://www.cdprojekt.com/en/terms-of-service/',''),
 'larian':('2797656','根特','比利时','创始与主要工作室','https://larian.com/careers/location/gent','多地开发团队；不把单一工作室坐标等同于完整法律注册结构。'),
 'riot':('5368361','洛杉矶','美国','全球总部','https://www.riotgames.com/en/work-with-us/offices/los-angeles',''),
 'timi':('1795565','深圳','中国','总部','https://www.tencent.com/timi-studio-group-the-next-chapter-part-1/','官方 2021 年公告；多地工作室。'),
 'supercell':('658225','赫尔辛基','芬兰','总部','https://supercell.com/en/office-privacy-policy/',''),
 'naughty':('5393212','圣莫尼卡','美国','主要工作室','https://www.naughtydog.com/careers',''),
 'insomniac':('5331835','伯班克','美国','主要实体工作室','https://insomniac.games/careers/','同时有远程员工；定位实体工作室城市。'),
 'santa':('5393212','圣莫尼卡','美国','当前招聘列示工作城市','https://careers.playstation.com/senior-game-designer-combat/job/6117785004','采用当前官方招聘的 Santa Monica 城市口径；不推断具体楼宇。'),
 'guerrilla':('2759794','阿姆斯特丹','荷兰','工作室','https://www.guerrilla-games.com/join/where-we-work',''),
 'asobi':('1850147','东京','日本','工作室','https://www.teamasobi.com/aboutus',''),
 'sucker':('5786882','贝尔维尤','美国','工作室','https://www.glowybits.com/talks/real-time_samurai_cinema/real-time_samurai_cinema.pdf','团队成员技术演讲列示所在地。'),
 'retro':('4671654','奥斯汀','美国','工作室','https://www.retrostudios.com/about/',''),
 'bethesda':('4367175','罗克维尔','美国','主要工作室','https://bethesdagamestudios.com/','同时有蒙特利尔、奥斯汀、达拉斯团队。'),
 'mojang':('2673730','斯德哥尔摩','瑞典','主要工作室','https://www.linkedin.com/company/mojangstudios','公司官方账号列示斯德哥尔摩与雷德蒙德，另有多地团队。'),
 'bioware':('5946768','埃德蒙顿','加拿大','主要工作室','https://www.bioware.com/studios/bioware-edmonton/',''),
 'respawn':('5368361','洛杉矶','美国','Chatsworth 工作室城市','https://www.ea.com/careers/locations','以洛杉矶城市参考点表示 Chatsworth，不声称具体楼宇位置。'),
 'montreal':('6077243','蒙特利尔','加拿大','工作室','https://montreal.ubisoft.com/en/contact-us/',''),
 'rgg':('1850147','东京','日本','所属世嘉总部城市','https://www.sega.co.jp/en/company/outline/','内部团队，采用所属公司总部定位；未独立确认办公室地址。'),
 '24ent':('1808926','杭州','中国','工作室','https://www.24-ent.com/',''),
 'nexon':('1850147','东京','日本','全球总部','https://www.nexon.co.jp/en/about/','不要与 Nexon Korea 的韩国办公室混同。'),
 'netmarble':('1835848','首尔','韩国','总部','https://company.netmarble.com/en/company/location',''),
 'krafton':('1835848','首尔','韩国','总部','https://www.krafton.com/en/privacypolicy-11212023/',''),
 'pearl':('gwacheon','果川','韩国','总部','https://www.pearlabyss.com/en-US/Company/About',''),
 'konami':('1850147','东京','日本','数字娱乐总部','https://www.konami.com/games/corporate/en/',''),
 'koei':('1848354','横滨','日本','游戏公司总部','https://www.koeitecmo.co.jp/e/company/outline/',''),
 'snk':('1853909','大阪','日本','总部','https://www.snk-corp.co.jp/us/company/',''),
 'take2':('5128581','纽约','美国','总部','https://careers.take2games.com/locations',''),
 'rockstar':('5128581','纽约','美国','总部／发行厂牌','https://www.rockstargames.com/careers/openings/position/7748469003','不代表 GTA 或 RDR 所有开发者所在地。'),
 'blizzard':('5359777','尔湾','美国','主要园区','https://careers.blizzard.com/global/en/irvine',''),
 'bungie':('5786882','贝尔维尤','美国','总部','https://www.bungie.net/7/en/Legal/PrivacyPolicy',''),
 'remedy':('660158','埃斯波','芬兰','芬兰总部办公室','https://www.remedygames.com/contact','另有斯德哥尔摩办公室。'),
 'hello':('2647793','吉尔福德','英国','主要工作室','https://hellogames.org/join-us/','另有剑桥团队。'),
 'paradox':('2673730','斯德哥尔摩','瑞典','总部','https://www.paradoxinteractive.com/our-company',''),
 'supergiant':('5391959','旧金山','美国','工作室','https://www.supergiantgames.com/',''),
 '11bit':('756135','华沙','波兰','公司所在地','https://ir.11bitstudios.com/en/who-we-are/',''),
 'digital':('6058560','伦敦（安大略省）','加拿大','总部','https://www.digitalextremes.com/about','加拿大伦敦，不是英国伦敦。')}
for n in nodes:
    if n['kind']=='game': continue
    city_id,city,country,basis,url,note=locations[n['id']]
    c=cities[city_id]
    key='geo_'+n['id']
    source(key,n['name']+'：'+basis+'与城市',url)
    n['geo']=dict(city=city,country=country,cityId=city_id,lat=c['lat'],lon=c['lon'],basis=basis,precision='城市参考点，非楼宇定位',source=key,coordinateSource=c['url'],note=note)
for n in nodes:
    if n['kind']!='game': continue
    related=next((e for e in edges if e['b']==n['id'] and e['kind']=='develop'),None) or next((e for e in edges if e['b']==n['id'] and e['kind']=='publish'),None)
    parent=next(x for x in nodes if x['id']==related['a'])
    n['region']=parent['region']
    n['geo']=dict(parent['geo'],relatedOrganization=parent['id'],basis='关联'+('开发方' if related['kind']=='develop' else '发行方')+'城市；游戏不是地理机构')
