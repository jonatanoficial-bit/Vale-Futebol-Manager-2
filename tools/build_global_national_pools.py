#!/usr/bin/env python3
"""Cria selecoes comandaveis usando jogadores profissionais atuais da base CC0."""

from __future__ import annotations
import argparse,csv,gzip,json,re,unicodedata
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

from import_cc0_world_data import age_on_2026_08_04, overall, position

ALIASES={
 "united states":"usa","united states of america":"usa","korea south":"korea republic","south korea":"korea republic",
 "turkiye":"turkey","czech republic":"czechia","bosnia herzegovina":"bosnia and herzegovina","cote d ivoire":"ivory coast",
 "cape verde":"cabo verde","dr congo":"congo dr","democratic republic of the congo":"congo dr","taiwan":"chinese taipei",
 "china":"china pr","iran":"ir iran","curacao":"curaçao","russia":"russia","england":"england",
}

def norm(value):
 value=unicodedata.normalize('NFKD',value or '').encode('ascii','ignore').decode().lower()
 value=re.sub(r'[^a-z0-9]+',' ',value).strip()
 return ALIASES.get(value,value)

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1]);ap.add_argument('--players',type=Path,required=True);args=ap.parse_args()
 root=args.root.resolve();catalog_path=root/'data/world-catalog-2026.json';data=json.loads(catalog_path.read_text(encoding='utf-8'))
 pools=defaultdict(list)
 with gzip.open(args.players,'rt',encoding='utf-8-sig',newline='') as handle:
  for row in csv.DictReader(handle):
   if row.get('last_season')=='2025' and row.get('country_of_citizenship'):
    pools[norm(row['country_of_citizenship'])].append(row)
 pool_names=list(pools);built=0
 for team in data['nationalTeams']:
  if team.get('rosterPath'):continue
  target=norm(team['name']);best=max(pool_names,key=lambda name:SequenceMatcher(None,target,name).ratio(),default='')
  score=SequenceMatcher(None,target,best).ratio() if best else 0
  if score<.84 or len(pools[best])<16:continue
  selected=sorted(pools[best],key=lambda r:int(r.get('market_value_in_eur') or 0),reverse=True)[:30]
  roster=[]
  for row in selected:
   age=age_on_2026_08_04(row.get('date_of_birth',''));pos,role=position(row);value=int(row.get('market_value_in_eur') or 0);ger=overall(value,age,pos)
   roster.append({'id':'tm-'+row['player_id'],'name':row.get('name') or 'Jogador','pos':pos,'role':role,'overall':ger,'potential':max(ger,min(94,ger+max(0,24-age)//2)),'age':age,'fitness':90,'morale':76,'salary':max(25,round(value/1_000_000*18)),'value':round(value/1_000_000,3),'nationality':row.get('country_of_citizenship') or '', 'foot':row.get('foot') or '', 'height':int(row.get('height_in_cm') or 0),'clubName':row.get('current_club_name') or '', 'contractUntil':(row.get('contract_expiration_date') or '2027-06-30')[:10], 'internationalCaps':int(row.get('international_caps') or 0),'internationalGoals':int(row.get('international_goals') or 0),'dataSource':'transfermarkt-datasets-CC0-snapshot-2026-08-04'})
  if len(roster)<16:continue
  rel=f"data/national-rosters/cc0-2026/{team['id']}.json";out=root/rel;out.parent.mkdir(parents=True,exist_ok=True)
  out.write_text(json.dumps({'meta':{'teamId':team['id'],'teamName':team['name'],'season':2026,'updatedAt':'2026-08-04','status':'current-professional-player-pool','officialTournamentSquad':False,'ratingMethod':'VFM estimate; not official FIFA/EA'},'players':roster},ensure_ascii=False,indent=2),encoding='utf-8')
  team.update({'rosterPath':rel,'players':len(roster),'commandable':True,'dataStatus':'current-professional-player-pool','rating':round(sum(p['overall'] for p in roster[:18])/min(18,len(roster)))})
  built+=1
 data['stats']['commandableNationalTeams']=sum(bool(t.get('rosterPath')) for t in data['nationalTeams']);data['stats']['nationalPlayers']=sum(int(t.get('players') or 0) for t in data['nationalTeams']);data['stats']['managerAvatars']=16;catalog_path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
 report={'generatedPools':sum(t.get('dataStatus')=='current-professional-player-pool' for t in data['nationalTeams']),'generatedThisRun':built,'commandableNationalTeams':data['stats']['commandableNationalTeams'],'fifaAssociations':len(data['nationalTeams']),'nationalRosterPlayers':data['stats']['nationalPlayers']};(root/'NATIONAL-POOLS-REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report))

if __name__=='__main__':main()
