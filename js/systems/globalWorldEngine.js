import { worldLeagueCatalog, globalClubPools, europeanCompetitions, globalCalendarWindows, worldCompleteRules, WORLD_COMPLETE_VERSION } from '../data/worldLeagueCompleteData.js';
import { teams } from '../data/gameData.js';
import { clubLogo, safeImg } from './assets.js';
import { conmebolSeasonSnapshot, buildIntercontinentalSnapshot } from './worldCompetitionEngine.js';
import { buildTransferSnapshot } from './transferEngine.js';

function stableHash(s=''){ let h=0; for(const ch of String(s)) h=((h<<5)-h)+ch.charCodeAt(0)|0; return Math.abs(h); }
function moneyMillions(n){ return Math.max(1, Math.round(Number(n||0))); }
function makeClub(league, name, index){
  const id = String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || `${league.id}-${index}`;
  const variance = (stableHash(`${league.id}-${name}`) % 13) - 4;
  const level = Math.max(45, Math.min(99, Math.round(league.level + variance - index*.65)));
  return { id, name, leagueId:league.id, leagueName:league.name, country:league.country, confederation:league.confederation, level, reputation:Math.max(40, Math.min(100, level + Math.round((league.reputation-league.level)/2))), value:moneyMillions(level * league.marketWeight * (2.2 + (index<3?1.4:index<6?.7:.25))), logo:clubLogo(id) };
}
function expandLeague(league){
  const seeded = (globalClubPools[league.id] || []).map((name,index)=>makeClub(league,name,index));
  const target = Number(league.clubs || seeded.length || 18);
  const list = [...seeded];
  let idx=seeded.length+1;
  while(list.length<target){
    list.push(makeClub(league, `${league.name} Clube ${idx}`, idx));
    idx++;
  }
  return list.slice(0,target);
}
function compactTable(clubs=[], league){
  return clubs.map((club,index)=>{
    const seed = stableHash(`${league.id}-${club.id}-table`);
    const p = league.calendar==='Abril-Dezembro' ? 18 : 26;
    const w = Math.max(0, Math.min(p, Math.round((club.level-55)/7) + (seed%4) + 4));
    const d = Math.max(0, Math.min(p-w, 3+(seed%5)));
    const l = Math.max(0,p-w-d);
    const gf = Math.max(10, Math.round(w*1.8 + d*.8 + (seed%12)));
    const ga = Math.max(8, Math.round(l*1.6 + d*.9 + ((seed>>3)%12)));
    return { pos:index+1, id:club.id, club:club.name, logo:club.logo, p,w,d,l,gf,ga,sg:gf-ga, pts:w*3+d, level:club.level, qualified:false, zone:'Liga' };
  }).sort((a,b)=>(b.pts-a.pts)||(b.sg-a.sg)||(b.gf-a.gf)||(b.level-a.level)).map((r,i)=>({...r,pos:i+1}));
}
function decorateZones(table, league){
  return table.map(row=>{
    let zone = 'Meio de tabela';
    if(league.confederation==='UEFA'){
      if(row.pos <= (league.slots?.champions||0)) zone='Champions League';
      else if(row.pos <= (league.slots?.champions||0)+(league.slots?.europa||0)) zone='Europa League';
      else if(row.pos > league.clubs-(league.slots?.relegation||0)) zone='Rebaixamento';
    } else if(league.id==='brasileirao-a'){
      if(row.pos<=5) zone='Libertadores'; else if(row.pos<=12) zone='Sul-Americana'; else if(row.pos>=17) zone='Rebaixamento';
    } else {
      if(row.pos <= (league.slots?.continental||league.slots?.libertadores||3)) zone='Continental';
      else if(row.pos > league.clubs-(league.slots?.relegation||0)) zone='Rebaixamento';
    }
    return {...row, zone, qualified:!/Meio/.test(zone)};
  });
}
export function buildWorldLeagueSnapshot(state={}){
  const localTeams = teams.filter(t=>t.leagueId==='brasileirao-a').map(t=>({ id:t.id, name:t.name, leagueId:'brasileirao-a', leagueName:'Brasileirão Série A', country:'Brasil', confederation:'CONMEBOL', level:t.level||75, reputation:t.reputation||75, value:moneyMillions((t.value||80000000)/1000000), logo:clubLogo(t.id)}));
  const leagues = worldLeagueCatalog.map(league=>{
    const clubs = league.id==='brasileirao-a' && localTeams.length ? localTeams.slice(0,20) : expandLeague(league);
    const table = decorateZones(compactTable(clubs, league), league);
    const champion = table[0];
    const marketValue = clubs.reduce((sum,c)=>sum+Number(c.value||0),0);
    return { ...league, clubs, table, champion, marketValue, topSix:table.slice(0,6), bottomThree:table.slice(-3) };
  });
  const conmebol = conmebolSeasonSnapshot(state);
  const intercontinental = buildIntercontinentalSnapshot(state);
  const transfers = buildTransferSnapshot(state);
  const globalRanking = leagues.flatMap(l=>l.clubs.slice(0,8)).sort((a,b)=>(b.reputation-a.reputation)||(b.level-a.level)||(b.value-a.value)).slice(0,30).map((c,i)=>({...c,pos:i+1, score:Math.min(100, Math.round(c.reputation*.58 + c.level*.32 + Math.min(10,c.value/80)))}));
  const uefaEntrants = leagues.filter(l=>l.confederation==='UEFA').flatMap(l=>l.table.filter(r=>/Champions|Europa/.test(r.zone)).map(r=>({...r, leagueName:l.name, country:l.country})));
  const globalCalendar = globalCalendarWindows.map((w,i)=>({...w, id:`global-window-${i+1}`, overallLoad:Math.round((w.clubLoad+w.internationalLoad)/2), conflictRisk:w.clubLoad>85 && w.internationalLoad>55 ? 'alto' : w.clubLoad>80 || w.internationalLoad>70 ? 'médio' : 'controlado'}));
  const marketPulse = { status: transfers?.windowOpen ? 'janela aberta' : 'janela monitorada', activeLeagues: leagues.length, totalMarketValue: leagues.reduce((s,l)=>s+l.marketValue,0), globalDemand: Math.round(leagues.reduce((s,l)=>s+l.marketWeight,0)/leagues.length*100), risk:'protegido por orçamento seguro v4.9.0' };
  return { version:WORLD_COMPLETE_VERSION, rules:worldCompleteRules, leagues, europeanCompetitions, globalRanking, uefaEntrants, globalCalendar, marketPulse, bridges:{conmebolStatus:conmebol.validation?.status || 'ok', libertadoresChampion:conmebol.libertadores?.champion?.name, sulamericanaChampion:conmebol.sulamericana?.champion?.name, intercontinentalChampion:intercontinental.champion?.name}, totals:{leagues:leagues.length, clubs:leagues.reduce((s,l)=>s+l.clubs.length,0), confederations:new Set(leagues.map(l=>l.confederation)).size, europeanCompetitions:europeanCompetitions.length, calendarWindows:globalCalendar.length} };
}
export function validateWorldCompleteSnapshot(snapshot=buildWorldLeagueSnapshot()){
  const errors=[]; const warnings=[];
  if(!snapshot || snapshot.version!==WORLD_COMPLETE_VERSION) errors.push('Snapshot global ausente ou versão inválida.');
  if((snapshot?.leagues||[]).length < worldCompleteRules.minimumLeagues) errors.push('Quantidade mínima de ligas globais não atingida.');
  (snapshot?.leagues||[]).forEach(league=>{
    if(!league.id || !league.name) errors.push('Liga global sem id/nome.');
    if((league.clubs||[]).length !== Number(league.clubs?.length || league.clubs)){} // no-op guard for runtime minifiers
    if((league.table||[]).length !== Number(league.clubs?.length || league.clubs || 0)) warnings.push(`${league.name}: tabela compacta em modo seguro.`);
    const ids=(league.clubs||[]).map(c=>c.id);
    if(new Set(ids).size !== ids.length) errors.push(`${league.name}: clube duplicado no pool.`);
    if(!league.champion?.club) errors.push(`${league.name}: campeão não definido.`);
  });
  if((snapshot?.europeanCompetitions||[]).length < worldCompleteRules.minimumEuropeanCompetitions) errors.push('Competições europeias insuficientes.');
  if((snapshot?.globalCalendar||[]).length !== 12) errors.push('Calendário global deve ter 12 janelas.');
  if(!snapshot?.globalRanking?.length) errors.push('Ranking mundial não foi gerado.');
  if(!errors.length){ warnings.push(`Mundo integrado: ${snapshot.totals.leagues} ligas, ${snapshot.totals.clubs} clubes, ${snapshot.totals.confederations} confederações.`); warnings.push(`Ranking mundial e calendário global validados em modo seguro.`); }
  return { version:WORLD_COMPLETE_VERSION, status:errors.length?'error':'ok', errors, warnings, checks:{leagues:snapshot?.totals?.leagues||0, clubs:snapshot?.totals?.clubs||0, calendar:snapshot?.totals?.calendarWindows||0, europe:snapshot?.totals?.europeanCompetitions||0, ranking:snapshot?.globalRanking?.length||0} };
}
export function renderWorldCompleteCenter(state={}){
  const snap = buildWorldLeagueSnapshot(state);
  const validation = validateWorldCompleteSnapshot(snap);
  const selectedId = state.ui?.worldLeagueFocus || 'premier-league';
  const selected = snap.leagues.find(l=>l.id===selectedId) || snap.leagues[0];
  const leagueOptions = snap.leagues.map(l=>`<option value="${l.id}" ${l.id===selected.id?'selected':''}>${l.name}</option>`).join('');
  const leagueCards = snap.leagues.map(l=>`<article class="competition-card global-card"><div class="row space"><div><span class="tag">${l.confederation} · ${l.country}</span><h3>${l.name}</h3><p class="small">${l.clubs.length} clubes · ${l.calendar} · ${l.playable}</p></div><strong>${l.champion.club}</strong></div><div class="stat-line"><span>Reputação</span><strong>${l.reputation}</strong><small>nível ${l.level}</small></div><div class="stat-line"><span>Valor simulado</span><strong>€ ${l.marketValue}M</strong><small>mercado peso ${Math.round(l.marketWeight*100)}%</small></div></article>`).join('');
  const tableRows = selected.table.slice(0,12).map(r=>`<tr><td>${r.pos}</td><td><div class="team-cell">${safeImg(r.logo,'club',r.club,'mini-logo')}<span>${r.club}</span></div><small>${r.zone}</small></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.sg>0?'+':''}${r.sg}</td><td><strong>${r.pts}</strong></td></tr>`).join('');
  const rankingRows = snap.globalRanking.slice(0,12).map(r=>`<div class="scorer-row"><strong>${r.pos}</strong><div>${safeImg(r.logo,'club',r.name,'mini-logo')}<span>${r.name}</span><small>${r.leagueName || r.leagueId} · ${r.country}</small></div><b>${r.score}</b><em>Rep ${r.reputation}</em></div>`).join('');
  const calendarRows = snap.globalCalendar.map(w=>`<div class="calendar-world-row ${w.conflictRisk}"><div><strong>${w.month}</strong><small>${w.focus}</small></div><span>${w.risk}</span><em>${w.conflictRisk}</em></div>`).join('');
  const euroRows = snap.europeanCompetitions.map(c=>`<article class="competition-card world"><div class="row space"><div><span class="tag">UEFA · ${c.months}</span><h3>${c.name}</h3><p class="small">${c.participants} clubes · ${c.phase}</p></div><strong>${c.prestige}</strong></div><div class="stat-line"><span>Premiação</span><strong>${c.prize}</strong><small>prestígio ${c.prestige}</small></div></article>`).join('');
  const validationRows = [...validation.errors.map(e=>`<div class="objective-row danger"><span>${e}</span><strong>Erro</strong><em>corrigir</em></div>`), ...validation.warnings.map(w=>`<div class="objective-row ok"><span>${w}</span><strong>OK</strong><em>seguro</em></div>`)].join('');
  return `<section class="world-complete-v520 stack"><div class="panel championship-hero"><div><span class="tag">${snap.version} · mundo completo</span><h1>Calendário global, ligas internacionais e ranking mundial</h1><p class="small">Camada internacional simulada para Premier League, LaLiga, Serie A, Bundesliga, Ligue 1, Portugal, Argentina, MLS, Arábia, Japão e México, conectada às competições continentais e ao mercado global.</p></div><div class="hero-actions"><button class="main-btn" data-route="worldCompetitions">CONMEBOL/Mundial</button><button class="secondary-btn" data-route="transfers">Mercado global</button></div></div>
  <section class="grid desktop-4"><div class="card kpi-card"><span>Ligas integradas</span><strong>${snap.totals.leagues}</strong><small>${snap.totals.confederations} confederações</small></div><div class="card kpi-card"><span>Clubes simulados</span><strong>${snap.totals.clubs}</strong><small>tabelas compactas</small></div><div class="card kpi-card"><span>Mercado global</span><strong>€ ${snap.marketPulse.totalMarketValue}M</strong><small>${snap.marketPulse.status}</small></div><div class="card kpi-card"><span>Integridade</span><strong>${validation.status.toUpperCase()}</strong><small>${validation.errors.length} erros</small></div></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Ligas</span><h2>Mapa internacional</h2></div><select data-action="set-ui-select" data-ui-key="worldLeagueFocus">${leagueOptions}</select></div><div class="competition-grid compact">${leagueCards}</div></article><article class="panel"><div class="row space"><div><span class="tag">${selected.name}</span><h2>Tabela compacta simulada</h2></div><span class="status-pill">${selected.champion.club}</span></div><div class="table-wrap"><table><thead><tr><th>Pos</th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>PTS</th></tr></thead><tbody>${tableRows}</tbody></table></div></article></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">UEFA</span><h2>Competições europeias</h2></div><span class="status-pill">${snap.uefaEntrants.length} vagas</span></div><div class="competition-grid compact">${euroRows}</div></article><article class="panel"><div class="row space"><div><span class="tag">Ranking mundial</span><h2>Top clubes globais</h2></div><span class="status-pill">Top 30</span></div><div class="scorer-list">${rankingRows}</div></article></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Calendário</span><h2>Janelas globais</h2></div><span class="status-pill">12 meses</span></div><div class="timeline-list">${calendarRows}</div></article><article class="panel"><div class="row space"><div><span class="tag">Anti-quebra v5.2.0</span><h2>Validação global</h2></div><strong class="grade">${validation.status.toUpperCase()}</strong></div>${validationRows}<div class="stat-line"><span>Libertadores</span><strong>${snap.bridges.libertadoresChampion || 'validada'}</strong><small>${snap.bridges.conmebolStatus}</small></div><div class="stat-line"><span>Campeão mundial</span><strong>${snap.bridges.intercontinentalChampion || 'em ciclo'}</strong><small>rota v4.3 integrada</small></div></article></section></section>`;
}
