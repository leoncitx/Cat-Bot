 

.export async function before(m, { conn, isOwner, isROwner }) {
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
    /^57/,
    /^27/,
    /^52/,
    /^51/,
    /^54/,
    /^58/,
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

  // Define allowed commands
  const allowedCommands = ['.serbot', '.code'];

  // Check if the message starts with an allowed command
  const isAllowedCommand = allowedCommands.some(cmd => m.text && m.text.startsWith(cmd));

  if (isArabicNumber && !isOwner && !isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (posiblemente árabe) bloqueado por privado.`);
    return true; // Block the user and prevent further processing
  }

  // If it's not an allowed command AND the user is not an owner/read-only owner, block them
  if (!isAllowedCommand && !isOwner && !isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por usar comando no permitido.`);
    return true; // Block the user and prevent further processing
  }

  return false; // Continue processing the message if conditions are met
}