/*• Código Creado por Izumi-Core
• No quites créditos.
• MediaFire Downloader - (url)
• https://whatsapp.com/channel/0029VaJxgcB0bIdvuOwKTM2Y */
import axios from 'axios';

let handler = async (m, { conn, args, command }) => {
    if (!args[0]) {
        return conn.reply(m.chat, `➤ \`ACCION MAL USADA\` ❗\n\n> Ingresa un enlace de *Mediafire* para descargar el archivo.\n\n» Formato correcto:\n#${command} (url)\n\n» Ejemplo:\n#${command} https://www.mediafire.com/file/xxxxxx/file`, m);
    }

    try {
        await m.react('🕑');

        const apiUrl = `https://api.sylphy.xyz/download/mediafire?url=${encodeURIComponent(args[0])}&apikey=sylphy-110a`;
        const { data } = await axios.get(apiUrl);

        if (!data.status) {
            await m.react('❌');
            return conn.reply(m.chat, `➤ \`UPS, ERROR\` ❌\n\nIntente nuevamente, si persiste envíe:\n".reporte no funciona .${command}"\n> El equipo lo revisará pronto. 🚨`, m);
        }

        const { filename, filesize, mimetype, uploaded, dl_url } = data.data;

        const caption = `📥 *Mediafire Downloader*\n\n📄 *Nombre:* ${filename}\n📦 *Tamaño:* ${filesize}\n📂 *Tipo:* ${mimetype}\n📅 *Subido:* ${uploaded}`;

        await conn.sendMessage(m.chat, {
            document: { url: dl_url },
            fileName: filename,
            mimetype: mimetype || 'application/octet-stream',
            caption
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error(error);
        await m.react('❌');
        return conn.reply(m.chat, `➤ \`UPS, ERROR\` ❌\n\nIntente nuevamente, si persiste envíe:\n".reporte no funciona .${command}"\n> El equipo lo revisará pronto. 🚨`, m);
    }
};

handler.help = ['mediafire <url>'];
handler.tags = ['dl'];
handler.command = /^(mediafire|mf)$/i;

export default handler;