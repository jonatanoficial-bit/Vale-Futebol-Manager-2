# Changelog - v5.1.0

## Fase 13 - Save profissional

### Adicionado
- Sistema `saveManager.js` com schema 510.
- Chave nova de save: `vfm_gold_save_v510`.
- Migração automática de saves anteriores, incluindo v5.0.0 e v4.x.
- Múltiplos slots manuais de backup.
- Backup automático antes da persistência quando autosave está ativo.
- Exportação em envelope JSON com metadados de versão, build, clube, manager e temporada.
- Importação segura com validação antes de sobrescrever o estado atual.
- Recuperação de save corrompido via backup automático.
- Central de Save Profissional no lobby.

### Segurança anti-quebra
- JSON inválido não derruba o jogo.
- Importação inválida é bloqueada.
- Save antigo é normalizado para o estado atual.
- Se o save principal corromper, o jogo tenta carregar backup automático.
- Se nenhum backup existir, o jogo recria um estado seguro padrão.
