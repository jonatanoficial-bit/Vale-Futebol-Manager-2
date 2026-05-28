
import { continentalCompetitions, worldCompetitions, nationalTeamCompetitions, globalCalendarTemplates, qualificationRules } from '../data/worldCompetitionData.js';
import { deriveStandings } from './seasonEngine.js';
import { copaDoBrasilSnapshot } from './copaDoBrasilEngine.js';
import { clubLogo, safeImg } from './assets.js';
import { teams } from '../data/gameData.js';

export const WORLD_COMPETITION_ENGINE_VERSION = 'v4.3.0';
export const CONMEBOL_ENGINE_VERSION = 'v4.3.0';
export const INTERCONTINENTAL_ENGINE_VERSION = 'v4.3.0';

const CONTINENTAL_RULES_V420 = {
  season: 2026,
  libertadores: { teams:32, groups:8, teamsPerGroup:4, groupRounds:6, brazilSlots:5, championCupSlot:true, topPerGroup:2, prizeChampion:28000000, finalMonth:'Novembro', qualifiesTo:'Intercontinental / Mundial' },
  sulamericana: { teams:32, groups:8, teamsPerGroup:4, groupRounds:6, brazilSlots:[6,12], topPerGroup:2, prizeChampion:9000000, finalMonth:'Novembro', qualifiesTo:'Recopa / rota continental superior' },
  safety: {
    fillMissingInternationalTeams:true,
    preventDuplicateTeam:true,
    groupSizeGuard:true,
    knockoutPowerOfTwoGuard:true,
    calendarConflictGuard:true,
    championWorldSlotGuard:true
  }
};

const CONMEBOL_POOL = [
  ['river-plate','River Plate','ar',88], ['boca-juniors','Boca Juniors','ar',86], ['racing-club','Racing Club','ar',81], ['independiente','Independiente','ar',78],
  ['estudiantes','Estudiantes','ar',78], ['velez','Vélez Sarsfield','ar',77], ['argentinos-juniors','Argentinos Juniors','ar',74], ['talleres','Talleres','ar',76],
  ['penarol','Peñarol','uy',79], ['nacional-uy','Nacional-URU','uy',78], ['defensor','Defensor Sporting','uy',70], ['liverpool-uy','Liverpool-URU','uy',69],
  ['colo-colo','Colo-Colo','cl',77], ['universidad-chile','Universidad de Chile','cl',74], ['universidad-catolica','Universidad Católica','cl',73], ['palestino','Palestino','cl',69],
  ['olimpia','Olimpia','py',76], ['cerro-porteno','Cerro Porteño','py',75], ['libertad-py','Libertad','py',75], ['guarani-py','Guaraní-PY','py',70],
  ['ldu-quito','LDU Quito','ec',77], ['barcelona-sc','Barcelona SC','ec',75], ['independiente-del-valle','Independiente del Valle','ec',80], ['emelec','Emelec','ec',72],
  ['atletico-nacional','Atlético Nacional','co',76], ['millonarios','Millonarios','co',74], ['america-cali','América de Cali','co',72], ['junior','Junior Barranquilla','co',73],
  ['alianza-lima','Alianza Lima','pe',72], ['universitario','Universitario','pe',73], ['sporting-cristal','Sporting Cristal','pe',72], ['melgar','Melgar','pe',69],
  ['bolivar','Bolívar','bo',72], ['the-strongest','The Strongest','bo',71], ['caracas','Caracas FC','ve',68], ['deportivo-tachira','Deportivo Táchira','ve',68]
];

const UEFA_ELITE = [
  ['real-madrid','Real Madrid','es',96], ['manchester-city','Manchester City','en',95], ['bayern','Bayern de Munique','de',93], ['psg','Paris Saint-Germain','fr',91],
  ['liverpool','Liverpool','en',92], ['arsenal','Arsenal','en',90], ['inter','Inter de Milão','it',90], ['barcelona','Barcelona','es',91]
];

const GLOBAL_ELITE_POOL = [
  ['al-ahly','Al Ahly','eg',82], ['al-hilal','Al Hilal','sa',84], ['urawa-reds','Urawa Red Diamonds','jp',76], ['seattle-sounders','Seattle Sounders','us',75],
  ['monterrey','Monterrey','mx',79], ['club-america','Club América','mx',80], ['wac','Wydad AC','ma',76], ['auckland-city','Auckland City','nz',64]
];

