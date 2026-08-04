#!/usr/bin/env python3
"""Aplica regras 2026 com fonte e nivel de fidelidade ao catalogo mundial."""

from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "world-catalog-2026.json"

CBF_A = "https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/REC_Brasileiro_SA_rie_A_2026_v15_12_2025_final_02692c1077.pdf"
CBF_B = "https://www.cbf.com.br/futebol-brasileiro/noticias/undefined/sao-paulo-x-ceara/cbf-divulga-documentos-tecnicos-do-brasileirao-da-serie-b-de-2026"
UEFA = "https://www.uefa.com/news-media/news/02a4-2060ea59fbc5-4be94b1fbe5a-1000--access-list-track-which-sides-will-play-in-the-2026-27-uef/"
CONMEBOL = "https://cdn.conmebol.com/wp-content/uploads/2025/12/CL-2026-Manual-de-Clubes-POR.pdf"

EXACT = {
    "brasileirao-a": {"teams":20,"format":"double-round-robin","relegation":4,"relegatesTo":"brasileirao-b","continental":{"libertadores":[1,5],"sulamericana":[6,12]},"qualificationNotes":["1o ao 4o: Libertadores fase de grupos","5o: fase preliminar da Libertadores","seis melhores nao classificados a Libertadores: Sul-Americana","vagas de campeoes e Copa do Brasil tem precedencia e geram cascata"],"verification":"oficial-2026-com-cascata","source":CBF_A},
    "brasileirao-b": {"teams":20,"format":"double-round-robin","promotionDirect":2,"promotionPlayoff":[3,6],"relegation":4,"promotesTo":"brasileirao-a","qualificationNotes":["1o e 2o sobem diretamente","3o x 6o e 4o x 5o disputam dois acessos"],"verification":"oficial-2026","source":CBF_B},
    "premier-league": {"teams":20,"format":"double-round-robin","relegation":3,"continental":{"champions-league":[1,4],"europa-league":[5,6],"conference-league":[7,7]},"verification":"formato-domestico-verificado-vagas-uefa-dinamicas","source":UEFA},
    "laliga": {"teams":20,"format":"double-round-robin","relegation":3,"continental":{"champions-league":[1,4],"europa-league":[5,6],"conference-league":[7,7]},"verification":"formato-domestico-verificado-vagas-uefa-dinamicas","source":UEFA},
    "serie-a-italia": {"teams":20,"format":"double-round-robin","relegation":3,"continental":{"champions-league":[1,4],"europa-league":[5,6],"conference-league":[7,7]},"verification":"formato-domestico-verificado-vagas-uefa-dinamicas","source":UEFA},
    "bundesliga": {"teams":18,"format":"double-round-robin","relegation":2,"relegationPlayoff":[16,16],"continental":{"champions-league":[1,4],"europa-league":[5,6],"conference-league":[7,7]},"verification":"formato-domestico-verificado-vagas-uefa-dinamicas","source":UEFA},
    "ligue-1": {"teams":18,"format":"double-round-robin","relegation":2,"relegationPlayoff":[16,16],"continental":{"champions-league":[1,3],"europa-league":[4,5],"conference-league":[6,6]},"verification":"formato-domestico-verificado-vagas-uefa-dinamicas","source":UEFA},
    "liga-portugal": {"teams":18,"format":"double-round-robin","relegation":2,"relegationPlayoff":[16,16],"continental":{"champions-league":[1,2],"europa-league":[3,4],"conference-league":[5,5]},"verification":"formato-domestico-verificado-vagas-uefa-dinamicas","source":UEFA},
    "eredivisie": {"teams":18,"format":"double-round-robin","relegation":2,"relegationPlayoff":[16,16],"continental":{"champions-league":[1,2],"europa-league":[3,4],"conference-league":[5,5]},"verification":"formato-domestico-verificado-playoffs-aproximados","source":UEFA},
    "argentina-primera": {"teams":30,"format":"apertura-clausura-groups","relegation":2,"continental":{"libertadores":[1,6],"sulamericana":[7,12]},"verification":"formato-2026-aproximado-no-motor","source":CONMEBOL},
    "colombia-primera-a": {"teams":20,"format":"apertura-finalizacion-quadrangular","relegation":2,"continental":{"libertadores":[1,4],"sulamericana":[5,8]},"verification":"quadrangulares-e-promedio-aproximados","source":CONMEBOL},
    "mls": {"teams":30,"format":"conferences-playoffs","relegation":0,"continental":{"concacaf-champions-cup":[1,4]},"verification":"conferencias-e-playoffs-aproximados"},
    "liga-mx": {"teams":18,"format":"apertura-clausura-play-in","relegation":0,"continental":{"concacaf-champions-cup":[1,3]},"verification":"torneios-curtos-e-play-in-aproximados"},
    "saudi-pro": {"teams":18,"format":"double-round-robin","relegation":3,"continental":{"afc-champions-league":[1,3]},"verification":"formato-domestico-verificado"},
    "j1-league": {"teams":20,"format":"double-round-robin","relegation":3,"continental":{"afc-champions-league":[1,3]},"verification":"formato-domestico-verificado"},
    "k-league-1": {"teams":12,"format":"triple-round-split","relegation":1,"relegationPlayoff":[10,11],"continental":{"afc-champions-league":[1,3]},"verification":"split-e-playoffs-aproximados"},
}

NO_RELEGATION = {"mls","liga-mx","a-league","canadian-premier","nz-national"}

def main() -> None:
    data=json.loads(CATALOG.read_text(encoding="utf-8"))
    exported={}
    for league in data["leagues"]:
        rules=dict(league.get("rules") or {})
        if league["id"] in EXACT:
            rules=EXACT[league["id"]
            ]
        else:
            rules.update({"teams":int(rules.get("teams") or len([c for c in data["clubs"] if c["leagueId"]==league["id"]]) or 16),"format":rules.get("format") or "double-round-robin","verification":rules.get("verification") or "aproximacao-documentada-do-motor"})
            if league["id"] in NO_RELEGATION:
                rules["relegation"]=0
        league["rules"]=rules
        exported[league["id"]]={"league":league["name"],"country":league["country"],**rules}
    CATALOG.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
    out=ROOT/"data"/"rules-2026.json"
    out.write_text(json.dumps({"version":"11.0.0","snapshot":"2026-08-04","warning":"Regras marcadas como aproximacao nao reproduzem integralmente medias, splits ou playoffs.","leagues":exported},ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"leagues":len(exported),"officialOrVerified":sum('oficial' in r.get('verification','') or 'verificado' in r.get('verification','') for r in exported.values()),"approximated":sum('aproxim' in r.get('verification','') for r in exported.values())}))

if __name__=="__main__": main()
