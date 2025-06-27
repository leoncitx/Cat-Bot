export async function before(m, { conn, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;

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

  const isAllowedCommand = allowedCommands.some(cmd => m.text && m.text.startsWith(cmd));

  if (isOwner || isROwner) {
    return false; 
  }

  if (isAllowedCommand) {
    return false; 
  }

  if (shouldBlockByCountry) {
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} (código de país bloqueado) ha sido bloqueado en privado.`);
    return true; 
  }

  if (!isAllowedCommand) { 
    await conn.updateBlockStatus(senderJID, 'block');
    console.log(`🛑 Usuario ${senderJID} bloqueado por usar comando no permitido en privado.`);
    return true; 
  }

  return false;
}
