
import axios from 'axios';

const handler = async (m, { conn, isAdmin, isOwner, participants, args}) => {
  if (!(isAdmin || isOwner)) {
    throw '⚠️ Solo admins pueden usar este comando.';
}

  const userToKick = m.mentionedJid?.[0] || args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  if (!userToKick ||!participants.map(p => p.id).includes(userToKick)) {
    return m.reply('🚫 Menciona al usuario que deseas eliminar o proporciona su número válido.');
}

  // Descarga el sticker para usar como ícono de notificación
  const stickerUrl = 'https://n.uguu.se/OTTBjcpJ.webp';
  const stickerRes = await axios.get(stickerUrl, { responseType: 'arraybuffer'});

  await conn.sendMessage(m.chat, {
    sticker: stickerRes.data
}, { quoted: m});

  await conn.groupParticipantsUpdate(m.chat, [userToKick], 'remove');
};

handler.help = ['kick @usuario'];
handler.tags = ['group'];
handler.command = /^kick$/i;
handler.admin = true;
handler.group = true;

export default handler;