let handler = async (m, { conn, usedPrefix, command, text}) => {
    let number;

    if (text) {
        if (text.includes('@')) {
            number = text.split('@')[1];
        } else {
            number = text;
        }
    } else if (m.quoted) {
        number = m.quoted.sender.split('@')[0];
    } else if (m.mentionedJid && m.mentionedJid[0]) {
        number = m.mentionedJid[0].split('@')[0];
    }

    if (!number) {
        return conn.reply(m.chat, `🌀 Ejemplo de uso :\n *${usedPrefix + command}* @tag o *${usedPrefix + command}* número`, m);
    }

    if (number.length < 9 || number.length > 15) {
        return conn.reply(m.chat, `🌀 Número inválido. Asegúrate de que el número tenga entre 9 y 15 dígitos.`, m);
    }

    let user = number + '@s.whatsapp.net';

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
        m.reply(`✅ Usuario promovido con éxito: ${number}.`);
    } catch (e) {
        console.error(e);
        m.reply(`❌ No se pudo promover al usuario. Asegúrate de que el número sea válido y de tener los permisos de administrador del grupo y del bot.`);
    }
};

handler.help = ['promote'];
handler.tags = ['group'];
handler.command = ['promote', 'promover'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.fail = null;

export default handler;
