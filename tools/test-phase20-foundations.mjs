import assert from 'node:assert/strict';
import { ensureRivalCareer, registerRivalPlayers, reconcileRivalRoster, loanTerms, recordUserLoan, completeLoanPurchase, resolveRivalLoans, rivalMarketBrief } from '../js/systems/rivalCareerV4.js';

const user={id:'user',name:'Seu Clube',rating:67,countryId:'brazil',continent:'south-america'};
const source={id:'source',name:'Clube cedente',rating:74,countryId:'brazil',continent:'south-america'};
const catalog={clubs:[user,source]};
const career={season:2026,week:9,date:'2026-07-10T12:00:00.000Z',club:user,budget:45_000_000,roster:[]};
const player={id:'loan-star',basePlayerId:'loan-star',marketIdentity:'source:loan-star',name:'Meia emprestado',pos:'MEI',overall:77,potential:82,age:24,value:14,salary:80,sourceClubId:'source',sourceClub:source.name,marketInterest:58};

registerRivalPlayers(career,catalog,[player]);
const terms=loanTerms(career,player,{durationDays:360,wageShare:90});
assert.equal(terms.durationDays,360);
assert.equal(terms.wageShare,90);
assert.ok(terms.optionFee>terms.fee);
const agreement=recordUserLoan(career,catalog,player,terms);
assert.equal(agreement.status,'active');
assert.equal(career.rivalWorld.players['source:loan-star'].ownerId,'source');
assert.equal(career.rivalWorld.players['source:loan-star'].loanClubId,'user');
assert.equal(reconcileRivalRoster(career,catalog,source,[player]).some(item=>item.id==='source:loan-star'),false,'O clube de origem não pode escalar atleta cedido.');
assert.equal(rivalMarketBrief(career).loans[0].player,'Meia emprestado');

const purchase=completeLoanPurchase(career,catalog,{...player,purchaseOption:terms.optionFee},terms.optionFee);
assert.equal(purchase.record.ownerId,'user');
assert.equal(purchase.agreement.status,'comprado');
assert.equal(reconcileRivalRoster(career,catalog,source,[player]).some(item=>item.id==='source:loan-star'),false,'A compra definitiva precisa manter o atleta fora do antigo clube.');

const returnee={...player,id:'loan-return',basePlayerId:'loan-return',marketIdentity:'source:loan-return',name:'Atleta de retorno'};
registerRivalPlayers(career,catalog,[returnee]);
const returnTerms=loanTerms(career,returnee,{durationDays:180,wageShare:70});
recordUserLoan(career,catalog,returnee,returnTerms);
career.date='2027-02-01T12:00:00.000Z';
const resolution=resolveRivalLoans(career,catalog);
assert.equal(resolution.ended.some(item=>item.player==='Atleta de retorno'),true);
assert.equal(career.rivalWorld.players['source:loan-return'].loanClubId,undefined);
assert.equal(reconcileRivalRoster(career,catalog,source,[returnee]).some(item=>item.id==='source:loan-return'),true,'O atleta precisa retornar ao clube de origem no fim do empréstimo.');
console.log('Fase 20 foundations: OK');
