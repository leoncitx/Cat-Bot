let handler = async (m, { conn, groupMetadata}) => {
    let bot = global.db.data.settings[conn.user.jid] || {};
    if (!bot.restrict) return m.reply(`⚠️ Solo el propietario puede usar este comando.`);
    if (!m.isGroup) return m.reply(`⚠️ Este comando solo se puede usar en grupos.`);

    const botCreatorNumber = '584246582666';

    const isAdminOrCreator = (participant) => {
        return participant.admin === 'admin' || participant.admin === 'superadmin' || participant.id === groupMetadata.owner || participant.id === botCreatorNumber;
};

    let psmap = groupMetadata.participants
.filter(v => v.id!== conn.user.jid &&!isAdminOrCreator(v))
.map(v => v.id);

    if (psmap.length === 0) return m.reply(`⚠️ No hay usuarios elegibles para ser eliminados.`);

    // Elegir hasta 50 usuarios al azar
    let shuffled = psmap.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 50); // Ajusta este número si quieres cambiar la cantidad

    if (selected.length === 0) return m.reply(`⚠️ No se encontraron suficientes usuarios para eliminar.`);

    for (let user of selected) {
        let format = a => '@' + a.split('@')[0];
        await conn.sendMessage(m.chat, {
            text: `*${format(user)} ☠️ La ruleta ha hablado, adiós...*`,
            mentions:[user]
           });

 // Esperar 2 segundos antes de eliminar al usuario
    await delay(2000);
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
};

handler.command = /^(ruletaban)$/i;
handler.group = true;
handler.tags = ['game'];
handler.admin = true;
handler.botAdmin = true;

export default handler;

const delay = time => new Promise(res => setTimeout(res, time));
             