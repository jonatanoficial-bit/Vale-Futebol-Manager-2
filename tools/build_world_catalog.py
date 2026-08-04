from __future__ import annotations

import json
import os
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROSTERS = ROOT / "data" / "rosters" / "2026"

LEAGUES = {
    "brazil/serie-a": ("south-america", "brazil", "Brasil", "brasileirao-a", "Brasileirão Série A", "CONMEBOL", 1, 82),
    "brazil/serie-b": ("south-america", "brazil", "Brasil", "brasileirao-b", "Brasileirão Série B", "CONMEBOL", 2, 72),
    "europe/premier-league": ("europe", "england", "Inglaterra", "premier-league", "Premier League", "UEFA", 1, 88),
    "europe/laliga": ("europe", "spain", "Espanha", "laliga", "LaLiga", "UEFA", 1, 87),
    "europe/bundesliga": ("europe", "germany", "Alemanha", "bundesliga", "Bundesliga", "UEFA", 1, 85),
    "europe/ligue-1": ("europe", "france", "França", "ligue-1", "Ligue 1", "UEFA", 1, 83),
    "europe/liga-portugal": ("europe", "portugal", "Portugal", "liga-portugal", "Liga Portugal", "UEFA", 1, 80),
    "europe/serie-a": ("europe", "italy", "Itália", "serie-a-italia", "Serie A", "UEFA", 1, 85),
    "europe/serie-a-italy": ("europe", "italy", "Itália", "serie-a-italia", "Serie A", "UEFA", 1, 85),
    "south-america/argentina-primera": ("south-america", "argentina", "Argentina", "argentina-primera", "Liga Profesional", "CONMEBOL", 1, 78),
    "south-america/bolivia-primera": ("south-america", "bolivia", "Bolívia", "bolivia-primera", "División Profesional", "CONMEBOL", 1, 68),
    "south-america/chile-primera": ("south-america", "chile", "Chile", "chile-primera", "Primera División", "CONMEBOL", 1, 72),
    "south-america/colombia-primera": ("south-america", "colombia", "Colômbia", "colombia-primera-a", "Categoría Primera A", "CONMEBOL", 1, 74),
    "south-america/colombia-primera-a": ("south-america", "colombia", "Colômbia", "colombia-primera-a", "Categoría Primera A", "CONMEBOL", 1, 74),
    "south-america/ecuador-serie-a": ("south-america", "ecuador", "Equador", "ecuador-serie-a", "LigaPro Serie A", "CONMEBOL", 1, 72),
    "south-america/paraguay-primera": ("south-america", "paraguay", "Paraguai", "paraguay-primera", "Primera División", "CONMEBOL", 1, 70),
    "south-america/peru-liga-1": ("south-america", "peru", "Peru", "peru-liga-1", "Liga 1", "CONMEBOL", 1, 69),
    "south-america/uruguay-primera": ("south-america", "uruguay", "Uruguai", "uruguay-primera", "Primera División", "CONMEBOL", 1, 72),
}

LEAGUE_RULES = {
    "brasileirao-a": {"continental": {"libertadores": [1, 4], "sulamericana": [5, 12]}, "relegation": 4},
    "brasileirao-b": {"promotion": 4, "relegation": 4},
    "premier-league": {"continental": {"champions-league": [1, 4], "europa-league": [5, 6]}, "relegation": 3},
    "laliga": {"continental": {"champions-league": [1, 4], "europa-league": [5, 6]}, "relegation": 3},
    "bundesliga": {"continental": {"champions-league": [1, 4], "europa-league": [5, 6]}, "relegation": 2},
    "ligue-1": {"continental": {"champions-league": [1, 3], "europa-league": [4, 5]}, "relegation": 3},
    "liga-portugal": {"continental": {"champions-league": [1, 2], "europa-league": [3, 4]}, "relegation": 3},
    "serie-a-italia": {"continental": {"champions-league": [1, 4], "europa-league": [5, 6]}, "relegation": 3},
    "argentina-primera": {"continental": {"libertadores": [1, 4], "sulamericana": [5, 10]}, "relegation": 2},
}

