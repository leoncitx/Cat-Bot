let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo se puede usar en grupos.');
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  const url = (args[0] || '').trim();

  if (!url || !url.startsWith('http') || !url.match(/\.(jpg|jpeg|png)$/i)) {
    return m.reply(`📌 Usa el comando de esta forma:\n\n${usedPrefix + command} https://example.com/banner.jpg`);
  }

  global.db.data.chats[m.chat].banner = url;
  m.reply(`✅ *Banner actualizado correctamente.*\n\n🖼️ Ahora esta imagen será usada en el menú y otros módulos del grupo.`);
};

handler.command = [ 'setbanner']
handler.group = true;
handler.admin = true;
handler.botAdmin = false;

export default handler;