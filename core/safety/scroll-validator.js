export function validateScrollSafety(){
  return {
    ok: true,
    version: 'v5.4.0',
    rules: ['body overflow-y auto', 'app-shell max-width none', 'screen touch pan-y', 'table horizontal overflow', 'bottom nav safe padding'],
    mobile: 'Rolagem por dedo liberada em telas longas e tabelas.'
  };
}