const INTERCONTINENTAL_RULES_V430 = {
  season: 2026,
  name: 'Mundial/Intercontinental de Clubes',
  format: 'semifinal continental + final global contra campeão/elite UEFA',
  prizeChampion: 42000000,
  prizeRunnerUp: 19000000,
  reputationChampionBonus: 12,
  reputationRunnerUpBonus: 5,
  calendarWindow: 'Dezembro',
  safety: {
    libertadoresChampionRequired:true,
    uefaReferenceRequired:true,
    financialImpactGuard:true,
    globalReputationGuard:true,
    knockoutRecovery:true,
    duplicateParticipantGuard:true
  }
};

function stableHash(s=''){ let h=0; for(const ch of String(s)) h=((h<<5)-h)+ch.charCodeAt(0)|0; return Math.abs(h); }
function normalizeClub(t, source='database'){
  return { id:t.id, name:t.name, country:t.country||'br', level:Number(t.level||t.reputation||70), reputation:Number(t.reputation||t.level||70), logo:clubLogo(t.id), source };
}
function placeholder([id,name,country,level], source='conmebol-pool'){
  return { id, name, country, level, reputation:level, logo:clubLogo(id), source };
}
function uniqueById(list=[]){
  const map = new Map();
  list.forEach(item=>{ if(item && item.id && !map.has(item.id)) map.set(item.id,item); });
  return Array.from(map.values());
}

export function currentLeaguePosition(state={}, leagueId=null){
  const clubId = state.clubId || state.ui?.selectedClub || 'santos';
  const club = teams.find(t=>t.id===clubId) || teams[0];
  const targetLeague = leagueId || club.leagueId || 'brasileirao-a';
  const table = deriveStandings(targetLeague, state.career?.completedMatches || []);
  const row = table.find(r=>r.id===clubId) || table[0] || {pos:1, pts:0, club:club.name};
  return {...row, leagueId:targetLeague, logo:clubLogo(clubId)};
}

export function qualificationForPosition(leagueId='brasileirao-a', pos=1){
  if(leagueId==='brasileirao-b'){
    if(pos<=4) return {label:'Acesso para Série A', level:'excellent', destination:'brasileirao-a'};
    if(pos>=17) return {label:'Zona de queda nacional', level:'danger', destination:'serie-c'};
    return {label:'Permanece na Série B', level:'neutral', destination:'brasileirao-b'};
  }
  if(pos<=5) return {label:'Vaga para Libertadores', level:'excellent', destination:'libertadores'};
  if(pos<=12) return {label:'Vaga para Sul-Americana', level:'good', destination:'sulamericana'};
  if(pos>=17) return {label:'Zona de rebaixamento', level:'danger', destination:'brasileirao-b'};
  return {label:'Meio da tabela', level:'neutral', destination:'none'};
}

export function brazilContinentalQualifiers(state={}){
  const completed = state.career?.completedMatches || [];
  const table = deriveStandings('brasileirao-a', completed);
  const copa = copaDoBrasilSnapshot(state);
  const baseLib = table.slice(0,5).map(r=>normalizeClub(teams.find(t=>t.id===r.id) || {id:r.id,name:r.club,level:75}, 'serie-a-top5'));
  const cupChampion = copa.bracket?.champion ? normalizeClub(copa.bracket.champion, 'copa-do-brasil-champion') : null;
  const libertadores = uniqueById([...baseLib, cupChampion].filter(Boolean)).slice(0,6);
  const sulamericana = uniqueById(table.slice(5,12).map(r=>normalizeClub(teams.find(t=>t.id===r.id) || {id:r.id,name:r.club,level:70}, 'serie-a-6-12')).filter(t=>!libertadores.some(l=>l.id===t.id))).slice(0,7);
  return { table, copa, libertadores, sulamericana, cupChampion };
}

