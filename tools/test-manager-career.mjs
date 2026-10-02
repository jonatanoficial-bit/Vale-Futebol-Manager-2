import assert from 'node:assert/strict';
import { ensureManagerCareer, careerSecurity, reviewManagerMatch, createClubJobOffers, createNationalJobOffers, careerOfferDue, closeCareerOfferCycle, recordClubAppointment } from '../js/systems/managerCareer.js';

function career(overrides={}) {
  return {
    createdAt:'2026-04-01T12:00:00.000Z',date:'2026-04-12T12:00:00.000Z',season:2026,week:8,board:72,budget:50000000,
    manager:{name:'Teste',reputation:70},club:{id:'vale',name:'Vale FC',rating:70,badge:'vale.png',leagueName:'Liga'},
    stats:{played:8,wins:4,draws:2,losses:2},...overrides
  };
}

{
  const c=career();
  const state=ensureManagerCareer(c);
  assert.equal(state.status,'employed');
  assert.equal(state.clubId,'vale');
  assert.equal(state.history[0].type,'appointed');
  assert.equal(careerSecurity(9).id,'critical');
  assert.equal(careerSecurity(67).id,'stable');
}

{
  const c=career({board:60});
  const review=reviewManagerMatch(c,{result:'win',goalDiff:2,opponentRating:78,competitionType:'league'});
  assert.equal(review.delta,5);
  assert.equal(c.board,65);
  assert.equal(review.dismissed,false);
}

{
  const c=career({board:30});
  const review=reviewManagerMatch(c,{result:'loss',goalDiff:-1,opponentRating:70,competitionType:'league'});
  assert.equal(c.board,27);
  assert.equal(review.warning,'pressure');
}

{
  const c=career({board:9,stats:{played:10,wins:1,draws:1,losses:8}});
  const review=reviewManagerMatch(c,{result:'loss',goalDiff:-3,opponentRating:64,competitionType:'cup',knockedOut:true});
  assert.equal(review.dismissed,true);
  assert.equal(c.managerCareer.status,'unemployed');
  assert.equal(c.managerCareer.previousClub.name,'Vale FC');
}

{
  const c=career();
  const clubs=[
    {id:'vale',name:'Vale FC',rating:70,rosterPath:'vale.json'},
    {id:'a',name:'Clube A',rating:72,leagueName:'Liga A',rosterPath:'a.json'},
    {id:'b',name:'Clube B',rating:67,leagueName:'Liga B',rosterPath:'b.json'},
    {id:'elite',name:'Elite',rating:92,leagueName:'Liga Elite',rosterPath:'elite.json'}
  ];
  const offers=createClubJobOffers(c,clubs,3);
  assert.ok(offers.length>=2);
  assert.ok(offers.every(item=>item.id!=='vale'&&item.id!=='elite'));
  assert.ok(offers.every(item=>item.careerOffer.salary>0&&item.careerOffer.years>=2));
  assert.equal(careerOfferDue(c),true);
  closeCareerOfferCycle(c,6);
  assert.equal(careerOfferDue(c),false);
  recordClubAppointment(c,offers[0]);
  assert.equal(c.managerCareer.clubId,offers[0].id);
  assert.equal(c.managerCareer.status,'employed');
}

{
  const c=career();
  const teams=[
    {id:'br',name:'Brasil',rating:88,reputationRequired:82,rosterPath:'br.json'},
    {id:'uy',name:'Uruguai',rating:81,reputationRequired:68,rosterPath:'uy.json'},
    {id:'pe',name:'Peru',rating:74,reputationRequired:62,rosterPath:'pe.json'}
  ];
  const offers=createNationalJobOffers(c,teams,3);
  assert.deepEqual(new Set(offers),new Set(['uy','pe']));
}

console.log('manager career: all tests passed');
