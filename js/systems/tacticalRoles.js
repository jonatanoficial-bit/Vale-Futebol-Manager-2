export const TACTICAL_ROLES_VERSION = '1.0.0';

const ROLE_BY_POSITION = {
  GOL:['Goleiro construtor','Goleiro clássico'], LD:['Lateral de apoio','Lateral defensivo'], LE:['Lateral de apoio','Lateral defensivo'], ZAG:['Zagueiro construtor','Zagueiro de combate'], ALA:['Ala ofensivo','Ala equilibrado'], VOL:['Volante marcador','Organizador recuado'], MC:['Meia área a área','Meia controlador'], MEI:['Armador avançado','Meia infiltrador'], MD:['Ponta por dentro','Extremo aberto'], ME:['Ponta por dentro','Extremo aberto'], PD:['Ponta por dentro','Extremo aberto'], PE:['Ponta por dentro','Extremo aberto'], ATA:['Atacante móvel','Homem de referência'], SA:['Segundo atacante','Armador avançado']
};

const ROLE_EFFECTS = {
  'Goleiro construtor':{control:1.8, defence:-.2}, 'Goleiro clássico':{defence:1.2},
  'Lateral de apoio':{attack:1.6, control:.8, defence:-.5}, 'Lateral defensivo':{defence:1.8, attack:-.4},
  'Zagueiro construtor':{control:1.3}, 'Zagueiro de combate':{defence:1.6, control:-.3}, 'Ala ofensivo':{attack:2.2, defence:-1}, 'Ala equilibrado':{attack:.8, defence:.8},
  'Volante marcador':{defence:2, control:-.2}, 'Organizador recuado':{control:2, defence:.4}, 'Meia área a área':{attack:1.2, control:1.1, defence:.7}, 'Meia controlador':{control:2.1, attack:-.2},
  'Armador avançado':{attack:1.5, control:2}, 'Meia infiltrador':{attack:2.2, control:.4}, 'Ponta por dentro':{attack:2, control:.2}, 'Extremo aberto':{attack:1.1, control:1.1},
  'Atacante móvel':{attack:2.1, control:.5}, 'Homem de referência':{attack:1.8, control:-.1}, 'Segundo atacante':{attack:1.8, control:1.2}
};

export function rolesForPosition(position = 'MC') { return ROLE_BY_POSITION[position] || ['Função equilibrada']; }

export function ensureTacticalRoles(career) {
  const current = career.tacticalRoles || {};
  const next = {};
  (career.roster || []).forEach(player => { const allowed = rolesForPosition(player.pos); next[player.id] = allowed.includes(current[player.id]) ? current[player.id] : allowed[0]; });
  career.tacticalRoles = next;
  return next;
}

export function roleEffects(lineup = [], roles = {}) {
  return lineup.reduce((total, player) => {
    const effect = ROLE_EFFECTS[roles[player.id]] || {};
    total.attack += Number(effect.attack || 0); total.control += Number(effect.control || 0); total.defence += Number(effect.defence || 0);
    return total;
  }, { attack:0, control:0, defence:0 });
}

export function roleLabel(player, roles) { return roles?.[player?.id] || rolesForPosition(player?.pos)[0]; }
