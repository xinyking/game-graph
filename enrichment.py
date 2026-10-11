"""Source-linked game attributes and dated capital relationships.
Executed after the geographic catalogue by build_data.py.
"""
source('capital_tencent','腾讯投资者概览：自有与被投资工作室','https://static.www.tencent.com/uploads/2025/05/21/fdfcf682b7e7d91908f0f1008a4c7721.pdf','2025-05-21')
source('capital_from','FromSoftware：第三方增资后的股权结构','https://www.fromsoftware.jp/ww/pressrelease/20220831_announcement.html','2022-08-31')
source('capital_sie','SIE：索尼集团全资子公司声明','https://sonyinteractive.com/en/about-us/')
source('capital_sony_epic','索尼：完成对 Epic 的追加投资','https://www.sony.com/en/SonyInfo/IR/news/20220602_E.pdf','2022-06-02')
source('capital_epic','Epic：Sony、KIRKBI 投资与创始人控制权','https://www.epicgames.com/site/news/sony-and-kirkbi-invest-in-epic-games-to-build-the-future-of-digital-entertainment','2022-04-11')
source('capital_remedy','Remedy：腾讯间接持股 14.80% 公告','https://investors.remedygames.com/announcements/remedy-entertainment-plc-tencent-holdings-limiteds-shareholding-in-remedy-has-gone-above-the-10-percent-threshold/','2024-04-26')
source('capital_disney','Disney：投资 Epic 的协议公告','https://thewaltdisneycompany.org/news/disney-and-epic-games-fortnite/index.html','2024-02-07')
source('geo_sonygroup','Sony Group：东京总部','https://www.sony.com/en/SonyInfo/CorporateInfo/data/')
for id,name,region,aliases,description,url,entity in [
 ('tencenthold','腾讯控股','中国','Tencent Holdings 腾讯集团','资本关系主体；与腾讯游戏业务节点分开。','https://www.tencent.com/en-us/','公司'),
 ('sonygroup','索尼集团','日本','Sony Group Corporation ソニーグループ','索尼互动娱乐的母公司，也参与游戏领域的股权投资。','https://www.sony.com/en/','公司'),
 ('kadokawa','角川','日本','KADOKAWA CORPORATION','出版、影视与游戏集团；图中记录其对 FromSoftware 的控股快照。','https://group.kadokawa.co.jp/global/','公司'),
 ('kirkbi','KIRKBI','欧洲','LEGO 乐高投资集团','乐高创始家族的控股与投资公司；2022 年公告参与 Epic 融资。','https://www.kirkbi.com/','公司'),
 ('disney','迪士尼','北美','The Walt Disney Company Disney','2024 年宣布拟投资 Epic 并合作开发娱乐体验，图中保留公告交易状态。','https://thewaltdisneycompany.com/','公司'),
 ('sweeney','Tim Sweeney','北美','蒂姆·斯维尼 Epic 创始人','Epic 在 2022 年融资公告中声明仍由创始人 Tim Sweeney 控制。','https://www.epicgames.com/site/news/sony-and-kirkbi-invest-in-epic-games-to-build-the-future-of-digital-entertainment','自然人')]:
    node(id,name,'investor',region,aliases,description,url=url)
    n=nodes[-1];n['entityType']=entity;n['geo']=None
    n['locationNote']='自然人不定位私人住址' if entity=='自然人' else '本轮未单独核对办公城市；仅在关系星图展示'
    if id=='tencenthold': n['geo']=dict(next(x for x in nodes if x['id']=='tencent')['geo'])
    if id=='sonygroup': n['geo']=dict(next(x for x in nodes if x['id']=='sega')['geo'],source='geo_sonygroup',basis='索尼集团总部',note='索尼集团东京总部，与 SIE 圣马特奥节点分开。')

def capital(owner,target,kind,src,asof,percentage=None,via='',status='已披露关系',note=''):
    edge(owner,target,kind,src,note)
    edges[-1].update(asOf=asof,percentage=percentage,via=via,status=status,
        temporalNote='公开资料的报告期快照；不保证核对日仍保持相同比例')

capital('tencenthold','tencent','control','capital_tencent','2025-05-21',note='集团与游戏业务的控制关系；腾讯游戏是业务视图，不赋予独立法人持股比例。')
for target in ['riot','supercell','digital']:
    capital('tencenthold',target,'control','capital_tencent','2025-05-21',via='集团控制链',note='投资者概览列为 Owned Studios；未在本图推断直接持股主体或具体比例。')