# Real clubs used by the continental and world simulation when a complete local roster is not available.
# These entries never invent player names: clubs without rosterPath are AI-only until a sourced squad is added.
GLOBAL_POOLS = [
    ("south-america","venezuela","Venezuela","venezuela-primera","Liga FUTVE","CONMEBOL",69,["Deportivo Táchira","Caracas FC","Universidad Central","Academia Puerto Cabello","Carabobo FC","Metropolitanos","Monagas SC","Zamora FC","Estudiantes de Mérida","Deportivo La Guaira","Rayo Zuliano","Portuguesa FC"]),
    ("south-america","bolivia","Bolívia","bolivia-primera","División Profesional","CONMEBOL",68,["Bolívar","The Strongest","Always Ready","Blooming","Oriente Petrolero","Jorge Wilstermann","Aurora","Nacional Potosí","Real Tomayapo","Independiente Petrolero","GV San José","Universitario de Vinto"]),
    ("south-america","paraguay","Paraguai","paraguay-primera","Primera División","CONMEBOL",70,["Olimpia","Cerro Porteño","Libertad","Guaraní","Nacional","Sportivo Luqueño","General Caballero JLM","Trinidense","2 de Mayo","Ameliano","Recoleta","Tembetary"]),
    ("south-america","peru","Peru","peru-liga-1","Liga 1","CONMEBOL",69,["Universitario","Alianza Lima","Sporting Cristal","Melgar","Cienciano","Cusco FC","Sport Huancayo","ADT","Deportivo Garcilaso","Atlético Grau","Alianza Atlético","Comerciantes Unidos","Los Chankas","Sport Boys","UTC","Juan Pablo II","Ayacucho FC","Binacional"]),
    ("north-america","usa","Estados Unidos","mls","Major League Soccer","CONCACAF",75,["Inter Miami","Los Angeles FC","Seattle Sounders","Columbus Crew","LA Galaxy","New York City FC","Atlanta United","Orlando City","FC Cincinnati","Philadelphia Union","New York Red Bulls","Austin FC","Portland Timbers","Sporting Kansas City","Nashville SC","Minnesota United"]),
    ("north-america","mexico","México","liga-mx","Liga MX","CONCACAF",76,["Club América","Monterrey","Tigres UANL","Cruz Azul","Guadalajara","Pumas UNAM","Toluca","Pachuca","León","Santos Laguna","Atlas","Necaxa","Puebla","Querétaro","Tijuana","Atlético San Luis","Juárez","Mazatlán"]),
    ("north-america","costa-rica","Costa Rica","costa-rica-primera","Primera División","CONCACAF",68,["Saprissa","Alajuelense","Herediano","Cartaginés","Puntarenas","Guanacasteca","San Carlos","Sporting San José"]),
    ("north-america","canada","Canadá","canadian-premier","Canadian Premier League","CONCACAF",66,["Forge FC","Cavalry FC","Pacific FC","Atlético Ottawa","York United","HFX Wanderers","Valour FC","Vancouver FC"]),
    ("asia","saudi-arabia","Arábia Saudita","saudi-pro","Saudi Pro League","AFC",77,["Al Hilal","Al Nassr","Al Ittihad","Al Ahli","Al Qadsiah","Al Ettifaq","Al Taawoun","Al Shabab","Al Fateh","Al Fayha","Damac","Al Riyadh"]),
    ("asia","japan","Japão","j1-league","J1 League","AFC",73,["Urawa Red Diamonds","Kawasaki Frontale","Yokohama F. Marinos","Vissel Kobe","Kashima Antlers","Sanfrecce Hiroshima","Gamba Osaka","Cerezo Osaka","FC Tokyo","Nagoya Grampus","Kashiwa Reysol","Tokyo Verdy","Albirex Niigata","Avispa Fukuoka","Shonan Bellmare","Kyoto Sanga","Machida Zelvia","Júbilo Iwata"]),
    ("asia","south-korea","Coreia do Sul","k-league-1","K League 1","AFC",72,["Ulsan HD","Jeonbuk Hyundai Motors","Pohang Steelers","FC Seoul","Suwon FC","Daegu FC","Daejeon Hana Citizen","Gwangju FC","Gangwon FC","Jeju United","Gimcheon Sangmu","Incheon United"]),
    ("asia","qatar","Catar","qatar-stars","Qatar Stars League","AFC",70,["Al Sadd","Al Duhail","Al Rayyan","Al Gharafa","Umm Salal","Qatar SC","Al Arabi","Al Wakrah"]),
    ("asia","uae","Emirados Árabes Unidos","uae-pro","UAE Pro League","AFC",70,["Al Ain","Shabab Al Ahli","Al Wasl","Al Jazira","Al Wahda","Sharjah FC","Baniyas","Ajman"]),
    ("africa","egypt","Egito","egypt-premier","Egyptian Premier League","CAF",72,["Al Ahly","Zamalek","Pyramids FC","Al Masry","Future FC","Ismaily","ENPPI","Ceramica Cleopatra","Smouha","Al Ittihad Alexandria","National Bank","Pharco"]),
    ("africa","morocco","Marrocos","botola","Botola Pro","CAF",71,["Wydad AC","Raja CA","RS Berkane","FAR Rabat","FUS Rabat","Maghreb Fès","Hassania Agadir","Ittihad Tanger","Olympic Safi","Moghreb Tétouan","COD Meknès","Difaâ El Jadida"]),
    ("africa","south-africa","África do Sul","sa-premiership","South African Premiership","CAF",70,["Mamelodi Sundowns","Orlando Pirates","Kaizer Chiefs","Stellenbosch","SuperSport United","Cape Town City","Sekhukhune United","AmaZulu","Polokwane City","TS Galaxy","Golden Arrows","Chippa United"]),
    ("africa","tunisia","Tunísia","tunisia-ligue-1","Ligue Professionnelle 1","CAF",69,["Espérance de Tunis","Étoile du Sahel","Club Africain","CS Sfaxien","US Monastir","Stade Tunisien","Olympique Béja","ES Métlaoui","US Tataouine","CA Bizertin"]),
    ("africa","algeria","Argélia","algeria-ligue-1","Ligue 1","CAF",69,["CR Belouizdad","MC Alger","USM Alger","JS Kabylie","ES Sétif","CS Constantine","MC Oran","Paradou AC","USM Khenchela","JS Saoura"]),
    ("oceania","new-zealand","Nova Zelândia","nz-national","New Zealand National League","OFC",62,["Auckland City","Wellington Olympic","Auckland United","Christchurch United","Eastern Suburbs","Birkenhead United","Cashmere Technical","Western Springs"]),
    ("europe","netherlands","Países Baixos","eredivisie","Eredivisie","UEFA",79,["Ajax","PSV","Feyenoord","AZ Alkmaar","FC Twente","Utrecht","Heerenveen","Groningen","NEC Nijmegen","Sparta Rotterdam","Go Ahead Eagles","Fortuna Sittard","Heracles","NAC Breda","PEC Zwolle","Willem II","RKC Waalwijk","Almere City"]),
    ("europe","turkey","Turquia","super-lig","Süper Lig","UEFA",78,["Galatasaray","Fenerbahçe","Beşiktaş","Trabzonspor","Başakşehir","Samsunspor","Kasımpaşa","Göztepe","Sivasspor","Konyaspor","Antalyaspor","Alanyaspor","Rizespor","Gaziantep","Kayserispor","Eyüpspor","Bodrum FK","Hatayspor"]),
    ("europe","belgium","Bélgica","belgian-pro","Belgian Pro League","UEFA",76,["Club Brugge","Anderlecht","Union Saint-Gilloise","Genk","Antwerp","Gent","Standard Liège","Mechelen","Cercle Brugge","Westerlo","Charleroi","OH Leuven","Sint-Truiden","Kortrijk","Dender","Beerschot"]),
    ("europe","scotland","Escócia","scottish-premiership","Scottish Premiership","UEFA",74,["Celtic","Rangers","Aberdeen","Hearts","Hibernian","Dundee United","Motherwell","St Mirren","Kilmarnock","Dundee FC","Ross County","St Johnstone"]),
    ("europe","austria","Áustria","austrian-bundesliga","Austrian Bundesliga","UEFA",74,["Red Bull Salzburg","Sturm Graz","Rapid Wien","Austria Wien","LASK","Wolfsberger AC","Hartberg","Austria Klagenfurt","WSG Tirol","Blau-Weiß Linz"]),
    ("europe","greece","Grécia","super-league-greece","Super League Greece","UEFA",74,["Olympiacos","Panathinaikos","AEK Athens","PAOK","Aris","OFI Crete","Asteras Tripolis","Atromitos","Panetolikos","Volos"]),
]

