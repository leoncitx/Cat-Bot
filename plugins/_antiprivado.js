export async function before(m, { conn, isOwner, isROwner }) {
  const blockingEnabled = true;
  if (!blockingEnabled) {
    return false;
  }

  const mainBotJIDs = [
    '5219921140671@s.whatsapp.net',
    '5491126852241@s.whatsapp.net',
    '573244008977@s.whatsapp.net',
    '5491164352241@s.whatsapp.net',
    '51946359391@s.whatsapp.net',
  ];

  const countryCodesToBlock = [
    /^212/, /^213/, /^216/, /^218/,
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

  const allowedCommands = ['.serbot', '.code'];

  if (m.isBaileys && m.fromMe) {
    return true;
  }
  if (m.isGroup || !m.message) {
    return false;
  }

  if (isOwner || isROwner) {
    return false;
  }

  const isCurrentBotMain = mainBotJIDs.includes(conn.user?.jid);
  if (!isCurrentBotMain) {
    return false;
  }

  const senderJID = m.sender;
  const numericID = senderJID.split('@')[0];

  const isCommand = m.text && m.text.startsWith('.');
  const isActualCommand = isCommand && m.text.length > 1;

  const isAllowedCommand = isActualCommand && allowedCommands.some(cmd => m.text.toLowerCase().startsWith(cmd));

  const shouldBlockByCountry = countryCodesToBlock.some(prefix => prefix.test(numericID));

  if (isActualCommand && !isAllowedCommand) {
    await conn.updateBlockStatus(senderJID, 'block');
    return true;
  }

  if (shouldBlockByCountry) {
    await conn.updateBlockStatus(senderJID, 'block');
    return true;
  }

  return false;
}
