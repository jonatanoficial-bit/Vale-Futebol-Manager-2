from pathlib import Path
import json, re, textwrap, hashlib, zipfile, os, shutil, datetime
root=Path('/mnt/data/vfm_build')

def slug(s):
    import unicodedata, re
    s=unicodedata.normalize('NFD', s).encode('ascii','ignore').decode('ascii').lower()
    s=re.sub(r'\b(fc|futebol clube|club de regatas|sport club|saf)\b','',s)
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-')
    return s or 'clube'

serie_a = [
('palmeiras','Palmeiras',88,165,450,'Allianz Parque'),('flamengo','Flamengo',89,185,520,'Maracanã'),('fluminense','Fluminense',84,112,270,'Maracanã'),('sao-paulo','São Paulo',82,96,235,'Morumbis'),('athletico-pr','Athletico Paranaense',82,93,225,'Ligga Arena'),('red-bull-bragantino','Red Bull Bragantino',78,74,170,'Cícero de Souza Marques'),('bahia','Bahia',79,86,195,'Arena Fonte Nova'),('coritiba','Coritiba SAF',74,50,95,'Couto Pereira'),('botafogo','Botafogo',83,118,280,'Nilton Santos'),('atletico-mg','Atlético-MG',83,120,290,'Arena MRV'),('internacional','Internacional',81,92,230,'Beira-Rio'),('vasco','Vasco da Gama SAF',78,72,180,'São Januário'),('cruzeiro','Cruzeiro',80,84,210,'Mineirão'),('vitoria','Vitória',73,42,88,'Barradão'),('gremio','Grêmio',81,86,220,'Arena do Grêmio'),('santos','Santos FC',79,92,210,'Vila Belmiro'),('corinthians','Corinthians',80,94,240,'Neo Química Arena'),('remo','Remo',70,32,64,'Baenão'),('mirassol','Mirassol',71,36,72,'Maião'),('chapecoense','Chapecoense',69,30,58,'Arena Condá')]
serie_b = [
('vila-nova','Vila Nova',69,30,60,'Onésio Brasileiro Alvarenga'),('fortaleza','Fortaleza SAF',77,67,150,'Castelão'),('ceara','Ceará',74,48,100,'Castelão'),('novorizontino','Novorizontino SAF',71,38,75,'Jorge Ismael de Biasi'),('avai','Avaí',70,36,70,'Ressacada'),('athletic-club','Athletic Club',68,31,58,'Arena Sicredi'),('operario','Operário',69,33,62,'Germano Krüger'),('botafogo-sp','Botafogo-SP',68,30,55,'Santa Cruz'),('sao-bernardo','São Bernardo',68,30,56,'Primeiro de Maio'),('criciuma','Criciúma',71,39,78,'Heriberto Hülse'),('juventude','Juventude',72,42,82,'Alfredo Jaconi'),('goias','Goiás',73,45,90,'Serrinha'),('sport-recife','Sport Recife',74,48,98,'Ilha do Retiro'),('nautico','Náutico',67,28,52,'Aflitos'),('cuiaba','Cuiabá SAF',71,40,80,'Arena Pantanal'),('londrina','Londrina SAF',67,27,50,'Estádio do Café'),('atletico-go','Atlético-GO SAF',71,39,78,'Antônio Accioly'),('ponte-preta','Ponte Preta',68,30,58,'Moisés Lucarelli'),('crb','CRB',68,31,60,'Rei Pelé'),('america-mg','América-MG',72,42,84,'Independência')]
other = [
('argentina-liga','ar','River Plate',84,110,260,'Monumental'),('argentina-liga','ar','Boca Juniors',83,105,245,'La Bombonera'),('premier-league','gb','Manchester City',92,300,980,'Etihad Stadium'),('premier-league','gb','Liverpool',91,285,900,'Anfield'),('laliga','es','Real Madrid',94,330,1100,'Santiago Bernabéu'),('laliga','es','Barcelona',92,300,950,'Camp Nou'),('serie-a-italia','it','Internazionale',90,230,720,'San Siro'),('serie-a-italia','it','Juventus',88,215,650,'Allianz Stadium'),('bundesliga','de','Bayern München',93,300,980,'Allianz Arena'),('bundesliga','de','Borussia Dortmund',87,180,560,'Signal Iduna Park'),('ligue-1','fr','Paris SG',92,310,1000,'Parc des Princes'),('liga-portugal','pt','Benfica',86,150,430,'Estádio da Luz'),('eredivisie','nl','Ajax',83,105,300,'Johan Cruijff Arena'),('mls','us','Inter Miami',80,90,250,'Chase Stadium'),('saudi-pro-league','sa','Al Hilal',86,220,520,'Kingdom Arena')]
country_names={'br':'Brasil','ar':'Argentina','gb':'Inglaterra','es':'Espanha','it':'Itália','de':'Alemanha','fr':'França','pt':'Portugal','nl':'Holanda','us':'Estados Unidos','sa':'Arábia Saudita'}

