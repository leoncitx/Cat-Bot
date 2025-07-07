let handler = async (m, { conn, groupMetadata}) => {
    let bot = global.db.data.settings[conn.user.jid] || {};
    if (!bot.restrict) return m.reply(`⚠️ Solo el propietario puede usar este comando.`);
    if (!m.isGroup) return m.reply(`⚠️ Este comando solo funciona en grupos.`);

    const botCreatorNumber = '584246582666'; // Número del creador del bot

    // Verifica si un usuario es admin, superadmin o el creador
    const isAdminOrCreator = (participant) => {
        return participant.admin === 'admin' ||
               participant.admin === 'superadmin' ||
               participant.id === groupMetadata.owner ||
               participant.id === botCreatorNumber;
};

    // Filtra usuarios elegibles (excluyendo al bot y admins)
    let elegibles = groupMetadata.participants
.filter(v => v.id!== conn.user.jid &&!isAdminOrCreator(v))
.map(v => v.id);

    if (elegibles.length === 0) return m.reply(`⚠️ No hay usuarios elegibles para expulsar.`);

    // Mezclar y agrupar de 50 en 50
    let shuffled = elegibles.sort(() => 0.5 - Math.random());
    let eliminaciones = [];

    while (shuffled.length> 0) {
        eliminaciones.push(shuffled.splice(0, 50));
}

    let format = id => '@' + id.split('@')[0];

    for (let grupo of eliminaciones) {
        let texto = grupo.map(u => `☠️ ${format(u)} fue condenado por la ruleta de la muerte`).join('\n');
        await conn.sendMessage(m.chat, {
            text: `*La ruleta de la muerte ejecuta su juicio...*\n${texto}`,
            mentions: grupo
});

        await delay(2000);
        await conn.groupParticipantsUpdate(m.chat, grupo, 'remove');
}
};

handler.command = /^(ruletamortal|ruletadeath)$/i;
handler.group = true;
handler.tags = ['game'];
handler.admin = true;
handler.botAdmin = true;

export default handler;

const delay = ms => new Promise(res => setTimeout(res, ms));