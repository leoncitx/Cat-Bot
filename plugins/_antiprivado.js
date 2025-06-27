export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true; // Ignorar mensajes de Baileys enviados por el propio bot
  if (m.isGroup) return false; // No aplicar en grupos
  if (!m.message) return true; // Ignorar mensajes sin contenido

  const senderJID = m.sender;
  const numericID = senderJID.split('@')[0];

  const countryCodesToBlock = [
    /^212/, 
    /^213/, 
    /^216/, 
    /^218/, 
    /^20/,  
    /^57/,  
    /^1/,   
    /^27/,  
    /^505/, 
    /^595/, 
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

  const shouldBlockByCountry = countryCodesToBlock.some(prefix => prefix.test(numericID));

  const allowedCommands = ['.serbot', '.code'];

  // Verifica si el mensaje comienza con un prefijo de comando (ej: ".")
  const isCommand = m.text && m.text.startsWith('.'); 
  
  // Verifica si el comando es uno de los permitidos
  const isAllowedCommand = isCommand && allowedCommands.some(cmd => m.text.startsWith(cmd));

  // Si es el propietario o el propietario del bot, no bloquear
  if (isOwner || isROwner) {
    return false; 
  }

  // --- Lógica de bloqueo ---

  // Si el usuario envía un comando, pero no es un comando permitido
  if (isCommand && !isAllowedCommand) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por usar comando no permitido en privado.`);
    return true; // Bloquear y detener el procesamiento
  }

  // Si el usuario envía un comando permitido, no bloquear
  if (isAllowedCommand) {
    return false; 
  }

  // Si el usuario no envía un comando (está chateando), no bloquear
  if (!isCommand) {
    return false;
  }

  // Si el usuario tiene un código de país bloqueado y no es un comando permitido (o no es un comando), bloquear
  if (shouldBlockByCountry) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (código de país bloqueado) ha sido bloqueado en privado.`);
    return true; 
  }

  return false; // Por defecto, no bloquear
}