def team_obj(t, leagueId, league, tier):
    tid,name,level,budget,value,stad=t
    return {"id":tid,"name":name,"country":"br","countryName":"Brasil","leagueId":leagueId,"league":league,"season":2026,"level":level,"budget":budget,"value":value,"stadium":stad,"reputation":max(60,min(95,level)),"board":"Classificar para competições compatíveis com a força do elenco" if tier==1 else "Disputar acesso ou estabilizar a temporada","difficulty":"Alta cobrança" if level>=82 else ("Médio" if level>=73 else "Desafio"),"competitions":[league,"Copa do Brasil"] + (["Libertadores"] if leagueId=='brasileirao-a' and level>=83 else (["Sul-Americana"] if leagueId=='brasileirao-a' and level>=77 else []))}

def other_obj(o):
    leagueId,country,name,level,budget,value,stad=o; tid=slug(name)
    leagueName={"argentina-liga":"Liga Profesional Argentina","premier-league":"Premier League","laliga":"LaLiga","serie-a-italia":"Serie A Itália","bundesliga":"Bundesliga","ligue-1":"Ligue 1","liga-portugal":"Liga Portugal","eredivisie":"Eredivisie","mls":"MLS","saudi-pro-league":"Saudi Pro League"}[leagueId]
    return {"id":tid,"name":name,"country":country,"countryName":country_names[country],"leagueId":leagueId,"league":leagueName,"season":2026,"level":level,"budget":budget,"value":value,"stadium":stad,"reputation":level,"board":"Projeto internacional","difficulty":"Alta cobrança","competitions":[leagueName,"Copa nacional"]}

teams=[team_obj(t,'brasileirao-a','Brasileirão Série A 2026',1) for t in serie_a]+[team_obj(t,'brasileirao-b','Brasileirão Série B 2026',2) for t in serie_b]+[other_obj(o) for o in other]
players=[["Neymar","PE",84],["Gabriel Barbosa","ATA",79],["Rony","ATA",76],["Gabriel Menino","MC",75],["Lucas Veríssimo","ZAG",77],["Mayke","LD",71],["Zé Rafael","MC",76],["Álvaro Barreal","MEI",75]]
screens=[["lobby","Lobby","🏠"],["championship","Campeonato","🏆"],["calendar","Agenda","📅"],["formation","Tática","🧩"],["training","Treino","🔶"],["standings","Tabela","📊"],["transfers","Transferências","🔁"],["staff","Staff","👥"],["sponsorship","Patrocínio","🤝"],["club","Clube","🛡️"],["settings","Config","⚙️"]]
countries=[{"code":"br","name":"Brasil","continent":"América do Sul"},{"code":"ar","name":"Argentina","continent":"América do Sul"},{"code":"uy","name":"Uruguai","continent":"América do Sul"},{"code":"cl","name":"Chile","continent":"América do Sul"},{"code":"co","name":"Colômbia","continent":"América do Sul"},{"code":"py","name":"Paraguai","continent":"América do Sul"},{"code":"ec","name":"Equador","continent":"América do Sul"},{"code":"pe","name":"Peru","continent":"América do Sul"},{"code":"mx","name":"México","continent":"América do Norte"},{"code":"us","name":"Estados Unidos","continent":"América do Norte"},{"code":"gb","name":"Inglaterra","continent":"Europa"},{"code":"es","name":"Espanha","continent":"Europa"},{"code":"pt","name":"Portugal","continent":"Europa"},{"code":"it","name":"Itália","continent":"Europa"},{"code":"de","name":"Alemanha","continent":"Europa"},{"code":"fr","name":"França","continent":"Europa"},{"code":"nl","name":"Holanda","continent":"Europa"},{"code":"be","name":"Bélgica","continent":"Europa"},{"code":"tr","name":"Turquia","continent":"Europa"},{"code":"sa","name":"Arábia Saudita","continent":"Ásia"},{"code":"ve","name":"Venezuela","continent":"América do Sul"},{"code":"bo","name":"Bolívia","continent":"América do Sul"}]
leagueCatalog=[{"id":"brasileirao-a","country":"br","name":"Brasileirão Série A 2026","tier":1},{"id":"brasileirao-b","country":"br","name":"Brasileirão Série B 2026","tier":2},{"id":"argentina-liga","country":"ar","name":"Liga Profesional Argentina","tier":1},{"id":"premier-league","country":"gb","name":"Premier League","tier":1},{"id":"laliga","country":"es","name":"LaLiga","tier":1},{"id":"serie-a-italia","country":"it","name":"Serie A Itália","tier":1},{"id":"bundesliga","country":"de","name":"Bundesliga","tier":1},{"id":"ligue-1","country":"fr","name":"Ligue 1","tier":1},{"id":"liga-portugal","country":"pt","name":"Liga Portugal","tier":1},{"id":"eredivisie","country":"nl","name":"Eredivisie","tier":1},{"id":"mls","country":"us","name":"MLS","tier":1},{"id":"saudi-pro-league","country":"sa","name":"Saudi Pro League","tier":1}]
gameModes=[{"id":"career","name":"Carreira esportiva completa","short":"Carreira","desc":"Comece com metas reais, pressão de diretoria, reputação, propostas de clubes e seleção nacional."},{"id":"sandbox","name":"Sandbox livre","short":"Sandbox","desc":"Liberdade para testar clubes, competições, elencos e partidas sem travas rígidas de reputação."}]
content="// Vale Futebol Manager Gold Edition - gameData v2.6.2\n// Brasil 2026: Série A/Série B atualizadas por tabela CBF consultada em 19/05/2026.\n"
for name,val in [('countries',countries),('gameModes',gameModes),('leagueCatalog',leagueCatalog),('teams',teams),('screens',screens),('players',players)]:
    content+=f"export const {name} = "+json.dumps(val, ensure_ascii=False, indent=2)+";\n"
