let handler = async (m, { conn, groupMetadata }) => {
    // Comprobar si el bot tiene restricciones habilitadas
    let bot = global.db.data.settings[conn.user.jid] || {};
    if (!bot.restrict) {
        return m.reply(`⚠️ Este comando solo puede ser utilizado por el propietario.`);
    }

    // Comprobar si el comando se usa en un grupo
    if (!m.isGroup) {
        return m.reply(`⚠️ Este comando solo puede ser utilizado en grupos.`);
    }

    // Número de teléfono del creador del bot (reemplazar con el número real si es diferente)
    const botCreatorNumber = '584246582666'; 

    // Función para comprobar si un participante es administrador, superadministrador, propietario del grupo o el creador del bot
    const isAdminOrCreator = (participant) => {
        return participant.admin === 'admin' || participant.admin === 'superadmin' || participant.id === groupMetadata.owner || participant.id.includes(botCreatorNumber);
    };

    // Filtrar participantes: excluir el bot mismo, administradores, superadministradores, el propietario del grupo y el creador del bot
    let candidates = groupMetadata.participants
        .filter(v => v.id !== conn.user.jid && !isAdminOrCreator(v))
        .map(v => v.id);

    // Comprobar si hay candidatos elegibles para la eliminación
    if (candidates.length === 0) {
        return m.reply(`⚠️ No se encontraron candidatos para la ruleta, o todos son administradores/moderadores/creador del bot.`);
    }

    // Determinar cuántos usuarios eliminar (máximo 10, o menos si no hay suficientes candidatos)
    const numToRemove = Math.min(10, candidates.length);

    // Seleccionar usuarios aleatorios para eliminar
    const usersToRemove = [];
    for (let i = 0; i < numToRemove; i++) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        usersToRemove.push(candidates[randomIndex]);
        candidates.splice(randomIndex, 1); // Eliminar el usuario seleccionado de la lista para evitar duplicados
    }

    // Formatear menciones para el mensaje
    let format = a => '@' + a.split('@')[0];

    // Notificar a los usuarios elegidos y proceder con su eliminación
    const mentionsText = usersToRemove.map(user => `*${format(user)}*`).join(', ');
    await conn.sendMessage(m.chat, {
        text: `*☠️ Los siguientes usuarios han sido elegidos por la ruleta de la muerte: ${mentionsText}*`,
        mentions: usersToRemove
    });

    // Esperar 2 segundos antes de eliminar a los usuarios
    await delay(2000);
    await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
};

handler.command = /^(ruletaban)$/i; // Comando para activar la función
handler.group = true; // El comando solo puede ser usado en grupos
handler.tags = ['game']; // Categorizar el comando

export default handler;

// Función de retardo simple
const delay = time => new Promise(res => setTimeout(res, time));
