
import { createHash} from 'crypto';

let handler = async (m, { conn, text, usedPrefix, command}) => {
    let channelID = '120363414007802886@newsletter'; // ID del canal donde se enviará la notificación
    let imageUrl = 'https://qu.ax/iVZTn.jpg'; // Imagen proporcionada
    let regFormat = /^([^\s]+)\.(\d+)$/i;

    if (!regFormat.test(text)) {
        return m.reply(`❌ Formato incorrecto.\n\nUsa el comando así: *${usedPrefix + command} nombre.edad*\nEjemplo: *${usedPrefix + command} Barboza.18*`);
}

    let [_, name, age] = text.match(regFormat);
    age = parseInt(age);

    if (name.length> 50) return m.reply('❌ El nombre no puede exceder los 50 caracteres.');
    if (isNaN(age) || age < 5 || age> 100) return m.reply('❌ La edad ingresada no es válida.');

    let userHash = createHash('md5').update(m.sender).digest('hex');

    let confirmMessage = `🎉 *¡Registro exitoso!*\n\n📂 Información registrada:\n👤 *Usuario:* ${name}\n🎂 *Edad:* ${age} años\n🆔 *Código de Registro:* ${userHash}`;

    await conn.sendMessage(m.chat, {
        text: confirmMessage,
        contextInfo: {
            externalAdReply: {
                title: '✅ Registro completado',
                body: 'Gracias por registrarte.',
                thumbnailUrl: imageUrl,
                mediaType: 1,
                renderLargerThumbnail: true
}
}
});

    let notificationMessage = `📥 *Nuevo usuario registrado:*\n\n👤 *Nombre:* ${name}\n🎂 *Edad:* ${age} años\n🆔 *Código de Registro:* ${userHash}`;

    await conn.sendMessage(channelID, {
        text: notificationMessage,
        contextInfo: {
            externalAdReply: {
                title: '🔔 Nuevo registro',
                body: `Usuario ${name} ha sido registrado con éxito.`,
                thumbnailUrl: imageUrl,
                mediaType: 1,
                renderLargerThumbnail: true
}
}
});
};

handler.help = ['registrar <nombre.edad>'];
handler.tags = ['registro'];
handler.command = ['registrar', 'register', 'verificar', 'reg'];

export default handler;