content += "export const tableRows = "+json.dumps([t[1] for t in serie_a], ensure_ascii=False, indent=2)+";\n"
content += "export const commentary = "+json.dumps(["Carreira 2026 iniciada.","Calendário gerado conforme clube escolhido.","Partida avança automaticamente quando o modo auto estiver ativo.","Quatro melhores da Série A entram na Libertadores.","Quatro piores da Série A caem para a Série B.","Quatro melhores da Série B sobem para a Série A."], ensure_ascii=False, indent=2)+";\n"
(root/'js/data/gameData.js').write_text(content, encoding='utf-8')

# league system file
rules={
  "version":"2026-v1","updatedAt":"2026-05-19","sourceNote":"Divisões brasileiras 2026 baseadas nas tabelas oficiais CBF consultadas em 19/05/2026.",
  "brazil":{"serieA":[dict(id=i,name=n) for i,n,_,_,_,_ in serie_a],"serieB":[dict(id=i,name=n) for i,n,_,_,_,_ in serie_b],"rules":{"serieA":{"teams":20,"relegation":4,"libertadoresDirect":4,"sudamericanaWindow":"5º ao 12º conforme vagas não usadas por copas"},"serieB":{"teams":20,"promotion":4,"relegation":4},"continental":{"libertadores":"Top 4 da Série A recebem vaga continental principal no jogo; campeões de Copa do Brasil/Libertadores/Sul-Americana podem liberar vagas extras em futuras builds.","sulamericana":"Faixa intermediária da Série A entra na Sul-Americana no modo carreira.","interclubWorldCup":"Campeões continentais podem entrar no Mundial de Clubes, tratado como ciclo internacional de 4 anos no jogo."},"nationalTeam":{"continentalCupCycle":4,"worldCupQualifiers":True,"worldCupCycle":4,"clubWorldCupCycle":4}}}
}
(root/'data/league-system-2026.json').write_text(json.dumps(rules, ensure_ascii=False, indent=2), encoding='utf-8')
(root/'data/brazilian-leagues-2026.json').write_text(json.dumps(rules['brazil'], ensure_ascii=False, indent=2), encoding='utf-8')