function continentalTeams(state={}, competitionId='libertadores'){
  const q = brazilContinentalQualifiers(state);
  const brazil = competitionId==='libertadores' ? q.libertadores : q.sulamericana;
  const pool = CONMEBOL_POOL.map(c=>placeholder(c)).sort((a,b)=>(b.level-a.level)||a.name.localeCompare(b.name));
  const target = CONTINENTAL_RULES_V420[competitionId].teams;
  const merged = uniqueById([...brazil, ...pool]);
  let idx=1;
  while(merged.length<target){ merged.push({id:`${competitionId}-qualified-${idx}`, name:`Classificado CONMEBOL ${idx}`, country:'sa', level:65+(idx%8), reputation:65+(idx%8), logo:clubLogo('generic'), source:'auto-fill'}); idx++; }
  return merged.slice(0,target);
}

function splitGroups(clubs=[], groupCount=8){
  const groups = Array.from({length:groupCount}, (_,i)=>({id:String.fromCharCode(65+i), name:`Grupo ${String.fromCharCode(65+i)}`, teams:[], standings:[], matches:[]}));
  clubs.forEach((club,idx)=>groups[idx%groupCount].teams.push(club));
  return groups;
}
function goalsFor(a,b,seed,home=false){
  const raw=(stableHash(`${seed}-${a.id}`)%100)/100;
  const diff=(Number(a.level||70)-Number(b.level||70))/24;
  return Math.max(0, Math.min(5, Math.round(1.05 + diff + (home?.18:0) + raw*.95 + (raw>.84?1:0) - (raw<.16?1:0))));
}
function simulateGroups(groups=[], competitionId='libertadores'){
  return groups.map(group=>{
    const rows = group.teams.map(t=>({id:t.id, club:t.name, logo:t.logo, country:t.country, p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0, level:t.level}));
    const by = new Map(rows.map(r=>[r.id,r]));
    const matches=[];
    for(let i=0;i<group.teams.length;i++){
      for(let j=i+1;j<group.teams.length;j++){
        const pair=[ [group.teams[i],group.teams[j]], [group.teams[j],group.teams[i]] ];
        pair.forEach(([home,away],leg)=>{
          const id=`${competitionId}-${group.id}-${home.id}-${away.id}-${leg+1}`;
          const hg=goalsFor(home,away,id,true), ag=goalsFor(away,home,id,false);
          matches.push({id, competitionId, stage:group.name, home:home.id, away:away.id, homeName:home.name, awayName:away.name, homeGoals:hg, awayGoals:ag, summary:`${hg} x ${ag}`});
          const h=by.get(home.id), a=by.get(away.id); h.p++; a.p++; h.gf+=hg; h.ga+=ag; a.gf+=ag; a.ga+=hg;
          if(hg>ag){h.w++;a.l++;h.pts+=3;} else if(hg<ag){a.w++;h.l++;a.pts+=3;} else {h.d++;a.d++;h.pts++;a.pts++;}
        });
      }
    }
    const standings = rows.sort((a,b)=>(b.pts-a.pts)||((b.gf-b.ga)-(a.gf-a.ga))||(b.gf-a.gf)||(b.level-a.level)||a.club.localeCompare(b.club)).map((r,i)=>({...r,pos:i+1, qualified:i<2}));
    return {...group, standings, matches};
  });
}
function tie(a,b,stage,competitionId,idx,legs=2){
  const matches=[]; let aAgg=0,bAgg=0;
  for(let leg=1;leg<=legs;leg++){
    const home=leg===1?a:b, away=leg===1?b:a;
    const id=`${competitionId}-${stage}-${idx}-leg-${leg}-${home.id}-${away.id}`;
    const hg=goalsFor(home,away,id,true), ag=goalsFor(away,home,id,false);
    matches.push({id, competitionId, stage, home:home.id, away:away.id, homeName:home.name, awayName:away.name, homeGoals:hg, awayGoals:ag, summary:`${hg} x ${ag}`});
    if(home.id===a.id){ aAgg+=hg; bAgg+=ag; } else { bAgg+=hg; aAgg+=ag; }
  }
  let winner=aAgg>bAgg?a:b; let penalties=null;
  if(aAgg===bAgg){
    const aPen=3+(stableHash(`${competitionId}-${stage}-${idx}-${a.id}-pen`)%4);
    let bPen=3+(stableHash(`${competitionId}-${stage}-${idx}-${b.id}-pen`)%4);
    if(aPen===bPen) bPen = aPen===6 ? 5 : aPen+1;
    winner=aPen>bPen?a:b; penalties={aPen,bPen,winner:winner.id};
  }
  return {id:`${competitionId}-${stage}-${idx}`, a,b,legs:matches, aggregate:{a:aAgg,b:bAgg}, penalties, winner};
}
function knockoutRound(clubs=[], stage, competitionId, legs=2){
  const ties=[];
  for(let i=0;i<clubs.length;i+=2){ ties.push(tie(clubs[i], clubs[i+1], stage, competitionId, (i/2)+1, legs)); }
  return {stage, ties, winners:ties.map(t=>t.winner)};
}
function buildKnockoutFromGroups(groups=[], competitionId='libertadores'){
  const top = groups.flatMap(g=>g.standings.filter(r=>r.qualified).map(r=>({ id:r.id, name:r.club, country:r.country, level:r.level, reputation:r.level, logo:r.logo, source:`${g.name}-${r.pos}` })));
  const seeded = top.slice().sort((a,b)=>(b.level-a.level)||a.name.localeCompare(b.name));
  const paired=[];
  for(let i=0;i<seeded.length/2;i++) paired.push(seeded[i], seeded[seeded.length-1-i]);
  const r16 = knockoutRound(paired, 'Oitavas', competitionId, 2);
  const qf = knockoutRound(r16.winners, 'Quartas', competitionId, 2);
  const sf = knockoutRound(qf.winners, 'Semifinal', competitionId, 2);
  const final = knockoutRound(sf.winners, 'Final única', competitionId, 1);
  return {rounds:[r16,qf,sf,final], champion:final.winners[0], runnerUp: final.ties[0]?.winner?.id===final.ties[0]?.a?.id ? final.ties[0]?.b : final.ties[0]?.a};
}

