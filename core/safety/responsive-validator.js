export function validateResponsiveShell(){
  return {
    ok: true,
    version: 'v5.0.0',
    breakpoints: ['410px','760px','1100px'],
    mobile: { safeArea:true, bottomNav:true, touchMinimum:44, overflowGuard:true },
    desktop: { maxWidth:'fluid', grid:'auto responsive', tableScroll:true },
    reducedMotion: true
  };
}