# standings data generate
import random
random.seed(7)
def standings_rows(clubs):
    rows=[]
    for pos,(tid,n,level,_,_,_) in enumerate(clubs,1):
        p=16 if len(clubs)==20 and tid in [x[0] for x in serie_a] else 5
        base=max(2, int((level-60)/4)+random.randint(0,7))
        w=max(0,min(p-1,base)); max_d=max(0,min(6,p-w)); d=random.randint(0, max_d); l=p-w-d
        gf=max(3,int(level/4)+random.randint(-3,6)); ga=max(2,int((100-level)/5)+random.randint(-2,5)); pts=w*3+d
        rows.append({"pos":pos,"club":n,"id":tid,"p":p,"w":w,"d":d,"l":l,"gf":gf,"ga":ga,"pts":pts,"form":["V","E","D","V","E"],"user":False})
    rows.sort(key=lambda r:(-r['pts'],-(r['gf']-r['ga']),-r['gf']))
    for i,r in enumerate(rows,1): r['pos']=i
    return rows
std={"brasileirao-a":standings_rows(serie_a),"brasileirao-b":standings_rows(serie_b)}
standingsCompetitions=[{"id":"brasileirao-a","name":"Brasileirão Série A 2026","short":"A","scope":"Liga nacional","logo":"assets/competitions/brasileirao_a.png"},{"id":"brasileirao-b","name":"Brasileirão Série B 2026","short":"B","scope":"Liga nacional","logo":"assets/competitions/brasileirao_b.png"},{"id":"copa-do-brasil","name":"Copa do Brasil","short":"CDB","scope":"Copa eliminatória","logo":"assets/competitions/copa_do_brasil.png"},{"id":"libertadores","name":"Libertadores","short":"LIB","scope":"Continental","logo":"assets/competitions/libertadores.png"},{"id":"sulamericana","name":"Sul-Americana","short":"SUL","scope":"Continental","logo":"assets/competitions/sulamericana.png"},{"id":"mundial-interclubes","name":"Mundial de Clubes","short":"MUN","scope":"Ciclo 4 anos","logo":"assets/competitions/intercontinental.png"}]
(root/'js/data/standingsData.js').write_text("// standingsData v2.6.2 - Brasileirão A/B 2026 com regras de acesso/descenso\nexport const standingsCompetitions = "+json.dumps(standingsCompetitions,ensure_ascii=False,indent=2)+";\nexport const standingsTables = "+json.dumps(std,ensure_ascii=False,indent=2)+";\n", encoding='utf-8')

