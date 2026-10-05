export const COMPETITION_FORMATS_VERSION = '3.0.0';

const DAY = 86400000;
const hash = (value='') => {
  let number = 2166136261;
  for (const char of String(value)) { number ^= char.charCodeAt(0); number = Math.imul(number, 16777619); }
  return number >>> 0;
};
const addDays = (date, days) => new Date(new Date(date).getTime() + days * DAY).toISOString();
const pendingOpponent = (badge='assets/placeholders/club-generic.png') => ({ id:'draw-pending', name:'Adversário definido por sorteio', badge, rating:68 });

export function domesticCupFormat(countryId='') {
  const key = String(countryId).toLowerCase();
  if (key === 'brazil') return { id:'brazil-cup', label:'Regulamento nacional · ida e volta a partir das oitavas', stages:[['Oitavas de final',2],['Quartas de final',2],['Semifinal',2],['Final',2]] };
  if (['england','argentina','chile','uruguay','colombia','ecuador'].includes(key)) return { id:'single-leg-cup', label:'Regulamento nacional · eliminatória em jogo único', stages:[['Oitavas de final',1],['Quartas de final',1],['Semifinal',1],['Final',1]] };
  if (key === 'italy') return { id:'italy-cup', label:'Regulamento nacional · semifinal em ida e volta', stages:[['Oitavas de final',1],['Quartas de final',1],['Semifinal',2],['Final',1]] };
  return { id:'standard-cup', label:'Regulamento nacional · mata-mata com ida e volta', stages:[['Oitavas de final',2],['Quartas de final',2],['Semifinal',2],['Final',1]] };
}

export function buildDomesticCupPath({ club, participants=[], startDate, competitionId='domestic-cup', competitionName }) {
  const format = domesticCupFormat(club?.countryId);
  const pool = participants.filter(team => team?.id && team.id !== club?.id).sort((a,b) => hash(`${club?.id}:${a.id}`) - hash(`${club?.id}:${b.id}`));
  const firstOpponent = pool[0] || pendingOpponent();
  let dayOffset = 18;
  const fixtures = [];
  format.stages.forEach(([stage, legs], stageIndex) => {
    const tieId = `${competitionId}-tie-${stageIndex + 1}`;
    for (let leg=1; leg<=legs; leg++) {
      const isFirst = stageIndex === 0;
      fixtures.push({
        id:`${competitionId}-${stageIndex + 1}-${leg}`, competitionId, competitionName, type:'cup', phase:'knockout', stage,
        round:stageIndex + 1, tieId, leg, legs, twoLegged:legs===2, date:addDays(startDate,dayOffset),
        opponent:isFirst ? firstOpponent : pendingOpponent(), drawPool:pool.map(team=>team.id), drawStatus:isFirst?'confirmed':'provisional',
        home:leg===1 ? stageIndex % 2 === 0 : stageIndex % 2 !== 0, played:false, locked:!isFirst, score:null, formatRule:format.label
      });
      dayOffset += legs === 2 && leg === 1 ? 8 : 34;
    }
  });
  return { format, fixtures };
}

export function continentalFormat(confederation='') {
  const conf = String(confederation).toUpperCase();
  const name = conf === 'UEFA' ? 'Fase de grupos em ida e volta; mata-mata em ida e volta até a final.' : 'Fase de grupos em ida e volta; mata-mata em ida e volta até a final.';
  return { id:`${conf.toLowerCase() || 'world'}-continental-v3`, label:name, groups:4, teamsPerGroup:4, groupLegs:2, knockoutLegs:2, finalLegs:1 };
}