for target in ['epic','krafton','science','ubisoft']:
    capital('tencenthold',target,'invest','capital_tencent','2025-05-21',via='集团投资链',note='投资者概览列为 Invested External Studios；未披露或未摘录比例，不表示控股。')
capital('tencenthold','from','invest','capital_from','2022-08-31',16.25,'Sixjoy Hong Kong Limited',note='比例为增资完成后的公告口径，直接股东为腾讯子公司 Sixjoy。')
capital('sony','from','invest','capital_from','2022-08-31',14.09,note='索尼互动娱乐的少数持股，不表示 FromSoftware 为 SIE 旗下团队。')
capital('kadokawa','from','control','capital_from','2022-08-31',69.66,note='公告增资后的多数持股。')
capital('tencenthold','remedy','invest','capital_remedy','2024-04-24',14.80,'Image Frame Investment (HK) Ltd',note='公告所示间接股份与投票权；未当作实时持股比例。')
capital('sonygroup','sony','control','capital_sie','2026-10-11',100,note='官网声明 SIE 为索尼集团全资子公司；SIE 节点代表业务集团。')
capital('sonygroup','epic','invest','capital_sony_epic','2022-06-02',via='Sony Corporation of America',note='追加约 10 亿美元投资已完成；不从金额反推持股比例。')
capital('kirkbi','epic','invest','capital_epic','2022-04-11',status='融资协议公告',note='公告投资 10 亿美元，仍附通常交割条件；比例未披露。')
capital('sweeney','epic','control','capital_epic','2022-04-11',note='融资公告明确仍由创始人控制；未披露持股比例。')
capital('disney','epic','invest','capital_disney','2024-02-07',status='投资协议公告，交割未在本图核实',note='公告拟投资 15 亿美元，附交割和监管条件；不作为已完成控股。')

