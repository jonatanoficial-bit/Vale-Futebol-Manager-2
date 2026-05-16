export const $ = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
export function esc(value='') { return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
export function money(value) { return `€ ${Number(value || 0).toFixed(1)}M`; }