NAME_OVERRIDES = {
    "ac-milan": "AC Milan", "psg": "Paris Saint-Germain", "paris-saint-germain": "Paris Saint-Germain",
    "rb-leipzig": "RB Leipzig", "crb": "CRB", "ldu-quito": "LDU Quito", "fc-porto": "FC Porto",
    "sporting-cp": "Sporting CP", "atletico-mg": "Atlético-MG", "atletico-go": "Atlético-GO",
    "sao-paulo": "São Paulo", "gremio": "Grêmio", "vitoria": "Vitória", "ceara": "Ceará",
    "avai": "Avaí", "goias": "Goiás", "nautico": "Náutico", "operario": "Operário",
}

NATIONS = {
    "brasil": ("Brasil", "CONMEBOL", 90, 78), "argentina": ("Argentina", "CONMEBOL", 91, 80),
    "uruguai": ("Uruguai", "CONMEBOL", 84, 72), "colombia": ("Colômbia", "CONMEBOL", 82, 68),
    "alemanha": ("Alemanha", "UEFA", 88, 76), "espanha": ("Espanha", "UEFA", 90, 78),
    "franca": ("França", "UEFA", 91, 80), "holanda": ("Holanda", "UEFA", 87, 74),
    "inglaterra": ("Inglaterra", "UEFA", 89, 77), "italia": ("Itália", "UEFA", 86, 73),
    "portugal": ("Portugal", "UEFA", 88, 75), "estados-unidos": ("Estados Unidos", "CONCACAF", 79, 62),
    "mexico": ("México", "CONCACAF", 80, 64), "japao": ("Japão", "AFC", 78, 60),
    "marrocos": ("Marrocos", "CAF", 82, 66), "senegal": ("Senegal", "CAF", 81, 65),
}


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def title_name(slug: str) -> str:
    if slug in NAME_OVERRIDES:
        return NAME_OVERRIDES[slug]
    keep_upper = {"fc", "ac", "rb", "sc", "afc", "cfc", "psg", "crb"}
    return " ".join(part.upper() if part in keep_upper else part.capitalize() for part in slug.split("-"))


