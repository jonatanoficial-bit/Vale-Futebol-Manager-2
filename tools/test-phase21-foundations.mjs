import assert from 'node:assert/strict';
import { ensureRivalCareer, registerRivalPlayers, openTransferTalk, resolveTransferTalks, withdrawTransferTalk } from '../js/systems/rivalCareerV4.js';

const user={id:'user',name:'Seu Clube',rating:70,countryId:'brazil',continent:'south-america'};
const source={id:'source',name:'Clube vendedor',rating:68,countryId:'brazil',continent:'south-america'};
const catalog={clubs:[user,source]};
const career={season:2026,week:8,date:'2026-07-01T12:00:00.000Z',club:user,budget:70_000_000,messages:[]};
const player={id:'talk-star',basePlayerId:'talk-star',marketIdentity:'source:talk-star',name:'Meia negociado',pos:'MEI',overall:76,potential:83,age:24,value:12,salary:70,sourceClubId:'source',sourceClub:source.name,marketInterest:58};

ensureRivalCareer(career,catalog);registerRivalPlayers(career,catalog,[player]);
const first=openTransferTalk(career,catalog,player,{fee:5_000_000,salary:55_000,asking:12_000_000,expectedSalary:80_000,years:4,installments:3});
assert.equal(first.talk.status,'pending');assert.equal(career.transferTalks.length,1);
career.date='2026-07-05T12:00:00.000Z';resolveTransferTalks(career,catalog);
assert.equal(career.transferTalks[0].status,'countered');assert.ok(career.transferTalks[0].counter.fee>=12_000_000);

const second=openTransferTalk(career,catalog,player,{...career.transferTalks[0].counter,asking:12_000_000,expectedSalary:80_000,years:4,installments:3});
assert.equal(second.talk.status,'pending');assert.equal(second.talk.round,2);
career.date='2026-07-08T12:00:00.000Z';resolveTransferTalks(career,catalog);
assert.equal(career.transferTalks[0].status,'accepted');assert.ok(career.transferTalks[0].expiresAt);
career.date='2026-07-16T12:00:00.000Z';resolveTransferTalks(career,catalog);
assert.equal(career.transferTalks[0].status,'expired');

const other={...player,id:'talk-withdraw',basePlayerId:'talk-withdraw',marketIdentity:'source:talk-withdraw',name:'Atleta retirado'};
const third=openTransferTalk(career,catalog,other,{fee:14_000_000,salary:90_000,asking:12_000_000,expectedSalary:80_000});
assert.equal(withdrawTransferTalk(career,third.talk.id).status,'withdrawn');
assert.ok(career.messages.some(message=>message.subject.includes('Contraproposta')));
assert.ok(career.messages.some(message=>message.subject.includes('Proposta aceita')));
console.log('Fase 21 foundations: OK');
