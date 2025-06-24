export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;

  const senderJID = m.sender;
  const numericID = senderJID.split('@')[0]; // e.g., "212612345678"

  // Lista de prefijos telefónicos de países árabes (puedes añadir más)
  const arabicCountryCodes = [
    /^212/, // Marruecos
    /^213/, // Argelia
    /^216/, // Túnez
    /^218/, // Libia
    /^20/,  // Egipto
    /^966/, // Arabia Saudita
    /^971/, // Emiratos Árabes Unidos
    /^965/, // Kuwait
    /^974/, // Catar
    /^973/, // Baréin
    /^968/, // Omán
    /^962/, // Jordania
    /^963/, // Siria
    /^961/, // Líbano
    /^970/, // Palestina
    /^964/, // Irak
    /^967/  // Yemen
  ];

  // Verificar si el número coincide con alguno de los prefijos árabes
  const isArabicNumber = arabicCountryCodes.some(prefix => prefix.test(numericID));

  // Solo bloquea si es un número árabe, no es el owner y no es grupo
  if (isArabicNumber && !isOwner && !isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (posiblemente árabe) bloqueado por privado.`);
    return true;
  }

  return false;
}