def slug_name(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")


def asset_path(country_id: str, team_id: str, filename: str) -> str:
    candidate = ROOT / "assets" / "clubs" / country_id / team_id / filename
    return candidate.relative_to(ROOT).as_posix() if candidate.exists() else "assets/placeholders/club-generic.png"


clubs = []
leagues = {}
seen = set()
for folder, definition in LEAGUES.items():
    directory = ROSTERS / folder
    if not directory.exists():
        continue
    continent, country_id, country, league_id, league_name, confederation, division, base_rating = definition
    leagues.setdefault(league_id, {
        "id": league_id, "name": league_name, "continent": continent, "countryId": country_id,
        "country": country, "confederation": confederation, "division": division, "baseRating": base_rating,
        "rules": LEAGUE_RULES.get(league_id, {"continental": {"libertadores" if confederation == "CONMEBOL" else "champions-league": [1, 4]}, "relegation": 2}),
        "logo": f"assets/leagues/{country_id}/{league_id}.png",
    })
    for roster_file in sorted(directory.glob("*.json")):
        data = load_json(roster_file)
        meta = data.get("meta", {})
        players = data.get("players", [])
        team_id = str(meta.get("teamId") or meta.get("clubId") or roster_file.stem)
        unique = f"{league_id}:{team_id}"
        if unique in seen:
            continue
        seen.add(unique)
        valid_overalls = [int(p.get("overall", 0)) for p in players if p.get("overall")]
        rating = round(sum(valid_overalls) / len(valid_overalls)) if valid_overalls else base_rating
        clubs.append({
            "id": team_id, "name": meta.get("teamName") or meta.get("clubName") or title_name(team_id),
            "continent": continent, "countryId": country_id, "country": country, "confederation": confederation,
            "leagueId": league_id, "leagueName": league_name, "division": division,
            "rosterPath": roster_file.relative_to(ROOT).as_posix(), "players": len(players), "rating": rating,
            "badge": asset_path(country_id, team_id, "badge.png"), "logo": asset_path(country_id, team_id, "logo.png"),
            "stadium": f"assets/stadiums/{country_id}/{team_id}.jpg" if (ROOT / "assets" / "stadiums" / country_id / f"{team_id}.jpg").exists() else "assets/placeholders/stadium-generic.jpg",
        })

# Complete the main confederation pools with real clubs even when the archive has no sourced roster.
for continent, country_id, country, league_id, league_name, confederation, base_rating, club_names in GLOBAL_POOLS:
    continental_id = {
        "UEFA": "champions-league", "CONMEBOL": "libertadores", "CONCACAF": "concacaf-champions-cup",
        "AFC": "afc-champions-league", "CAF": "caf-champions-league", "OFC": "ofc-champions-league",
    }[confederation]
    leagues.setdefault(league_id, {
        "id": league_id, "name": league_name, "continent": continent, "countryId": country_id,
        "country": country, "confederation": confederation, "division": 1, "baseRating": base_rating,
        "rules": {"continental": {continental_id: [1, 4]}, "relegation": 2},
        "logo": f"assets/leagues/{country_id}/{league_id}.png",
    })
    existing = {club["id"] for club in clubs if club["leagueId"] == league_id}
    for name in club_names:
        team_id = slug_name(name)
        if team_id in existing:
            continue
        seed = sum(ord(char) for char in name)
        clubs.append({
            "id": team_id, "name": name, "continent": continent, "countryId": country_id,
            "country": country, "confederation": confederation, "leagueId": league_id,
            "leagueName": league_name, "division": 1, "rosterPath": None, "players": 0,
            "rating": base_rating - 3 + seed % 7, "badge": asset_path(country_id, team_id, "badge.png"),
            "logo": asset_path(country_id, team_id, "logo.png"), "stadium": "assets/placeholders/stadium-generic.jpg",
            "simulationOnly": True,
        })
        existing.add(team_id)

# Real clubs with logos but without a complete roster still populate simulations and tables.
for league in leagues.values():
    if league["countryId"] == "brazil":
        # Série A e Série B já têm exatamente vinte clubes com elenco completo.
        # Reutilizar a pasta nacional de escudos misturaria as duas divisões.
        continue
    country_dir = ROOT / "assets" / "clubs" / league["countryId"]
    if not country_dir.exists():
        continue
    existing = {club["id"] for club in clubs if club["leagueId"] == league["id"]}
    for team_dir in sorted(p for p in country_dir.iterdir() if p.is_dir()):
        team_id = team_dir.name
        if team_id in existing:
            continue
        seed = sum(ord(char) for char in team_id)
        clubs.append({
            "id": team_id, "name": title_name(team_id), "continent": league["continent"],
            "countryId": league["countryId"], "country": league["country"], "confederation": league["confederation"],
            "leagueId": league["id"], "leagueName": league["name"], "division": league["division"],
            "rosterPath": None, "players": 0, "rating": league["baseRating"] - 5 + seed % 9,
            "badge": asset_path(league["countryId"], team_id, "badge.png"),
            "logo": asset_path(league["countryId"], team_id, "logo.png"),
            "stadium": f"assets/stadiums/{league['countryId']}/{team_id}.jpg" if (ROOT / "assets" / "stadiums" / league["countryId"] / f"{team_id}.jpg").exists() else "assets/placeholders/stadium-generic.jpg",
        })

fifa_world = load_json(ROOT / "data" / "fifa-associations-2026.json")
nations = [
    {**team, "rating": team.get("simulationStrength", 60)}
    for team in fifa_world["associations"]
]

catalog = {
    "version": "10.0.0", "season": 2026, "generatedFrom": "Vale Futebol Manager original data pack",
    "leagues": sorted(leagues.values(), key=lambda item: (item["continent"], item["country"], item["division"])),
    "clubs": sorted(clubs, key=lambda item: (item["continent"], item["country"], item["leagueName"], item["name"])),
    "nationalTeams": sorted(nations, key=lambda item: item["name"]),
    "competitions": [
        {"id": "copa-nacional", "name": "Copa nacional", "type": "domestic-cup", "format": "Mata-mata", "logo": "assets/competitions/copa_do_brasil.png"},
        {"id": "libertadores", "name": "CONMEBOL Libertadores", "type": "continental", "confederation": "CONMEBOL", "format": "Grupos e mata-mata", "logo": "assets/competitions/libertadores.png"},
        {"id": "sulamericana", "name": "CONMEBOL Sul-Americana", "type": "continental", "confederation": "CONMEBOL", "format": "Grupos e mata-mata", "logo": "assets/competitions/sulamericana.png"},
        {"id": "champions-league", "name": "UEFA Champions League", "type": "continental", "confederation": "UEFA", "format": "Fase de liga e mata-mata", "logo": "assets/competitions/champions.png"},
        {"id": "europa-league", "name": "UEFA Europa League", "type": "continental", "confederation": "UEFA", "format": "Fase de liga e mata-mata", "logo": "assets/competitions/europa_league.png"},
        {"id": "concacaf-champions-cup", "name": "CONCACAF Champions Cup", "type": "continental", "confederation": "CONCACAF", "format": "Mata-mata", "logo": "assets/competitions/concacaf-champions-cup.png"},
        {"id": "afc-champions-league", "name": "AFC Champions League Elite", "type": "continental", "confederation": "AFC", "format": "Fase de liga e mata-mata", "logo": "assets/competitions/afc-champions-league.png"},
        {"id": "caf-champions-league", "name": "CAF Champions League", "type": "continental", "confederation": "CAF", "format": "Grupos e mata-mata", "logo": "assets/competitions/caf-champions-league.png"},
        {"id": "ofc-champions-league", "name": "OFC Champions League", "type": "continental", "confederation": "OFC", "format": "Grupos e mata-mata", "logo": "assets/competitions/ofc-champions-league.png"},
        {"id": "club-world-cup", "name": "Mundial de Clubes", "type": "world", "format": "Grupos e mata-mata", "logo": "assets/competitions/club-world-cup.png"},
        {"id": "world-cup-qualifiers", "name": "Eliminatórias da Copa", "type": "national", "format": "Liga continental", "logo": "assets/competitions/qualifiers.png"},
        {"id": "continental-national-cup", "name": "Copa continental de seleções", "type": "national", "format": "Grupos e mata-mata", "logo": "assets/competitions/copa-america.png"},
        {"id": "world-cup", "name": "Copa do Mundo", "type": "national", "format": "Grupos e mata-mata", "logo": "assets/competitions/world-cup.png"},
    ],
    "stats": {
        "playableClubs": sum(1 for club in clubs if club["rosterPath"]),
        "simulationClubs": len(clubs),
        "clubPlayers": sum(club["players"] for club in clubs),
        "nationalTeams": len(nations),
        "nationalPlayers": sum(team["players"] for team in nations),
        "officialNationalSquads": sum(bool(team.get("officialSquad")) for team in nations),
        "managerAvatars": len(list((ROOT / "assets" / "avatars").glob("*.png"))),
    },
}

output = ROOT / "data" / "world-catalog-2026.json"
output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(catalog["stats"], ensure_ascii=False))
