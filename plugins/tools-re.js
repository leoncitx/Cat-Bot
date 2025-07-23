import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, args, command }) => {
  const chatId = m.chat;
  const sender = m.sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === sender);
  const isFromMe = m.fromMe;
  const filePath = './re.json';

  if (m.isGroup && fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath));
    const cmd = command.toLowerCase();
    if (data[chatId] && data[chatId].includes(cmd)) {
      await conn.sendMessage(chatId, { react: { text: '🔴', key: m.key }});
      return m.reply(`╭─⬣「 𓆩🚫𓆪 • 𝗖𝗼𝗺𝗮𝗻𝗱𝗼 𝗥𝗲𝘀𝘁𝗿𝗶𝗻𝗴𝗶𝗱𝗼 」
│ El comando *${cmd}* ha sido desactivado en este grupo.
╰────────────⬣`);
    }
  }

  if (!['re', 'unre'].includes(command)) return;

  if (!isOwner && !isFromMe) return conn.sendMessage(chatId, { text: "❌ Solo el owner o el mismo bot puede usar este comando." }, { quoted: m });
  if (!args[0]) return conn.sendMessage(chatId, { text: "⚠️ Usa: *.re comando* o *.unre comando*" }, { quoted: m });

  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  const data = JSON.parse(fs.readFileSync(filePath));
  const cmd = args[0].toLowerCase();

  if (!data[chatId]) data[chatId] = [];

  if (command === 're') {
    if (data[chatId].includes(cmd)) return conn.sendMessage(chatId, { text: `⚠️ El comando *${cmd}* ya está restringido.` }, { quoted: m });
    data[chatId].push(cmd);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    await conn.sendMessage(chatId, { react: { text: "🔒", key: m.key }});
    return conn.sendMessage(chatId, { text: `✅ El comando *${cmd}* ha sido restringido.` }, { quoted: m });
  }

  if (command === 'unre') {
    if (!data[chatId].includes(cmd)) return conn.sendMessage(chatId, { text: `⚠️ El comando *${cmd}* no está restringido.` }, { quoted: m });
    data[chatId] = data[chatId].filter(c => c !== cmd);
    if (data[chatId].length === 0) delete data[chatId];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    await conn.sendMessage(chatId, { react: { text: "🔓", key: m.key }});
    return conn.sendMessage(chatId, { text: `✅ El comando *${cmd}* ha sido liberado.` }, { quoted: m });
  }
};

handler.before = true;
handler.command = ['re', 'unre'];
handler.group = true;
export default handler;