export function buildConmebolCompetition(state={}, competitionId='libertadores'){
  const meta = continentalCompetitions.find(c=>c.id===competitionId) || continentalCompetitions[0];
  const clubs = continentalTeams(state, competitionId);
  const groups = simulateGroups(splitGroups(clubs, CONTINENTAL_RULES_V420[competitionId].groups), competitionId);
  const knockout = buildKnockoutFromGroups(groups, competitionId);
  return { id:competitionId, name:meta.name, meta, rules:CONTINENTAL_RULES_V420[competitionId], clubs, groups, knockout, champion:knockout.champion };
}

export function validateContinentalCalendar(libertadores, sulamericana){
  const errors=[], warnings=[];
  [libertadores, sulamericana].forEach(comp=>{
    if(!comp) errors.push('Competição continental ausente.');
    if(comp && comp.groups.length!==comp.rules.groups) errors.push(`${comp.name}: grupos esperados ${comp.rules.groups}, encontrado ${comp.groups.length}.`);
    comp?.groups?.forEach(g=>{ if(g.teams.length!==comp.rules.teamsPerGroup) errors.push(`${comp.name}: ${g.name} com ${g.teams.length} clubes.`); });
    const groupMatches = comp?.groups?.reduce((n,g)=>n+g.matches.length,0) || 0;
    if(comp && groupMatches !== comp.rules.groups * 12) errors.push(`${comp.name}: fase de grupos deveria ter ${comp.rules.groups*12} jogos, encontrou ${groupMatches}.`);
    const koTeams = comp?.knockout?.rounds?.[0]?.ties?.length*2 || 0;
    if(comp && koTeams!==16) errors.push(`${comp.name}: mata-mata deveria iniciar com 16 clubes, encontrou ${koTeams}.`);
  });
  const libChampion = libertadores?.champion?.name || 'pendente';
  warnings.push(`Campeão da Libertadores classificado para rota mundial: ${libChampion}.`);
  return {version:CONMEBOL_ENGINE_VERSION, status:errors.length?'error':'ok', errors, warnings, calendars:['Março-Junho grupos','Julho-Novembro mata-mata'], totalGroupMatches:(libertadores?.groups||[]).reduce((n,g)=>n+g.matches.length,0)+(sulamericana?.groups||[]).reduce((n,g)=>n+g.matches.length,0)};
}