# Each new title has its own public product evidence and an editorial synopsis.
# A publisher-only record never implies that the publisher developed the game.
catalog=[
 ('odyssey','超级马力欧：奥德赛','nintendo',None,'平台动作','使用帽子能力探索不同王国，收集力量之月。','https://supermario.nintendo.com/'),
 ('pikmin4','皮克敏4','nintendo',None,'即时策略 / 探索','指挥皮克敏与伙伴欧庆，在微观世界探索并营救遇难者。','https://pikmin4.nintendo.com/'),
 ('mk8','马力欧卡丁车8 豪华版','nintendo',None,'竞速','以道具竞速、反重力赛道与多人对战为核心。','https://mariokart8deluxe.nintendo.com/'),
 ('splatoon3','斯普拉遁3','nintendo',None,'团队射击','通过喷涂墨水争夺区域，结合机动与团队协作。','https://splatoon.nintendo.com/'),
 ('acnh','集合啦！动物森友会','nintendo',None,'生活模拟','在无人岛建设家园、布置环境并与岛上居民互动。','https://www.animal-crossing.com/new-horizons/'),
 ('re4','生化危机4（2023）','capcom','capcom','生存恐怖 / 动作','里昂前往偏远村落展开营救；本节点记录 2023 年重制版本。','https://www.residentevil.com/re4/'),
 ('village','生化危机：村庄','capcom','capcom','生存恐怖','伊森在诡异村庄与城堡中探索、生存并寻找家人。','https://www.residentevil.com/village/'),
 ('mhworld','怪物猎人：世界','capcom','capcom','动作角色扮演','探索生态环境，狩猎大型怪物并制作装备。','https://www.monsterhunter.com/world/'),
 ('mhrise','怪物猎人：崛起','capcom','capcom','动作角色扮演','以翔虫机动和御龙机制展开狩猎。','https://www.monsterhunter.com/rise/'),
 ('dd2','龙之信条2','capcom','capcom','动作角色扮演','以觉醒者与追随者为核心，探索奇幻世界。','https://www.dragonsdogma.com/2/'),
 ('dmc5','鬼泣5','capcom','capcom','动作','通过不同角色的战斗系统与连招对抗恶魔。','https://www.devilmaycry.com/5/'),
 ('bloodborne','血源诅咒','sony','from','动作角色扮演','在雅南的哥特式世界中猎杀怪物，强调进攻与风险判断。','https://www.playstation.com/en-us/games/bloodborne/'),
 ('ds3','黑暗之魂 III','bandai','from','动作角色扮演','在衰败的世界探索关卡、挑战首领并塑造角色构筑。','https://www.fromsoftware.jp/ww/products.html'),
 ('ac6','装甲核心 VI：境界天火','bandai','from','机甲动作','组装机甲完成任务，通过装备组合应对战斗。','https://www.fromsoftware.jp/ww/products.html'),
 ('spiderman2','漫威蜘蛛侠2','sony','insomniac','开放世界动作冒险','切换彼得与迈尔斯，在纽约穿梭并面对毒液等敌人。','https://www.playstation.com/en-us/games/marvels-spider-man-2/'),
 ('tlou2','最后生还者 第二部','sony','naughty','动作冒险 / 生存','以艾莉与艾比的交错故事展开探索、潜行与资源管理。','https://www.playstation.com/en-us/games/the-last-of-us-part-ii-remastered/'),
 ('ragnarok','战神：诸神黄昏','sony','santa','动作冒险','奎托斯与阿特柔斯踏上北欧九界旅程。','https://www.playstation.com/en-us/games/god-of-war-ragnarok/'),
 ('forbidden','地平线：西之绝境','sony','guerrilla','开放世界动作角色扮演','埃洛伊探索西部地区，通过装备和战术对抗机械兽。','https://www.playstation.com/en-us/games/horizon-forbidden-west/'),
 ('hl2','半衰期2','valve','valve','第一人称射击','戈登·弗里曼在联合军统治的城市中展开抵抗。','https://store.steampowered.com/app/220/HalfLife_2/'),
 ('l4d2','求生之路2','valve','valve','合作射击','四名幸存者协作穿越感染者占据的区域。','https://store.steampowered.com/app/550/Left_4_Dead_2/'),
 ('tf2','军团要塞2','valve','valve','团队射击','通过九种职业的分工进行团队目标对战。','https://store.steampowered.com/app/440/Team_Fortress_2/'),
 ('gta4','侠盗猎车手 IV','rockstar',None,'开放世界动作冒险','围绕尼科在自由城的经历展开任务与城市探索。','https://store.rockstargames.com/view-all-games'),
 ('rdr1','荒野大镖客：救赎','rockstar',None,'开放世界动作冒险','约翰·马斯顿在美国西部的旅程；与续作节点分开。','https://store.rockstargames.com/view-all-games'),
 ('bully','恶霸鲁尼','rockstar',None,'动作冒险','在寄宿学校与周边社区中完成课程和故事任务。','https://store.rockstargames.com/view-all-games'),
 ('sc2','星际争霸 II','blizzard','blizzard','即时战略','围绕人类、异虫和星灵的基地建设与兵种对抗。','https://starcraft.blizzard.com/'),
 ('hearthstone','炉石传说','blizzard','blizzard','策略卡牌','以魔兽角色与法术为主题，构筑套牌进行对战。','https://hearthstone.blizzard.com/'),
 ('d2r','暗黑破坏神 II：狱火重生','blizzard',None,'动作角色扮演','经典暗黑破坏神 II 的重制版本，以战利品与角色构筑为核心。','https://diablo2.blizzard.com/'),
 ('d3','暗黑破坏神 III','blizzard','blizzard','动作角色扮演','通过不同职业挑战怪物，获取装备并组合技能。','https://diablo3.blizzard.com/'),
 ('bastion','堡垒','supergiant','supergiant','动作角色扮演','在灾变后的浮空世界中寻找重建堡垒的资源。','https://www.supergiantgames.com/'),
 ('transistor','晶体管','supergiant','supergiant','动作角色扮演','在科幻城市中使用神秘武器，组合能力进行战斗。','https://www.supergiantgames.com/'),
 ('pyre','柴堆','supergiant','supergiant','队伍角色扮演','率领流亡者参与仪式竞赛，争取重获自由。','https://www.supergiantgames.com/'),
 ('quantum','量子破碎','xbox','remedy','动作冒险','围绕时间破裂事件，结合时间能力战斗与叙事。','https://www.remedygames.com/games/quantum-break'),
 ('alanwake1','心灵杀手','remedy','remedy','心理惊悚 / 动作','作家在小镇寻找妻子，用光线抵御黑暗中的威胁；此节点仅记录开发关系。','https://www.remedygames.com/games/alan-wake'),
 ('firebreak','FBC: Firebreak','remedy','remedy','合作第一人称射击','三人小队处理联邦控制局内部的超自然危机。','https://www.remedygames.com/games/fbc-firebreak'),
 ('hoi4','钢铁雄心 IV','paradox',None,'大战略','以战争时期的工业、外交与军队调度为核心。','https://www.paradoxinteractive.com/games/hearts-of-iron-iv/about'),
 ('eu4','欧陆风云 IV','paradox',None,'大战略','从国家治理、贸易、外交与战争展开历史策略。','https://www.paradoxinteractive.com/games/europa-universalis-iv/about'),
 ('frostpunk2','冰汽时代2','11bit','11bit','城市生存 / 策略','在冰封世界中扩展城市，平衡资源与派系诉求。','https://11bitstudios.com/games/frostpunk-2/'),
 ('titanfall2','泰坦陨落2','ea','respawn','第一人称射击','结合铁驭跑酷与泰坦机甲战斗，包含战役与多人模式。','https://www.ea.com/games/titanfall/titanfall-2'),
 ('jedi','星球大战绝地：幸存者','ea','respawn','动作冒险','卡尔·凯斯提斯在银河中探索，结合光剑与原力战斗。','https://www.ea.com/games/starwars/jedi/jedi-survivor'),
 ('sims4','模拟人生4','ea',None,'生活模拟','创建角色、建造住宅并安排模拟市民的生活。','https://www.ea.com/games/the-sims/the-sims-4'),
 ('witcher2','巫师2：国王刺客','cdp','cdp','角色扮演','杰洛特卷入政治阴谋，选择影响故事的分支发展。','https://www.thewitcher.com/us/en/witcher2')]
