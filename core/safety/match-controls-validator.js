export function validateMatchControlsV570(html=''){
  const checks = {
    commandDock: html.includes('match-command-dock-v570'),
    playPause: html.includes('data-action="match-autoplay"'),
    speed: html.includes('data-action="match-speed"'),
    decision: html.includes('data-action="match-decision"'),
    substitution: html.includes('data-action="match-substitution"'),
    postMatch: html.includes('data-action="post-match-lobby"') || html.includes('data-action="match-finish"')
  };
  const errors = Object.entries(checks).filter(([,v])=>!v).map(([k])=>`Controle ausente: ${k}`);
  return { ok:errors.length===0, version:'v5.7.0', checks, errors };
}
