
import fs from 'fs';

const canalLink = 'https://whatsapp.com/channel/0029Vaua0ZD3gvWjQaIpSy18';
const canalMensaje = `🔔 *Canal Oficial* 🔔\n\n¡Sigue nuestro canal para no perderte ninguna novedad!\n👉 ${canalLink}\n\nGracias por ser parte de nuestra comunidad. 🙌`;

const archivoRegistro = './grupos_ya_notificados.json';
let gruposYaEnviados = new Set(fs.existsSync(archivoRegistro)
? JSON.parse(fs.readFileSync(archivoRegistro))
: []);

const handler = async (m, { conn}) => {
    try {
        const chats = await conn.groupFetchAllParticipating();

        let enviados = 0;
        let fallidos = 0;

        for (const jid in chats) {
            if (!gruposYaEnviados.has(jid)) {
                try {
                    await conn.sendMessage(jid, { text: canalMensaje});
                    gruposYaEnviados.add(jid);
                    enviados++;
} catch (e) {
                    console.error(`❌ Error al enviar a ${chats[jid].subject}:`, e);
                    fallidos++;
}
}
}

        fs.writeFileSync(archivoRegistro, JSON.stringify([...gruposYaEnviados], null, 2));

        await m.reply(`✅ *Resumen del envío:*\n✔ Mensaje enviado en ${enviados} grupos.\n❌ Falló en ${fallidos} grupos.`);
} catch (e) {
        console.error('Error al procesar el envío:', e);
        await m.reply('❌ Ocurrió un error al intentar enviar el mensaje.');
}
};

handler.command = /^\canal$/i;
export default handler;