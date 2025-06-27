export async function before(m, { conn, isOwner, isROwner }) {
  // If it's a Baileys message and sent by the bot itself, ignore it.
  if (m.isBaileys && m.fromMe) return true;

  // If the message is from a group, don't process this 'before' hook for private chat specific logic.
  // This means the blocking logic below will only apply to private chats.
  if (m.isGroup) return false;

  // If there's no message content, ignore it.
  if (!m.message) return true;

  const senderJID = m.sender;
  const numericID = senderJID.split('@')[0]; // e.g., "212612345678"

  // Define country codes to block.
  const countryCodesToBlock = [
    /^212/, // Morocco
    /^213/, // Algeria
    /^216/, // Tunisia
    /^218/, // Libya
    /^20/,  // Egypt
    /^57/,  // Colombia
    /^1/,   // North America (USA, Canada, etc.)
    /^27/,  // South Africa
    /^505/, // Nicaragua
    /^595/, // Paraguay
    /^52/,  // Mexico
    /^51/,  // Peru
    /^54/,  // Argentina
    /^58/,  // Venezuela
    /^966/, // Saudi Arabia
    /^971/, // United Arab Emirates
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

  const shouldBlockByCountry = countryCodesToBlock.some(prefix => prefix.test(numericID));

  // Define allowed commands that bypass all non-owner blocking.
  const allowedCommands = ['.serbot', '.code'];

  // Check if the message starts with an allowed command.
  const isAllowedCommand = allowedCommands.some(cmd => m.text && m.text.startsWith(cmd));

  // --- Blocking Logic ---

  // If the user is an owner or read-only owner, they are never blocked.
  if (isOwner || isROwner) {
    return false; // Allow the message to be processed further.
  }

  // If the message is an allowed command, do not block the user, even if their country code is blocked.
  if (isAllowedCommand) {
    return false; // Allow the message to be processed further.
  }

  // If the user is not an owner/ROwner AND their country code is blocked AND it's not an allowed command, then block them.
  if (shouldBlockByCountry) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (código de país bloqueado) ha sido bloqueado en privado.`);
    return true; // Block the user and stop further processing for this message.
  }

  // If none of the above conditions are met (i.e., not an owner, not an allowed command, and country not blocked),
  // then block the user for using any other command. This implicitly means only allowed commands are permitted
  // for non-owners from non-blocked countries.
  if (!isAllowedCommand) { // This condition will always be true if we reach here and it's not an allowed command.
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por usar comando no permitido en privado.`);
    return true; // Block the user and stop further processing for this message.
  }

  // If none of the blocking conditions are met (e.g., user is from an allowed country and uses an allowed command),
  // allow the message to be processed further.
  return false;
}
