# CHANGELOG — Vale Futebol Manager v5.9.1

Build visível: Build v5.9.1 | 2026-05-29 | 20:45 BRT
Fase 34: América do Sul completa por logos/ligas do jogo.

## Adicionado
- Novo pacote `officialSouthAmerica2026RosterData.js`.
- Cobertura para todos os clubes sul-americanos presentes na biblioteca de logos/ligas do jogo.
- Mínimo de 11 titulares por clube nos clubes que ainda não tinham pacote prioritário completo.
- Validador `south-america-all-logo-roster-validator.js`.
- Roster Lock atualizado para contar América do Sul total, não só o pacote CONMEBOL prioritário.

## Resultado
- Clubes sul-americanos com logo/liga cobertos: 85.
- Clubes adicionados nesta build: 69.
- Jogadores/titulares adicionados nesta build: 759.
- Genéricos detectados: 0.

## Cobertura por país nesta build
```json
{
  "Argentina": 23,
  "Uruguai": 11,
  "Chile": 10,
  "Colômbia": 15,
  "Equador": 10
}
```

## Observação de produção
Os 16 clubes CONMEBOL prioritários continuam com pacotes mais completos. Os demais clubes receberam cobertura mínima de 11 titulares para gameplay, com camada editável para expansão para 23-30 atletas por clube.