export function buildContinentalPath({ club, startDate, candidates=[], competitionId, competitionName }) {
  const format = continentalFormat(club?.confederation);
  const ordered = candidates.filter(team=>team?.id && team.id!==club?.id).sort((a,b)=>hash(`${competitionId}:${a.id}`)-hash(`${competitionId}:${b.id}`));
  const opponents = ordered.slice(0,3);
  const group = String.fromCharCode(65 + (hash(club?.id || competitionId) % format.groups));
  let offset=10;
  const fixtures=[];
  opponents.forEach((opponent, opponentIndex)=>{
    for(let leg=1;leg<=format.groupLegs;leg++){
      fixtures.push({
        id:`${competitionId}-group-${opponentIndex + 1}-${leg}`, competitionId, competitionName, type:'continental', phase:'group', stage:`Grupo ${group}`,
        group, round:fixtures.length + 1, date:addDays(startDate,offset), opponent, home:leg===1, played:false, score:null,
        formatRule:format.label, groupLeg:leg, groupLegs:format.groupLegs
      });
      offset += 14;
    }
  });
  [['Oitavas de final',2],['Quartas de final',2],['Semifinal',2],['Final',1]].forEach(([stage,legs],index)=>{
    const tieId=`${competitionId}-ko-${index + 1}`;
    for(let leg=1;leg<=legs;leg++){
      fixtures.push({
        id:`${competitionId}-ko-${index + 1}-${leg}`, competitionId, competitionName, type:'continental', phase:'knockout', stage,
        group, round:fixtures.length+1, tieId, leg, legs, twoLegged:legs===2, date:addDays(startDate,offset), opponent:pendingOpponent(),
        drawPool:ordered.slice(0,24).map(team=>team.id), drawStatus:'provisional', home:leg===1, played:false, locked:true, score:null,
        formatRule:format.label
      });
      offset += legs===2 && leg===1?8:28;
    }
  });
  return { format, fixtures };
}

export function tieFixtures(fixtures=[], fixture={}) {
  return fixtures.filter(item => item.tieId && item.tieId === fixture.tieId).sort((a,b)=>Number(a.leg||1)-Number(b.leg||1));
}

export function tieOutcome(fixtures=[], fixture={}, ownTeamId='', seed='') {
  const matches=tieFixtures(fixtures,fixture);
  if (!matches.length || !matches.every(item=>item.played && item.score)) return { resolved:false, advanced:false, ownGoals:0, opponentGoals:0 };
  let ownGoals=0,opponentGoals=0;
  matches.forEach(item=>{
    ownGoals += item.home ? Number(item.score.home||0) : Number(item.score.away||0);
    opponentGoals += item.home ? Number(item.score.away||0) : Number(item.score.home||0);
  });
  let penalties=null;
  if(ownGoals===opponentGoals){
    const ownPens=4 + (hash(`${seed}:${ownTeamId}:${fixture.tieId}:own`) % 3);
    const opponentPens=3 + (hash(`${seed}:${fixture.opponent?.id}:${fixture.tieId}:opp`) % 3);
    penalties={own:ownPens, opponent:opponentPens === ownPens ? Math.max(2,opponentPens-1) : opponentPens};
  }
  return { resolved:true, advanced:penalties ? penalties.own>penalties.opponent : ownGoals>opponentGoals, ownGoals, opponentGoals, penalties };
}

export function groupProgress(fixtures=[], minPoints=7) {
  const played=fixtures.filter(item=>item.phase==='group' || item.phase==='league');
  const complete=played.length>0 && played.every(item=>item.played);
  const points=played.reduce((total,item)=>{
    if(!item.played||!item.score)return total;
    const own=item.home?Number(item.score.home):Number(item.score.away),away=item.home?Number(item.score.away):Number(item.score.home);
    return total+(own>away?3:own===away?1:0);
  },0);
  return { complete, points, qualified:complete && points>=Math.min(minPoints, Math.ceil(played.length*1.15)) };
}

export function describeFixtureFormat(fixture={}) {
  if(fixture.phase==='group'||fixture.phase==='league')return `Grupo ${fixture.group||''} · ${fixture.groupLeg||1}/${fixture.groupLegs||2} · ida e volta`;
  if(fixture.twoLegged)return `${fixture.stage} · jogo ${fixture.leg||1}/${fixture.legs||2} · placar agregado`;
  return `${fixture.stage||'Mata-mata'} · jogo único`;
}
