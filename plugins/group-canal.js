
import fs from 'fs';

const canalLink = 'https://whatsapp.com/channel/0029Vaua0ZD3gvWjQaIpSy18';
const canalMensaje = `🔔 *Canal Oficial* 🔔\n\n¡Sigue nuestro canal para no perderte ninguna novedad!\n👉 ${canalLink}\n\nGracias por ser parte de nuestra comunidad. 🙌`;

const archivoRegistro = './grupos_ya_notificados.json';
let gruposYaEnviados = new Set(
  fs.existsSync(archivoRegistro)
? JSON.parse(fs.readFileSync(archivoRegistro))
: []
);

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
          console.error(`❌ Error en grupo ${chats[jid]?.subject || jid}:`, e);
          fallidos++;
}
}
}

    fs.writeFileSync(
      archivoRegistro,
      JSON.stringify([...gruposYaEnviados], null, 2)
);

    await m.reply(
      `✅ *Resumen del envío:*\n✔ Enviado correctamente en: ${enviados} grupo(s)\n❌ Falló en: ${fallidos} grupo(s)`
);
} catch (e) {
    console.error('❌ Error general en el envío:', e);
    await m.reply('❌ Hubo un problema al enviar el mensaje del canal.');
}
};

handler.command = ['canal'];
export default handler;