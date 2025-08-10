import axios from 'axios';

let handler = async (m, { conn, args}) => {
    if (!args[0]) {
        return conn.sendMessage(m.chat, { text: '🎧 Ingresa el enlace de YouTube que deseas convertir a MP3.'}, { quoted: m});
}

    if (!args[0].match(/youtube\.com|youtu\.be/gi)) {
        return conn.sendMessage(m.chat, { text: '⚠️ Asegúrate de que el enlace sea válido de *YouTube*.'}, { quoted: m});
}

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key}});

    try {
        const res = await axios.get('https://api.sylphy.xyz/download/ytmp3', {
            params: { url: args[0]},
            headers: { Authorization: 'sylphy-110a'}
});

        const { title, audio, thumbnail} = res.data;

        const audioBuffer = await axios.get(audio, { responseType: 'arraybuffer'});

        await conn.sendMessage(m.chat, {
            audio: audioBuffer.data,
            mimetype: 'audio/mp4',
            ptt: false,
            fileName: `${title}.mp3`,
            caption: `🎶 *${title}*`
}, { quoted: m});

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key}});

} catch (err) {
        console.error(err);
        await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al procesar tu solicitud.'}, { quoted: m});
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key}});
}
};

handler.help = ['play <url>'];
handler.tags = ['downloader'];
handler.command = ['play10'];
handler.register = false;

export default handler;