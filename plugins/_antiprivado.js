export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;

  const senderJID = m.sender;
  const numericID = senderJID.split('@')[0]; // e.g., "212612345678"

  const arabicCountryCodes = [
    /^212/, // Morocco
    /^213/, // Algeria
    /^216/, // Tunisia
    /^218/, // Libya
    /^20/,  // Egypt
    /^966/, // Saudi Arabia
    /^971/, // UAE
    /^965/, // Kuwait
    /^974/, // Qatar
    /^973/, // Bahrain
    /^968/, // Oman
    /^962/, // Jordan
    /^963/, // Syria
    /^961/, // Lebanon
    /^970/, // Palestine
    /^964/, // Iraq
    /^967/  // Yemen
  ];

  const isArabicNumber = arabicCountryCodes.some(prefix => prefix.test(numericID));


  if (isArabicNumber && !isOwner && !isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (posiblemente árabe) bloqueado por privado.`);
    return true;
  }

  const command = m.text.trim().split(' ')[0]; // Get the first word as the command

  if (!isOwner && !isROwner) { // Apply this restriction to non-owners/non-ROwners
  
    if (command !== '.code' && command !== '.serbot') {
      await conn.sendMessage(m.chat, { text: 'Este comando no está permitido en el chat privado. Solo se pueden usar ".code" y ".serbot".' }, { quoted: m });
    other command handlers to potentially process the message.
       warning, you'd use 'return true;'.
      return false;
    }
  }

  return false; // Allow all other messages/commands to proceed normally
}