# seasonData with generic schedule and rules
competitions=[
{"id":"brasileirao-a","name":"Brasileirão Série A 2026","short":"BRA","type":"Liga","scope":"Nacional","status":"Em andamento","round":"Temporada 2026","priority":"Alta","objective":"Top 4: Libertadores; últimos 4: Série B","prize":"Premiação por posição","color":"gold"},
{"id":"brasileirao-b","name":"Brasileirão Série B 2026","short":"BRB","type":"Liga","scope":"Nacional","status":"Em andamento","round":"Temporada 2026","priority":"Alta","objective":"Top 4: acesso; últimos 4: Série C","prize":"Acesso e premiação","color":"blue"},
{"id":"copa-do-brasil","name":"Copa do Brasil","short":"CDB","type":"Copa","scope":"Nacional","status":"Em andamento","round":"Fases eliminatórias","priority":"Alta","objective":"Avançar fases","prize":"Bônus por fase","color":"blue"},
{"id":"libertadores","name":"Libertadores","short":"LIB","type":"Continental","scope":"América do Sul","status":"Classificação por desempenho","round":"Temporada continental","priority":"Muito alta","objective":"Top 4 da Série A garante caminho principal","prize":"Mundial de Clubes para campeão continental","color":"gold"},
{"id":"sulamericana","name":"Sul-Americana","short":"SUL","type":"Continental","scope":"América do Sul","status":"Classificação por desempenho","round":"Temporada continental","priority":"Alta","objective":"Faixa intermediária nacional","prize":"Vaga continental e projeção internacional","color":"green"},
{"id":"mundial-interclubes","name":"Mundial de Clubes","short":"MUN","type":"Mundial","scope":"Global","status":"Ciclo de 4 anos","round":"Próximo ciclo internacional","priority":"Elite","objective":"Campeões continentais entram no ciclo","prize":"Título mundial","color":"dark"}]
months=[{"id":m[:3].lower(),"name":m,"focus":f,"matches":n,"intensity":i} for m,f,n,i in [('Janeiro','Pré-temporada',2,'Média'),('Fevereiro','Estaduais e ajustes',5,'Alta'),('Março','Copas e preparação nacional',5,'Alta'),('Abril','Início nacional',6,'Alta'),('Maio','Sequência nacional',7,'Muito alta'),('Junho','Janela e calendário FIFA',5,'Média'),('Julho','Copas e liga',8,'Muito alta'),('Agosto','Reta continental',7,'Muito alta'),('Setembro','Eliminatórias e liga',6,'Alta'),('Outubro','Pressão por objetivos',7,'Muito alta'),('Novembro','Decisões',6,'Máxima'),('Dezembro','Relatórios e finalização',3,'Média')]]
schedule=[
{"date":"2026-05-24","day":"Dom","home":"CLUBE_USUARIO","away":"RIVAL_1","competition":"LIGA_DO_CLUBE","stage":"Rodada atual","venue":"ESTADIO_CLUBE","type":"match","importance":88,"status":"Próximo jogo"},
{"date":"2026-05-31","day":"Dom","home":"RIVAL_2","away":"CLUBE_USUARIO","competition":"LIGA_DO_CLUBE","stage":"Rodada seguinte","venue":"Estádio rival","type":"match","importance":82,"status":"Agendado"},
{"date":"2026-06-04","day":"Qui","home":"CLUBE_USUARIO","away":"RIVAL_3","competition":"Copa do Brasil","stage":"Jogo eliminatório","venue":"ESTADIO_CLUBE","type":"match","importance":86,"status":"Copa"},
{"date":"2026-06-07","day":"Dom","home":"CLUBE_USUARIO","away":"RIVAL_4","competition":"LIGA_DO_CLUBE","stage":"Rodada nacional","venue":"ESTADIO_CLUBE","type":"match","importance":79,"status":"Agendado"},
{"date":"2026-06-11","day":"Qui","home":"RIVAL_5","away":"CLUBE_USUARIO","competition":"LIGA_DO_CLUBE","stage":"Rodada nacional","venue":"Estádio rival","type":"match","importance":80,"status":"Agendado"},
{"date":"2026-06-15","day":"Seg","title":"Treino regenerativo","competition":"Treino","stage":"Recuperação","venue":"CT","type":"training","importance":55,"status":"Planejado"},
{"date":"2026-06-20","day":"Sáb","title":"Coletiva e relatório","competition":"Imprensa","stage":"Pré-jogo","venue":"Auditório","type":"media","importance":50,"status":"Opcional"}]
season_content="export const competitions = "+json.dumps(competitions,ensure_ascii=False,indent=2)+";\nexport const seasonMonths = "+json.dumps(months,ensure_ascii=False,indent=2)+";\nexport const schedule = "+json.dumps(schedule,ensure_ascii=False,indent=2)+";\nexport const seasonRules = "+json.dumps(rules['brazil']['rules'],ensure_ascii=False,indent=2)+";\nexport const calendarDays = Array.from({length:31}, (_,i)=>{ const day=i+1; const events=schedule.filter(ev=>Number(ev.date.slice(-2))===day); return {day,events}; });\nexport function eventTitle(ev){ if(ev.type==='match') return `${ev.home} x ${ev.away}`; return ev.title || ev.stage || ev.competition; }\nexport function eventClass(ev){ return ev.type==='match' ? 'event-match' : ev.type==='training' ? 'event-training' : ev.type==='board' ? 'event-board' : ev.type==='market' ? 'event-market' : 'event-soft'; }\n"
(root/'js/data/seasonData.js').write_text(season_content, encoding='utf-8')

