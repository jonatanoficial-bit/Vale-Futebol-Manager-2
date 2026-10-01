import assert from 'node:assert/strict';
import {ensureEconomy,processEconomy,financeForecast,startConstruction,facilityQuote,validateDeal,marketValue,createSaleOffer,acceptSale,payroll} from '../js/systems/clubEconomy.js';
const make=()=>ensureEconomy({date:'2026-01-15T12:00:00Z',budget:50000000,club:{rating:72},facilities:{stadium:2,medical:2,training:2,youth:2,scouting:2,commercial:2},staff:{assistant:65},roster:Array.from({length:22},(_,i)=>({id:String(i),name:'Atleta '+i,pos:i<3?'GOL':'MC',salary:35,value:2,age:24,overall:70,potential:78,form:70,contractUntil:'2028-12-31'})),lineupIds:Array.from({length:11},(_,i)=>String(i)),transferPolicy:{wageBudget:2000000,maxSquad:35},transferObligations:[]});
const c=make(),initial=c.budget,f=financeForecast(c);c.date='2026-04-15T12:00:00Z';processEconomy(c);
assert.equal(c.economy.history.length,3);assert.equal(c.budget,initial+f.monthlyNet*3);
const balance=c.budget,ledger=c.ledger.length;processEconomy(c);assert.equal(c.budget,balance);assert.equal(c.ledger.length,ledger);
const fresh=make(),q=facilityQuote(fresh,'training'),build=startConstruction(fresh,'training');assert.ok(build.project);assert.equal(fresh.facilities.training,2);assert.equal(fresh.budget,50000000-q.cost);assert.ok(startConstruction(fresh,'training').error);
fresh.date=build.project.finishAt;processEconomy(fresh);assert.equal(fresh.facilities.training,3);assert.equal(fresh.construction.length,0);assert.equal(fresh.messages.length,1);processEconomy(fresh);assert.equal(fresh.messages.length,1);
const target={id:'new',salary:30};assert.equal(validateDeal(c,target,{fee:100000,salary:30000}),null);
for(const bad of [{fee:-1,salary:30000},{fee:NaN,salary:30000},{fee:1,salary:Infinity},{fee:1,salary:30000,signing:-100},{fee:1,salary:30000,installments:0},{fee:1,salary:30000,years:50},{fee:1,salary:3000000}])assert.ok(validateDeal(c,target,bad));
assert.ok(validateDeal(c,c.roster[0],{fee:1,salary:30000}));
const s=make(),p=s.roster[3],offer=createSaleOffer(s,p,'Clube rival').offer;assert.equal(createSaleOffer(s,p,'Outro').offer.id,offer.id);const wages=payroll(s);assert.ok(acceptSale(s,offer.id).offer);assert.equal(s.roster.length,21);assert.equal(s.budget,50000000+offer.fee);assert.equal(payroll(s),wages-35000);assert.ok(acceptSale(s,offer.id).error);
const expired=make(),o=createSaleOffer(expired,expired.roster[3],'Rival').offer;expired.date='2026-02-20T12:00:00Z';assert.ok(acceptSale(expired,o.id).error);
assert.ok(marketValue({...p,age:20},c.date)>marketValue({...p,age:35},c.date));
const installments=make();installments.transferObligations=[{remainingBalance:300000,remainingInstallments:3,installmentAmount:100000,nextDue:'2026-02-15T12:00:00Z'}];assert.equal(financeForecast(installments).installments,200000);
// Save/reload must retain the accounting cursor and construction deadlines.
const reload=JSON.parse(JSON.stringify(fresh));processEconomy(reload);assert.equal(reload.budget,fresh.budget);assert.deepEqual(reload.facilities,fresh.facilities);
console.log(JSON.stringify({status:'ok',checks:['monthly charges','idempotency','forecast','construction cost and delay','duplicate projects','completion once','invalid financial inputs','wage limit','duplicate signing','sale and payroll','expired offers','valuation','installments forecast','save/reload']}));
