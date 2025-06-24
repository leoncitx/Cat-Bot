
export async function before(m, { conn, isOwner, isROwner}) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;

  const senderJID = m.sender;
  const isUser =!senderJID.includes(':');

  // Extraer código de país (los tres primeros dígitos después de +)
  const numericID = senderJID.split('@')[0];
  const countryCodeMatch = numericID.match(/^(\d{3})/);
  const countryCode = countryCodeMatch? countryCodeMatch[1]: null;

  // No bloquear si es el dueño o un contacto verificado manualmente
  if (isOwner || isROwner) return false;

  // Verificar si está en la lista de chats previos
  const allChats = Object.keys(conn.chats || {});
  const isKnownChat = allChats.includes(m.chat);

    // Bloquea si es privado desde Marruecos y no es contacto ni dueño
  if (countryCode === '212' && !isKnownChat && isUser) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} de Marruecos bloqueado por privado (no es contacto conocido).`);
    return true;
}


  const botSettings = global.db?.data?.settings?.[conn?.user?.jid] || {};

  if (botSettings.antiPrivate &&!isKnownChat && isUser) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por privado (antiPrivate activado y desconocido).`);
    return true;
}

  return false;
}