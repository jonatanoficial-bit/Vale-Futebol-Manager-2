export function validateManagerCareer(snapshot={}){
  const issues = [];
  const profile = snapshot.profile || {};
  const contract = snapshot.contract || {};
  const security = snapshot.security || {};
  if(!profile.licenseName) issues.push('Licença do treinador ausente.');
  if(Number(profile.reputation||0) < 1 || Number(profile.reputation||0) > 100) issues.push('Reputação fora do intervalo 1-100.');
  if(!contract.role) issues.push('Contrato sem cargo.');
  if(Number(contract.remainingMonths||0) < 0) issues.push('Contrato com meses negativos.');
  if(Number(contract.wageMonthly||0) < 0) issues.push('Salário negativo detectado.');
  if(Number(contract.releaseClause||0) < 0) issues.push('Multa rescisória negativa detectada.');
  if(Number(security.score||0) < 0 || Number(security.score||0) > 100) issues.push('Segurança no cargo inválida.');
  return {status:issues.length?'warning':'ok', issues, checked:['perfil','licença','contrato','salário','multa','segurança']};
}
