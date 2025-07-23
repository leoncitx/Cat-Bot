import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const chatId = m.chat;
  const sender = m.sender.replace(/[^0-9]/g, '');
  const isFromMe = m.fromMe;
  const isOwner = global.owner.some(([id]) => id === sender);
  if (!isOwner && !isFromMe) {
    await conn.sendMessage(chatId, { react: { text: '🔴', key: m.key } });
    return await conn.reply(m.chat, `╭─⬣「 𓆩❌𓆪 • sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀 」
│ Solo el *propietario* o el *bot* puede usar este comando.
╰────────────⬣`, m);
  }

  if (!args[0]) {
    await conn.sendMessage(chatId, { react: { text: '📀', key: m.key } });
    return await conn.reply(m.chat, `╭─⬣「 𓆩🧩𓆪 • 𝗥𝗲𝘀𝘁𝗿𝗶𝗻𝗴𝗶𝗿 𝗖𝗼𝗺𝗮𝗻𝗱𝗼 」
│ Usa: *.${command} [comando]* para restringir.
╰────────────⬣`, m);
  }

  const filePath = path.resolve('./re.json');
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  const data = JSON.parse(fs.readFileSync(filePath));
  const cmd = args[0].toLowerCase();

  if (!data[chatId]) data[chatId] = [];
  if (data[chatId].includes(cmd)) {
    await conn.sendMessage(chatId, { react: { text: '🔴', key: m.key } });
    return await conn.reply(m.chat, `╭─⬣「 𓆩⚠️𓆪 • sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀 」
│ El comando *${cmd}* ya está restringido aquí.
╰────────────⬣`, m);
  }

  data[chatId].push(cmd);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  await conn.sendMessage(chatId, { react: { text: '🟢', key: m.key } });
  return await conn.reply(m.chat, `╭─⬣「 𓆩🔒𓆪 • 𝗖𝗼𝗺𝗮𝗻𝗱𝗼 𝗥𝗲𝘀𝘁𝗿𝗶𝗻𝗴𝗶𝗱𝗼 」
│ El comando *${cmd}* ha sido restringido con éxito.
│ ⌦ 𝘀ᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀
╰────────────⬣`, m);
};

handler.command = ['re'];
handler.tags = ['owner'];
handler.help = ['re <comando>'];
handler.group = true;

export default handler;