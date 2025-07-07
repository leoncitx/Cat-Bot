
let handler = async (m, { conn, groupMetadata}) => {
    let bot = global.db.data.settings[conn.user.jid] || {};
    if (!bot.restrict) return m.reply(`⚠️ Solo el propietario puede usar este comando.`);
    if (!m.isGroup) return m.reply(`⚠️ Este comando solo funciona en grupos.`);

    const botCreatorNumber = '584246582666';

    const isAdminOrCreator = (participant) => {
        return participant.admin === 'admin' ||
               participant.admin === 'superadmin' ||
               participant.id === groupMetadata.owner ||
               participant.id === botCreatorNumber;
};

    // Filtrar usuarios elegibles (no bot, no admins, no creador)
    let elegibles = groupMetadata.participants
.filter(v => v.id!== conn.user.jid &&!isAdminOrCreator(v))
.map(v => v.id);

    if (elegibles.length === 0) return m.reply(`⚠️ No hay usuarios elegibles para expulsar.`);

    // Elegir solo uno al azar
    let elegido = elegibles[Math.floor(Math.random() * elegibles.length)];
    let formato = id => '@' + id.split('@')[0];

    await conn.sendMessage(m.chat, {
        text: `☠️ *${formato(elegido)} ha sido seleccionado por la ruleta de la muerte...*`,
        mentions: [elegido]
});

    await delay(2000);
    await conn.groupParticipantsUpdate(m.chat, [elegido], 'remove');
};

handler.command = /^(ruletamortal|ruletadeath)$/i;
handler.group = true;
handler.tags = ['game'];
handler.admin = true;
handler.botAdmin = true;

export default handler;

const delay = ms => new Promise(res => setTimeout(res, ms));