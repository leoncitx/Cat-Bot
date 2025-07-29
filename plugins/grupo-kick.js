
import axios from 'axios';

const handler = async (m, { conn, isAdmin, isOwner, participants, args}) => {
  if (!(isAdmin || isOwner)) {
    throw '⚠️ Este comando solo puede ser usado por administradores.';
}

  const mentionedUser = m.mentionedJid?.[0];
  const repliedUser = m.quoted?.sender;
  const numberInput = args[0]?.replace(/[^0-9]/g, '');
  const userToKick = mentionedUser || repliedUser || (numberInput? numberInput + '@s.whatsapp.net': null);

  if (!userToKick ||!participants.map(p => p.id).includes(userToKick)) {
    return m.reply('❌ Debes mencionar, responder o escribir el número del usuario que deseas eliminar.');
}

  // Enviar sticker como advertencia visual
  const stickerUrl = 'https://n.uguu.se/OTTBjcpJ.webp';
  const stickerData = (await axios.get(stickerUrl, { responseType: 'arraybuffer'})).data;

  await conn.sendMessage(m.chat, {
    sticker: stickerData
}, { quoted: m});

  // Ejecutar expulsión
  await conn.groupParticipantsUpdate(m.chat, [userToKick], 'remove');
};

handler.help = ['kick @usuario'];
handler.tags = ['group'];
handler.command = /^kick$/i;
handler.admin = true;
handler.group = true;

export default handler;