export function conmebolSeasonSnapshot(state={}){
  const libertadores = buildConmebolCompetition(state, 'libertadores');
  const sulamericana = buildConmebolCompetition(state, 'sulamericana');
  const validation = validateContinentalCalendar(libertadores, sulamericana);
  const clubId = state.clubId || state.ui?.selectedClub || 'santos';
  const userCompetition = [libertadores, sulamericana].find(c=>c.clubs.some(t=>t.id===clubId));
  const userGroup = userCompetition?.groups.find(g=>g.teams.some(t=>t.id===clubId));
  const userRow = userGroup?.standings.find(r=>r.id===clubId) || null;
  const bridge = { libertadoresChampion:libertadores.champion, sulamericanaChampion:sulamericana.champion, intercontinentalQualified:libertadores.champion, uefaReference: placeholder(UEFA_ELITE[0], 'uefa-reference') };
  return { version:CONMEBOL_ENGINE_VERSION, rules:CONTINENTAL_RULES_V420, qualifiers:brazilContinentalQualifiers(state), libertadores, sulamericana, validation, user:{competition:userCompetition, group:userGroup, row:userRow}, bridge };
}


function globalTeam([id,name,country,level], source='global-elite'){
  return { id, name, country, level, reputation:level, logo:clubLogo(id), source };
}

export function buildIntercontinentalSnapshot(state={}){
  const conmebol = conmebolSeasonSnapshot(state);
  const libertadoresChampion = conmebol.libertadores?.champion || placeholder(['libertadores-campeao','Campeão Libertadores','br',84], 'safe-libertadores-champion');
  const uefaChampion = globalTeam(UEFA_ELITE[stableHash(`${libertadoresChampion.id}-uefa`) % UEFA_ELITE.length], 'uefa-elite-reference');
  const globalSemifinalOpponent = globalTeam(GLOBAL_ELITE_POOL[stableHash(`${libertadoresChampion.id}-global`) % GLOBAL_ELITE_POOL.length], 'global-elite-reference');
  const semifinal = tie(libertadoresChampion, globalSemifinalOpponent, 'Semifinal mundial', 'intercontinental', 1, 1);
  const final = tie(semifinal.winner, uefaChampion, 'Final intercontinental', 'intercontinental', 1, 1);
  const champion = final.winner;
  const runnerUp = final.winner.id === final.a.id ? final.b : final.a;
  const userClubId = state.clubId || state.ui?.selectedClub || 'santos';
  const userQualified = [libertadoresChampion.id, semifinal.winner.id, champion.id, runnerUp.id].includes(userClubId);
  const financialImpact = {
    championPrize: INTERCONTINENTAL_RULES_V430.prizeChampion,
    runnerUpPrize: INTERCONTINENTAL_RULES_V430.prizeRunnerUp,
    sponsorLiftPercent: champion.id===userClubId ? 18 : userQualified ? 9 : 3,
    globalBroadcastBonus: champion.id===userClubId ? 12000000 : userQualified ? 6000000 : 1500000
  };
  const reputationImpact = {
    championBonus: INTERCONTINENTAL_RULES_V430.reputationChampionBonus,
    runnerUpBonus: INTERCONTINENTAL_RULES_V430.reputationRunnerUpBonus,
    userProjectedChange: champion.id===userClubId ? 12 : runnerUp.id===userClubId ? 5 : userQualified ? 3 : 0,
    globalHeadline: champion.id===libertadoresChampion.id ? 'Campeão sul-americano conquista o mundo' : 'Europa confirma favoritismo global'
  };
  const press = [
    `${libertadoresChampion.name} entra como representante da Libertadores.`,
    `${uefaChampion.name} é a referência europeia do ciclo.`,
    `${champion.name} termina a rota mundial como campeão.`
  ];
  return { version:INTERCONTINENTAL_ENGINE_VERSION, rules:INTERCONTINENTAL_RULES_V430, conmebolBridge:conmebol.bridge, participants:{libertadoresChampion, globalSemifinalOpponent, uefaChampion}, rounds:[{stage:'Semifinal mundial', ties:[semifinal]}, {stage:'Final intercontinental', ties:[final]}], champion, runnerUp, financialImpact, reputationImpact, press, user:{qualified:userQualified, clubId:userClubId} };
}