# Patch state.js using string replacements
p=root/'js/systems/state.js'
s=p.read_text(encoding='utf-8')
s=s.replace("import { schedule } from '../data/seasonData.js';", "import { schedule } from '../data/seasonData.js';\nimport { teams } from '../data/gameData.js';")
s=s.replace("const key = 'vfm_gold_save_v251';", "const key = 'vfm_gold_save_v262';")
s=s.replace("const legacyKeys = [", "const legacyKeys = ['vfm_gold_save_v261', 'vfm_gold_save_v260', 'vfm_gold_save_v251', ")
s=s.replace("clubId:'santos', season:2026,", "clubId:'santos', season:2026,")
s=s.replace("match:{ id:'2026-05-24-santos-palmeiras', date:'2026-05-24', competitionId:'brasileirao-a', competition:'Brasileirão Série A', stage:'Rodada 12', minute:57, home:'santos', away:'palmeiras', homeGoals:1, awayGoals:0, speed:1, finalized:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[] },", "match:{ id:'2026-05-24-santos-palmeiras', date:'2026-05-24', competitionId:'brasileirao-a', competition:'Brasileirão Série A 2026', stage:'Rodada atual', minute:1, home:'santos', away:'palmeiras', homeGoals:0, awayGoals:0, speed:1, autoPlay:false, finalized:false, postMatchReady:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[] },")
s=s.replace("career:{ currentDate:'2026-05-19', matchday:12, completedMatches:[], lastResult:null, integrationLog:['Carreira migrada para v2.5.1 com central de atualização de elencos, importação JSON segura e Santos 2026 atualizado.'] },", "career:{ currentDate:'2026-05-19', matchday:1, completedMatches:[], lastResult:null, promotionRelegation:{serieARelegation:4,serieBPromotion:4,libertadoresTop:4}, integrationLog:['Carreira migrada para v2.6.2 com calendário gerado pelo clube escolhido e ligas brasileiras 2026.'] },")
s=s.replace("gameplay:{ difficulty:'realistic', aiVersion:'v2.5.1'", "gameplay:{ difficulty:'realistic', aiVersion:'v2.6.2'")
s=s.replace("auditVersion:'v2.5.1'", "auditVersion:'v2.6.2'")
# insert helpers before startCareer
marker="export function startCareer(){\n  state = normalize({"
helpers=r'''
function getTeam(id){ return teams.find(t => t.id === id) || teams.find(t=>t.id==='santos') || teams[0]; }
function leagueTeams(leagueId){ return teams.filter(t => t.leagueId === leagueId); }
function matchLabelForClub(team){ return team?.leagueId === 'brasileirao-b' ? 'Brasileirão Série B 2026' : 'Brasileirão Série A 2026'; }
function buildClubFixture(clubId, index=0){
  const club = getTeam(clubId);
  const pool = leagueTeams(club.leagueId).filter(t=>t.id !== club.id);
  const fallbackPool = teams.filter(t=>t.id !== club.id);
  const rivals = (pool.length ? pool : fallbackPool);
  const rival = rivals[index % Math.max(1, rivals.length)] || getTeam('palmeiras');
  const homeUser = index % 2 === 0;
  const dateList = ['2026-05-24','2026-05-31','2026-06-07','2026-06-14','2026-06-21','2026-06-28','2026-07-05','2026-07-12'];
  const date = dateList[index % dateList.length];
  const home = homeUser ? club : rival;
  const away = homeUser ? rival : club;
  return {
    id:`${date}-${home.id}-${away.id}`,
    date,
    competitionId: club.leagueId || 'brasileirao-a',
    competition: matchLabelForClub(club),
    stage:`Rodada ${index + 1}`,
    minute:1,
    home:home.id,
    away:away.id,
    homeGoals:0,
    awayGoals:0,
    speed:1,
    autoPlay:false,
    finalized:false,
    postMatchReady:false,
    substitutions:[],
    maxSubs:5,
    decision:'balanced',
    tacticalBoost:0,
    usedSubPlayers:[]
  };
}
function nextFixtureForClub(clubId, afterIndex=0){ return buildClubFixture(clubId, afterIndex); }
'''
s=s.replace(marker, helpers+"\n"+marker)
# replace startCareer body fully
s=re.sub(r"export function startCareer\(\)\{.*?\n\}\n\nfunction scoreUntilMinute", r"export function startCareer(){\n  const chosenClub = state.ui.selectedClub || state.clubId || 'santos';\n  const firstMatch = buildClubFixture(chosenClub, 0);\n  state = normalize({\n    ...state,\n    manager:{\n      ...state.manager,\n      avatar: state.ui.selectedAvatar || state.manager.avatar,\n      country: state.ui.selectedCountry || state.manager.country,\n      mode: state.ui.selectedMode || state.manager.mode\n    },\n    clubId: chosenClub,\n    match: firstMatch,\n    career:{...state.career, currentDate:'2026-05-19', matchday:1, completedMatches:[], lastResult:null},\n    route:'lobby'\n  });\n  persist();\n}\n\nfunction scoreUntilMinute", s, flags=re.S)
# replace findNextMatch body simpler
s=re.sub(r"function findNextMatch\(afterId\)\{.*?\n\}\nfunction slug", r"function findNextMatch(afterId){\n  const completedCount = Array.isArray(state.career?.completedMatches) ? state.career.completedMatches.length : 0;\n  return nextFixtureForClub(state.clubId || state.ui?.selectedClub || 'santos', completedCount + 1);\n}\nfunction slug", s, flags=re.S)
# normalize selected club migration and stale match
s=s.replace("if(!merged.ui.transferFilter) merged.ui.transferFilter = 'all';\n  return merged;", "if(!merged.ui.transferFilter) merged.ui.transferFilter = 'all';\n  const activeClub = merged.clubId || merged.ui.selectedClub || 'santos';\n  if(merged.ui.selectedClub !== activeClub) merged.ui.selectedClub = activeClub;\n  if(!merged.match || !merged.match.home || !merged.match.away || (activeClub !== 'santos' && (merged.match.home === 'santos' || merged.match.away === 'santos') && !merged.career.completedMatches.length)) {\n    merged.match = buildClubFixture(activeClub, 0);\n  }\n  if(typeof merged.match.autoPlay !== 'boolean') merged.match.autoPlay = false;\n  if(typeof merged.match.postMatchReady !== 'boolean') merged.match.postMatchReady = Boolean(merged.match.finalized);\n  return merged;")
# finishMatch points from selected club, post ready
s=s.replace("points: score.home > score.away ? 3 : score.home === score.away ? 1 : 0,", "points: pointsForClub(current, score),")
s=s.replace("match: current,", "match: {...current, postMatchReady:true, autoPlay:false},")
# add points function before finishMatch
s=s.replace("export function finishMatch(){", "function pointsForClub(match, score){\n  const club = state.clubId || 'santos';\n  const isHome = match.home === club;\n  const gf = isHome ? score.home : score.away;\n  const ga = isHome ? score.away : score.home;\n  return gf > ga ? 3 : gf === ga ? 1 : 0;\n}\nexport function finishMatch(){")
# add autoplay function after setMatchSpeed
s=s.replace("export function setMatchSpeed(speed=1){\n  state = normalize({...state, match:{...state.match, speed:Number(speed)||1}});\n  persist();\n}\n", "export function setMatchSpeed(speed=1){\n  state = normalize({...state, match:{...state.match, speed:Number(speed)||1}});\n  persist();\n}\nexport function setMatchAutoPlay(enabled=true){\n  state = normalize({...state, match:{...state.match, autoPlay:Boolean(enabled)}});\n  persist();\n}\n")
# advance at 90 return finish
s=s.replace("if(current.minute >= 90) finishMatch(); else persist();", "if(current.minute >= 90) finishMatch(); else persist();")
p.write_text(s, encoding='utf-8')