aliases={
 'odyssey':'Super Mario Odyssey','pikmin4':'Pikmin 4','mk8':'Mario Kart 8 Deluxe','splatoon3':'Splatoon 3','acnh':'Animal Crossing New Horizons',
 're4':'Resident Evil 4 RE4','village':'Resident Evil Village RE8','mhworld':'Monster Hunter World MHW','mhrise':'Monster Hunter Rise','dd2':"Dragon Dogma 2 Dragon’s Dogma 2",'dmc5':'Devil May Cry 5',
 'bloodborne':'Bloodborne','ds3':'Dark Souls III Dark Souls 3','ac6':'Armored Core VI Fires of Rubicon','spiderman2':'Marvel Spider-Man 2','tlou2':'The Last of Us Part II','ragnarok':'God of War Ragnarok','forbidden':'Horizon Forbidden West',
 'hl2':'Half-Life 2','l4d2':'Left 4 Dead 2','tf2':'Team Fortress 2','gta4':'Grand Theft Auto IV GTA4','rdr1':'Red Dead Redemption RDR1','bully':'Bully Scholarship Edition',
 'sc2':'StarCraft II','hearthstone':'Hearthstone','d2r':'Diablo II Resurrected','d3':'Diablo III','bastion':'Bastion','transistor':'Transistor','pyre':'Pyre',
 'quantum':'Quantum Break','alanwake1':'Alan Wake','firebreak':'FBC Firebreak','hoi4':'Hearts of Iron IV','eu4':'Europa Universalis IV','frostpunk2':'Frostpunk 2','titanfall2':'Titanfall 2','jedi':'Star Wars Jedi Survivor','sims4':'The Sims 4','witcher2':'The Witcher 2 Assassins of Kings'}
for id,name,publisher,developer,genre,description,url in catalog:
    key='game_'+id;source(key,name+'：官方作品资料',url)
    if developer:
        game(id,name,developer,'',genre,key,publisher if id!='alanwake1' else None)
    else: published(id,name,publisher,'',genre,key)
    n=nodes[-1];n.update(aliases=aliases[id],genre=genre,description=description,descriptionSource=key)
    parent=next(x for x in nodes if x['id']==(developer or publisher))
    n['geo']=dict(parent['geo'],relatedOrganization=parent['id'],basis='关联'+('开发方' if developer else '发行方')+'城市；游戏不是地理机构')

