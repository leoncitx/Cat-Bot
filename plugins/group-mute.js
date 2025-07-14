let mutedUsers = new Set();

let handler = async (m, { conn, usedPrefix, command, isAdmin, isBotAdmin }) => {
    if (!isBotAdmin) {
        return conn.reply(m.chat, '⭐ El bot necesita ser **administrador** para usar este comando y poder borrar mensajes.', m);
    }
    
    if (!isAdmin) {
        return conn.reply(m.chat, '⭐ Solo los **administradores** del grupo pueden usar este comando.', m);
    }

    let user;
    if (m.quoted) {
        user = m.quoted.sender;
    } else {
        return conn.reply(m.chat, '⭐ Responde al mensaje del usuario que quieres mutear o desmutear.', m);
    }

    if (user === conn.user.jid) {
        return conn.reply(m.chat, '⭐ No puedes mutear o desmutear al bot.', m);
    }

    if (command === "mute") {
        if (mutedUsers.has(user)) {
            return conn.reply(m.chat, `⭐ El usuario @${user.split('@')[0]} ya está muteado.`, m, { mentions: [user] });
        }
        mutedUsers.add(user);
        conn.reply(m.chat, `✅ *Usuario muteado:* @${user.split('@')[0]} no podrá enviar mensajes.`, m, { mentions: [user] });
    } 
    else if (command === "unmute") {
        if (!mutedUsers.has(user)) {
            return conn.reply(m.chat, `⭐ El usuario @${user.split('@')[0]} no está muteado.`, m, { mentions: [user] });
        }
        mutedUsers.delete(user);
        conn.reply(m.chat, `✅ *Usuario desmuteado:* @${user.split('@')[0]} ahora puede enviar mensajes.`, m, { mentions: [user] });
    }
};

handler.before = async (m, { conn }) => {
    if (mutedUsers.has(m.sender) && m.mtype !== 'stickerMessage') {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
        } catch (e) {
            console.error('Error al intentar borrar el mensaje de un usuario muteado:', e);
        }
    }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i; 
handler.group = true; 

export default handler;
