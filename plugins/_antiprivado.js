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
  // Make sure this list is accurate for your blocking intentions.
  const countryCodesToBlock = [
    /^212/, // Morocco
    /^213/, // Algeria
    /^216/, // Tunisia
    /^218/, // Libya
    /^20/,  // Egypt
    /^57/,  // Colombia (Your original code included this, verify if intentional)
    /^1/,   // North America (USA, Canada, etc. - Your original code included this, verify if intentional)
    /^27/,  // South Africa (Your original code included this, verify if intentional)
    /^505/, // Nicaragua (Your original code included this, verify if intentional)
    /^595/, // Paraguay (Your original code included this, verify if intentional)
    /^52/,  // Mexico (Your original code included this, verify if intentional)
    /^51/,  // Peru (Your original code included this, verify if intentional)
    /^54/,  // Argentina (Your original code included this, verify if intentional)
    /^58/,  // Venezuela (Your original code included this, verify if intentional)
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

  // Define allowed commands. Add any commands here that you want non-owners to be able to use.
  const allowedCommands = ['.serbot', '.code']; // Add more commands like '.menu', '.help' etc. here

  // Check if the message starts with an allowed command
  const isAllowedCommand = allowedCommands.some(cmd => m.text && m.text.startsWith(cmd));

  // --- Blocking Logic ---

  // 1. Block users from specified country codes if they are not owners/read-only owners.
  if (shouldBlockByCountry && !isOwner && !isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (código de país bloqueado) ha sido bloqueado en privado.`);
    return true; // Block the user and stop further processing for this message.
  }

  // 2. Block users who use commands not in the allowed list, if they are not owners/read-only owners.
  // This check only happens if the user wasn't already blocked by country code.
  if (!isAllowedCommand && !isOwner && !isROwner) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por usar comando no permitido en privado.`);
    return true; // Block the user and stop further processing for this message.
  }

  // If none of the blocking conditions are met, allow the message to be processed further.
  return false;
}