briefs={
 'tft':'通过购买棋子、组合羁绊和布置阵容进行自动战斗。',
 'hok':'围绕英雄分工、兵线和地图目标展开移动端团队对战。',
 'coc':'建造村庄、训练部队并参与进攻与部落协作。',
 'brawl':'使用不同角色，在短局多人模式中争夺目标。',
 'naraka':'结合近战武器、远程攻击和英雄技能展开生存竞技。',
 'marvel':'以漫威英雄为主题，通过不同角色能力展开团队射击。',
 'once':'在异常现象遍布的开放世界中探索、建造与生存。',
 'winds':'在武侠世界中探索场景，体验战斗与江湖故事。',
 'wuthering':'以漂泊者的旅程展开开放世界探索与动作战斗。',
 'tlou':'以末日环境中的人物故事为中心，结合潜行、探索和生存；此节点是系列视图。',
 'uncharted':'以寻宝冒险为主题，结合攀爬、解谜和战斗；此节点是系列视图。',
 'spiderman':'在都市中利用蛛丝移动和战斗，体验蜘蛛侠的故事；此节点是系列视图。',
 'gow':'围绕奎托斯的神话旅程展开战斗与探索；此节点是系列视图。',
 'horizon':'在机械兽与自然环境交织的世界中探索和狩猎；此节点是系列视图。',
 'astro':'操作小机器人穿越不同主题关卡，利用场景和能力完成平台挑战。',
 'tsushima':'在对马岛探索，结合武士战斗与潜行推进故事。',
 'prime':'以萨姆斯的探索为中心，结合扫描、能力获取与第一人称战斗；此节点是系列视图。',
 'dk':'通过跳跃、机关和角色配合完成不同场景的平台关卡。',
 'resident':'在恐怖场景中探索、管理资源并应对威胁；此节点是系列视图。',
 'monster':'狩猎大型怪物，收集素材制作装备并挑战更强目标；此节点是系列视图。',
 'sf':'通过不同角色的招式、距离控制和连招展开格斗；此节点是系列视图。',
 'dragon':'以春日一番与桐生一马的故事为线索，结合队伍战斗与城市活动。',
 'judgment':'以私家侦探的调查为线索，在城市中收集证据并进行战斗。',
 'ff14':'在艾欧泽亚体验剧情、职业成长与多人副本。',
 'ff7':'重新演绎米德加的故事，结合角色切换与动作战斗。',
 'skyrim':'在天际省探索，发展技能、完成任务并塑造角色。',
 'starfield':'在科幻宇宙中探索星球，发展角色并驾驶飞船。',
 'minecraft':'在方块世界中采集、建造和探索，可选择生存或创造玩法。',
 'mass':'以银河探索、队伍协作与故事选择为核心；此节点是系列视图。',
 'age':'以奇幻世界的队伍冒险和剧情选择为核心；此节点是系列视图。',
 'apex':'以英雄能力与枪械配合展开多人小队生存对战。',
 'ac':'在不同时代的场景中探索，结合潜行与动作战斗；此节点是系列视图。',
 'siege':'通过攻防分工、战术装备与可破坏环境完成团队目标。',
 'cs':'围绕回合制攻防目标，强调枪械、经济管理与团队战术。',
 'dota':'两队操纵英雄争夺地图资源，发展装备并进攻敌方基地。',
 'portal':'利用传送门与环境中的物理机制解决空间谜题。',
 'divinity':'通过队伍组合、环境互动与回合制战斗展开奇幻冒险。',
 'maple':'在横向卷轴世界中发展职业、完成任务并参与多人活动。',
 'mabinogi':'结合战斗、技能成长与生活活动展开多人幻想冒险。',
 'seven':'收集并培养角色，组合队伍进行角色扮演战斗。',
 'pubg':'在不断缩小的战场中搜集装备，以枪械与战术争取生存。',
 'metalgear':'围绕潜入任务展开探索，利用环境与装备避开或对抗敌人。',
 'silenthill':'在诡异环境中探索，以恐怖氛围和人物故事为中心。',
 'nioh':'在妖怪与武士题材的关卡中战斗，结合装备和技能构筑。',
 'dynasty':'结合战场动作与势力经营，在三国题材中争夺地盘。',
 'kof':'以角色队伍和招式组合展开竞技格斗。',
 'gta5':'在洛圣都体验多角色故事、开放世界任务与城市活动。',
 'rdr2':'围绕西部帮派的经历展开开放世界探索与故事任务。',
 'wow':'在艾泽拉斯发展角色，体验任务、团队副本与多人活动。',
 'diablo':'在暗黑奇幻世界中挑战敌人，通过战利品与技能塑造角色。',
 'stellaris':'从星际探索出发，发展帝国并处理外交、科技与战争。',
 'ck3':'围绕中世纪家族的传承、婚姻与权力斗争展开策略。',
 'blackdesert':'在开放世界中发展角色，结合动作战斗与生活技能。',
 'destiny':'结合守护者能力、装备与合作任务展开科幻射击。',
 'alanwake':'通过交错人物视角探索超自然事件，结合调查与生存恐怖。',
 'control':'探索联邦控制局，利用超自然能力处理异常事件。',
 'nms':'在广阔宇宙中探索星球、采集资源并建造基地。',
 'hades':'以反复挑战与能力组合为核心，在希腊神话冥界中战斗。',
 'hades2':'围绕神话题材的新旅程展开反复挑战、能力选择与动作战斗。',
 'frostpunk':'在严寒环境中建设城市，平衡资源、生存与社会秩序。',
 'twom':'从平民视角管理物资与避难所，在战争环境中努力生存。',
 'bh3':'组合不同女武神角色，通过动作战斗推进故事与挑战。',
 'genshin':'在提瓦特开放世界探索，结合元素反应与队伍搭配进行战斗。',
 'starrail':'以星际旅行为背景，通过角色配队展开回合制战斗。',
 'zzz':'围绕都市与空洞探索，结合小队切换和动作战斗。',
 'wukong':'以西游题材展开动作冒险，探索场景并挑战不同首领。',
 'lol':'两队通过英雄分工、经济成长与地图目标争夺胜利。',
 'valorant':'通过特工技能和枪械配合完成攻防目标。',
 'elden':'在交界地探索，结合角色构筑、关卡和首领战斗。',
 'bg3':'以队伍探索和回合制战斗展开故事，选择影响角色与剧情。',
 'cyberpunk':'在夜之城探索，结合义体、技能和剧情选择塑造角色。',
 'witcher':'杰洛特在开放世界追踪线索、处理委托并作出故事选择。',
 'fortnite':'包括战术竞技与创作体验，围绕多人互动和持续内容展开。',
 'warframe':'操作战甲执行合作任务，收集装备并组合不同能力。'}