# patch imports router for autoplay and finish route lobby
p=root/'js/systems/router.js'
s=p.read_text(encoding='utf-8')
s=s.replace("renewPlayerContract, createManualBackup", "renewPlayerContract, setMatchAutoPlay, createManualBackup")
s=s.replace("scope.querySelectorAll('[data-action=\"match-finish\"]').forEach(btn => btn.addEventListener('click', () => { finishMatch(); render(); }));", "scope.querySelectorAll('[data-action=\"match-finish\"]').forEach(btn => btn.addEventListener('click', () => { finishMatch(); go('lobby'); }));\n  scope.querySelectorAll('[data-action=\"match-autoplay\"]').forEach(btn => btn.addEventListener('click', () => { setMatchAutoPlay(btn.dataset.enabled !== 'false'); render(); }));")
p.write_text(s, encoding='utf-8')

# patch app imports and interval
p=root/'js/app.js'
s=p.read_text(encoding='utf-8')
s=s.replace("import { load, getState }", "import { load, getState, advanceMatch }")
s=s.replace("Build v2.6.1", "Build v2.6.2")
s=s.replace("runRuntimeAudit(getState(), {phase:'v2.6.1 boot'});", "runRuntimeAudit(getState(), {phase:'v2.6.2 boot'});")
s=s.replace("render();\n  setInterval(()=>{ document.querySelectorAll('#buildBadge,.build-badge').forEach(el=>{ if(!el.textContent.trim()) el.textContent = buildInfo.buildLabel; }); }, 500);", "render();\n  setInterval(()=>{ document.querySelectorAll('#buildBadge,.build-badge').forEach(el=>{ if(!el.textContent.trim()) el.textContent = buildInfo.buildLabel; }); }, 500);\n  setInterval(()=>{ const s=getState(); if(s.route==='match' && s.match?.autoPlay && !s.match?.finalized){ advanceMatch(Number(s.match.speed || 1) * 5); render(); } }, 2200);")
p.write_text(s, encoding='utf-8')

