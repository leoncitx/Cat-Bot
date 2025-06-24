
export async function before(m, { conn, isOwner, isROwner}) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;

  const senderJID = m.sender;
  const countryCodeMatch = senderJID.match(/^(\d+)/);
  const countryCode = countryCodeMatch? countryCodeMatch[1]: null;

  const contact = await conn.getContactById(senderJID);
  const isSavedContact = contact?.name && contact.name!== senderJID.split('@')[0];

  // Si es el país 212 y no es un contacto conocido ni el dueño, bloquear
  if (countryCode === '212' &&!isSavedContact &&!isOwner &&!isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} de Marruecos bloqueado por privado (desconocido).`);
    return true;
}

  const botSettings = global.db?.data?.settings?.[conn?.user?.jid] || {};

  // Bloquea si está activado el antiPrivate Y no es contacto conocido
  if (botSettings.antiPrivate &&!isSavedContact &&!isOwner &&!isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por privado (antiPrivate activado).`);
    return true;
}

  return false;
}