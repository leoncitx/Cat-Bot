export async function before(m, { conn, isOwner, isROwner}) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup ||!m.message) return false;

  const senderJID = m.sender;
  const numericID = senderJID.split('@')[0];

  const countryCodesToBlock = [
    /^212/, /^213/, /^216/, /^218/, /^20/, /^57/, /^1/, /^27/,
    /^505/, /^595/, /^52/, /^51/, /^54/, /^58/, /^966/, /^971/,
    /^965/, /^974/, /^973/, /^968/, /^962/, /^963/, /^961/,
    /^970/, /^964/, /^967/
  ];

  const allowedCommands = ['.serbot', '.code'];
  const isCommand = m.text && m.text.startsWith('.');
  const isAllowedCommand = isCommand && allowedCommands.some(cmd => m.text.startsWith(cmd));

  // ✅ Lista de hasta 5 bots principales
    const mainBotJIDs = [
    '5219921140671@s.whatsapp.net',
    '5491126852241@s.whatsapp.net',
    '573244008977@s.whatsapp.net',
    '5491164352241@s.whatsapp.net',
    '51946359391@s.whatsapp.net'
  ];

  const isMainBot = mainBotJIDs.includes(conn.user?.jid);

  if (isOwner || isROwner) return false;

  if (!isMainBot) {
    // Si es un subbot, no bloquea comandos no permitidos
    return false;
}

  const shouldBlockByCountry = countryCodesToBlock.some(prefix => prefix.test(numericID));

  if (isCommand &&!isAllowedCommand) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por comando no permitido en privado.`);
    return true;
}

  if (shouldBlockByCountry) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (por código de país bloqueado) ha sido bloqueado en privado.`);
    return true;
}

  return false;
}