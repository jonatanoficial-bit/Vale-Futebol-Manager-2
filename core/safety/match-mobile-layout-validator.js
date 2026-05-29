export function validateMatchMobileLayoutV570(css=''){
  const checks = {
    landscape: css.includes('orientation:landscape'),
    commandDock: css.includes('.match-command-dock-v570'),
    stickyControls: css.includes('position:sticky'),
    mobileGrid: css.includes('.match-stage-v570'),
    touchTargets: css.includes('min-height:44px') || css.includes('min-height:46px')
  };
  const errors = Object.entries(checks).filter(([,v])=>!v).map(([k])=>`Layout mobile ausente: ${k}`);
  return { ok:errors.length===0, version:'v5.7.0', checks, errors };
}
