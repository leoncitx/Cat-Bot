export async function before(m, { conn, isOwner, isROwner}) {
  // Para que el bloqueo funcione, esta línea debe ser 'true'.
  const blockingEnabled = true;

  if (!blockingEnabled) {
    return false;
  }

  // Ignora mensajes del propio bot o de grupos.
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup || !m.message) return false;

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

  const mainBotJIDs = [
    '5219921140671@s.whatsapp.net',
    '5491126852241@s.whatsapp.net',
    '573244008977@s.whatsapp.net',
    '5491164352241@s.whatsapp.net',
    '51946359391@s.whatsapp.net'
  ];

  const isMainBot = mainBotJIDs.includes(conn.user?.jid);

  // Los dueños del bot nunca serán bloqueados.
  if (isOwner || isROwner) return false;

  // Solo los bots principales aplicarán esta lógica de bloqueo.
  if (!isMainBot) {
    return false;
  }

  const shouldBlockByCountry = countryCodesToBlock.some(prefix => prefix.test(numericID));

  // Bloquea si es un comando y NO es uno de los comandos permitidos.
  if (isCommand && !isAllowedCommand) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por comando no permitido en privado.`);
    return true; // Importante: retorna true para que el bot no procese el mensaje.
  }

  // Bloquea si el código de país está en la lista de bloqueo.
  if (shouldBlockByCountry) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (por código de país bloqueado) ha sido bloqueado en privado.`);
    return true; // Importante: retorna true para que el bot no procese el mensaje.
  }

  return false; // Permite que el mensaje sea procesado si no se cumplen las condiciones de bloqueo.
}
