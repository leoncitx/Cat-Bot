const handler = async (m, {conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isSuperAdmin}) => {
  if (!args[0]) return m.reply(`* 🎩 Ingrese EL Mensaje + El Prefijo\n> Ejemplo: ${usedPrefix + command} 52*`);
  if (isNaN(args[0])) return m.reply(`*🍭 Ingrese Algun Prefijo De Un Pais: ${usedPrefix + command} 52*`);
  const lol = args[0].replace(/[+]/g, '');
  const pesan = args.join` `;
  const colombia = `🎩 *Mensaje:* ${pesan}`;
  const ps = participants.map((u) => u.id).filter((v) => v !== conn.user.jid && v.startsWith(lol || lol));
  const bot = global.db.data.settings[conn.user.jid] || {};
  if (ps == '') return m.reply(`*🍭 Aqui No Hay Ningun Numero Con El Prefijo +${lol}*`);
  const numeros = ps.map((v)=> '┋💙 @' + v.replace(/@.+/, ''));
  const delay = (time) => new Promise((res)=>setTimeout(res, time));
  
  switch (command) {
    case 'hidnum': 
    case 'tagnum':
      // This sends the message and tags the users
      conn.reply(m.chat, `*☄️ MENSAJE ESPECIAL PARA +${lol} QUE ESTAN EN ESTE GRUPO:*\n` + `${colombia}\n\n` + numeros.join`\n`, m, {mentions: ps});

      // The code for hidetagnum functionality (if intended to follow the message)
      const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net';
      const users = participants.map((u) => u.id).filter((v) => v !== conn.user.jid && v.startsWith(lol || lol));
      
      for (const user of users) {
        const error = `@${user.split('@')[0]} ʏᴀ ʜᴀ sɪᴅᴏ ᴇʟɪᴍɪɴᴀᴅᴏ ᴏ ʜᴀ ᴀʙᴀɴᴅᴏɴᴀᴅᴏ ᴇʟ ɢʀᴜᴘᴏ*`;
        
        // Ensure you have the necessary permissions and the user meets the criteria before attempting removal
        if (user !== ownerGroup + '@s.whatsapp.net' && user !== global.conn.user.jid && user !== global.owner + '@s.whatsapp.net' && user.startsWith(lol || lol) && user !== isSuperAdmin && isBotAdmin && bot.restrict) {
          
          await delay(2000);
          const responseb = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
          
          if (responseb[0].status === '404') m.reply(error, m.chat, {mentions: conn.parseMention(error)});
          await delay(10000); // 10 second delay between removals
        } else {
          // Changed from return m.reply() to m.reply() to continue the loop if possible, or just skip if the user shouldn't be removed
          m.reply('*✨️ 𝙴𝚁𝚁𝙾𝚁: No se pudo eliminar a un usuario.*');
        }
      }
      break; // This break is now at the end of the combined case block.
  }
};
handler.command = /^(hidnum|hidetagnum)$/i;
handler.group = handler.botAdmin = handler.admin = true;
handler.fail = null;
export default handler;