by_id={n['id']:n for n in nodes}
for n in nodes:
    attributes=[dict(label='节点类型',value={'company':'厂商 / 品牌','studio':'工作室 / 团队','game':'游戏 / 系列','investor':'股东 / 控股主体'}[n['kind']]),dict(label='地区口径',value=n['region'])]
    if n['kind']=='game':
        genre=n.get('genre',n['description']);n['genre']=genre
        devs=[by_id[e['a']]['name'] for e in edges if e['b']==n['id'] and e['kind']=='develop']
        pubs=[by_id[e['a']]['name'] for e in edges if e['b']==n['id'] and e['kind']=='publish']
        n['description']=briefs.get(n['id'],n['description'])
        if n['description']==genre: n['description']=n['name']+'：'+genre+'作品，详见对应官方产品资料。'
        attributes.extend([dict(label='游戏类型',value=genre),dict(label='开发方',value='、'.join(devs) or '本图未单独收录'),dict(label='发行方',value='、'.join(pubs) or '本图未单独收录'),dict(label='作品口径',value='系列视图' if '系列' in genre else '单款游戏')])
        n.setdefault('descriptionSource',next(e['source'] for e in edges if e['b']==n['id'] and e['kind'] in ['develop','publish']))
    else:
        holders=[e for e in edges if e['b']==n['id'] and e['kind'] in ['control','invest']]
        products=[by_id[e['b']]['name'] for e in edges if e['a']==n['id'] and e['kind'] in ['develop','publish']]
        parent_orgs=[by_id[e['a']]['name'] for e in edges if e['b']==n['id'] and e['kind']=='member']
        attributes.extend([dict(label='主体口径',value=n.get('entityType','品牌 / 业务视图' if n['id'] in ['tencent','xbox'] else '组织')),dict(label='所属组织',value='、'.join(parent_orgs) or '本图未记录上级组织'),dict(label='已记录股东',value='、'.join(by_id[e['a']]['name'] for e in holders) or '尚未收录股权资料；不代表没有股东'),dict(label='代表作品',value='、'.join(products[:6]) or '本节点未直接记录开发或发行作品')])
        if n['kind']=='investor': attributes.append(dict(label='资本关联',value=str(sum(e['a']==n['id'] and e['kind'] in ['control','invest'] for e in edges))+' 个已记录对象'))
    attributes.append(dict(label='资料口径',value='精选公开来源；股权以各条关系的报告日期为准'))
    n['attributes']=attributes

with (ROOT/'shareholding-correspondence.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.writer(f);writer.writerow(['股东/控制主体','被投资节点','关系','比例(%)','报告期','经由主体','交易状态','来源','说明'])
    for e in edges:
        if e['kind'] not in ['control','invest']:continue
        writer.writerow([by_id[e['a']]['name'],by_id[e['b']]['name'],e['kind'],e['percentage'] if e['percentage'] is not None else '未披露',e['asOf'],e['via'],e['status'],sources[e['source']]['url'],e['note']+' '+e['temporalNote']])