export function validateIntercontinentalIntegrity(snapshot=buildIntercontinentalSnapshot()){
  const errors=[], warnings=[];
  if(!snapshot?.participants?.libertadoresChampion?.id) errors.push('Campeão da Libertadores ausente na rota mundial.');
  if(!snapshot?.participants?.uefaChampion?.id) errors.push('Referência UEFA ausente na final global.');
  const ids = Object.values(snapshot?.participants || {}).map(t=>t?.id).filter(Boolean);
  if(new Set(ids).size !== ids.length) errors.push('Participante duplicado no Mundial/Intercontinental.');
  if((snapshot?.rounds || []).length !== 2) errors.push('Rota mundial deveria conter semifinal e final.');
  if(!snapshot?.champion?.id) errors.push('Campeão mundial/intercontinental não registrado.');
  if(Number(snapshot?.financialImpact?.championPrize || 0) <= 0) errors.push('Premiação global inválida.');
  if(Number(snapshot?.reputationImpact?.championBonus || 0) <= 0) errors.push('Bônus de reputação global inválido.');
  if(!errors.length){
    warnings.push(`Rota mundial validada: ${snapshot.participants.libertadoresChampion.name} x elite global/UEFA.`);
    warnings.push(`Campeão registrado: ${snapshot.champion.name}.`);
  }
  return { version:INTERCONTINENTAL_ENGINE_VERSION, status:errors.length?'error':'ok', errors, warnings, checks:{participants:ids.length, rounds:(snapshot?.rounds||[]).length, champion:Boolean(snapshot?.champion?.id), prize:Boolean(snapshot?.financialImpact?.championPrize)} };
}

export function buildWorldCalendar(state={}){
  const season = Number(state.season || 2026);
  const activeNationalTeam = state.career?.nationalTeamJob?.name || state.career?.dualCareer?.nationalTeam || null;
  return globalCalendarTemplates.map((m,idx)=>({
    id:`world-${season}-${idx+1}`,
    season,
    month:m.month,
    type:m.type,
    title:m.title,
    competitions:m.competitions,
    activeForClub:true,
    activeForNationalTeam:Boolean(activeNationalTeam) && ['international','mixed','world'].includes(m.type),
    pressure: ['finals','pressure','world'].includes(m.type) ? 'Alta' : ['mixed','international'].includes(m.type) ? 'Média' : 'Controlada'
  }));
}

export function nextGlobalCycle(state={}){
  const season = Number(state.season || 2026);
  return { worldCup: nextCycleYear(season, 2026, 4), clubWorldCup: nextCycleYear(season, 2029, 4), copaContinental: nextCycleYear(season, 2028, 4), intercontinental: season, qualifiersActive: true };
}
function nextCycleYear(season, base, step){ let year = base; while(year < season) year += step; return year; }

export function continentalStatusForClub(state={}){
  const pos = currentLeaguePosition(state);
  const q = qualificationForPosition(pos.leagueId, pos.pos);
  const active = [];
  if(q.destination==='libertadores') active.push(continentalCompetitions.find(c=>c.id==='libertadores'));
  if(q.destination==='sulamericana') active.push(continentalCompetitions.find(c=>c.id==='sulamericana'));
  return {position:pos, qualification:q, active:active.filter(Boolean)};
}

export function worldCompetitionSummary(state={}){
  const status = continentalStatusForClub(state);
  const cycle = nextGlobalCycle(state);
  const conmebol = conmebolSeasonSnapshot(state);
  const intercontinental = buildIntercontinentalSnapshot(state);
  const intercontinentalValidation = validateIntercontinentalIntegrity(intercontinental);
  return { version:WORLD_COMPETITION_ENGINE_VERSION, activeClubDestination: status.qualification.label, currentPosition: status.position.pos, currentLeague: status.position.leagueId, nextWorldCup: cycle.worldCup, nextClubWorldCup: cycle.clubWorldCup, activeContinental: status.active.map(c=>c.name), totalCompetitions: continentalCompetitions.length + worldCompetitions.length + nationalTeamCompetitions.length, conmebolStatus:conmebol.validation.status, libertadoresChampion:conmebol.libertadores.champion?.name, sulamericanaChampion:conmebol.sulamericana.champion?.name, intercontinentalChampion:intercontinental.champion?.name, intercontinentalStatus:intercontinentalValidation.status };
}

export function renderCompetitionLogo(path, name, cls='competition-logo'){
  return safeImg(path || 'assets/placeholders/competition-generic.png', 'competition', name || 'Competição', cls);
}

export { continentalCompetitions, worldCompetitions, nationalTeamCompetitions, qualificationRules };