# patch match screen dynamic score and buttons
p=root/'js/screens/match.js'
s=p.read_text(encoding='utf-8')
s=s.replace("import { computeMatchAI, buildBalanceSummary } from '../systems/balance.js';", "import { computeMatchAI, buildBalanceSummary, scoreFromTimeline } from '../systems/balance.js';")
s=re.sub(r"function scoreUntil\(minute\)\{.*?\n\}", "function scoreUntil(minute, matchState, state){\n  return scoreFromTimeline(matchTimeline, {...(matchState||{}), minute}, state);\n}", s, flags=re.S)
s=s.replace("const score = scoreUntil(minute);", "const score = scoreUntil(minute, state.match || {}, state);")
s=s.replace("const controlLabel = isOver ? 'Partida encerrada' : 'Avançar +5 min';", "const controlLabel = isOver ? 'Ir ao lobby' : 'Avançar +5 min';\n  const autoLabel = state.match?.autoPlay ? 'Pausar automático' : 'Avançar automático';")
s=s.replace("<button class=\"secondary-btn mini\" data-action=\"match-advance\">${controlLabel}</button>", "${isOver ? '<button class=\"secondary-btn mini\" data-route=\"lobby\">Ir ao lobby</button>' : '<button class=\"secondary-btn mini\" data-action=\"match-advance\">'+controlLabel+'</button>'}")
s=s.replace("<button class=\"main-btn\" data-action=\"match-advance\">${controlLabel}</button><button class=\"secondary-btn danger\" data-action=\"match-finish\">Finalizar partida</button>", "${isOver ? '<button class=\"main-btn\" data-route=\"lobby\">Salvar e voltar ao lobby</button>' : '<button class=\"main-btn\" data-action=\"match-advance\">Avançar +5 min</button><button class=\"secondary-btn\" data-action=\"match-autoplay\" data-enabled=\"'+(!state.match?.autoPlay)+'\">'+autoLabel+'</button><button class=\"secondary-btn danger\" data-action=\"match-finish\">Finalizar e voltar ao lobby</button>'}")
# replace the default hardcoded text indirectly? leave
p.write_text(s, encoding='utf-8')

# update build info files
build_dir=root/'build'; build_dir.mkdir(exist_ok=True)
build={"version":"v2.6.2","buildLabel":"Build v2.6.2 | 2026-05-19 | 17:50 UTC","date":"2026-05-19","time":"17:50 UTC","notes":"Calendário por clube escolhido, Brasileirão A/B 2026, regras de acesso/descenso e partida automática com pós-jogo para lobby."}
(build_dir/'build-info.json').write_text(json.dumps(build,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'BUILD_MANIFEST.txt').write_text("Vale Futebol Manager Gold Edition\nBuild v2.6.2 - 2026-05-19 17:50 UTC\nCorreções: clube escolhido agora gera calendário/partida próprios; Série A/B 2026; 4 acessos/descensos; Top 4 Libertadores; pós-jogo volta ao lobby; autoplay seguro.\n",encoding='utf-8')
(root/'LEAGUE_2026_GUIDE.md').write_text("# Guia de ligas 2026\n\n- Série A 2026 com 20 clubes conforme tabela CBF consultada em 19/05/2026.\n- Série B 2026 com 20 clubes conforme tabela CBF consultada em 19/05/2026.\n- 4 últimos da Série A caem para a Série B.\n- 4 primeiros da Série B sobem para a Série A.\n- Top 4 da Série A no jogo classifica para Libertadores.\n- Faixa intermediária prepara Sul-Americana.\n- Campeões continentais podem entrar no Mundial de Clubes em ciclo de 4 anos.\n\nArquivos principais: `data/league-system-2026.json`, `data/brazilian-leagues-2026.json`, `js/data/gameData.js`, `js/data/standingsData.js`.\n",encoding='utf-8')
# Patch any version strings in docs maybe not needed
print('[OK] patched v2.6.2')
