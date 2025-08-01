
export async function before(m, { conn, isOwner, isROwner, command}) {
  if (m.isBaileys && m.fromMe) return true;
  if (!m.message) return true;

  const senderJID = m.sender;
  const numericID = senderJID.split('@')[0];

  const arabicCountryCodes = [
    /^212/, /^213/, /^63/, /^218/, /^20/, /^966/, /^971/,
    /^965/, /^974/, /^973/, /^968/, /^962/, /^963/, /^961/,
    /^970/, /^964/, /^967/
  ];

  const isArabicNumber = arabicCountryCodes.some(prefix => prefix.test(numericID));

  if (m.isGroup) return false;

  // 🧿 Revisión para números árabes
  if (isArabicNumber &&!isOwner &&!isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (posiblemente árabe) bloqueado por privado.`);
    return true;
}

  // 🚫 Revisión para comandos no permitidos en privado
  const comandosPermitidos = ['code', 'serbot'];
  const textoCmd = typeof command === 'string'? command.toLowerCase(): '';

  if (!comandosPermitidos.includes(textoCmd) &&!isOwner &&!isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por intentar usar comando "${command}" en privado.`);
    return true;
}

  return false;
}