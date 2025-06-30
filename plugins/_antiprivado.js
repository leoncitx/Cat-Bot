export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;

  const senderJID = m.sender;
  const numericID = senderJID.split('@')[0]; // e.g., "212612345678"

  const arabicCountryCodes = [
    /^212/,
    /^213/,
    /^216/,
    /^218/,
    /^20/,
    /^966/,
    /^971/,
    /^965/,
    /^974/,
    /^973/,
    /^968/,
    /^962/,
    /^963/,
    /^961/,
    /^970/,
    /^964/,
    /^967/
  ];

  const isArabicNumber = arabicCountryCodes.some(prefix => prefix.test(numericID));

  // Existing logic for blocking Arabic numbers
  if (isArabicNumber && !isOwner && !isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (posiblemente árabe) bloqueado por privado.`);
    return true;
  }

  // --- New Logic for Private Chat Command Restriction ---
  const command = m.text.trim().split(' ')[0]; // Get the first word as the command

  if (!isOwner && !isROwner) { // Apply this restriction to non-owners/non-ROwners
    if (command !== '.code' && command !== '.serbot') {
      await conn.sendMessage(m.chat, { text: 'Este comando no está permitido en el chat privado. Solo se pueden usar ".code" y ".serbot".' }, { quoted: m });
      return true; // Block further processing of the message
    }
  }
  // --- End of New Logic ---

  return false;
}
