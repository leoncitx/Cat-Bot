
import yts from 'yt-search';
import fetch from 'node-fetch';

const searchYouTube = async (query) => {
    const search = await yts(query);
    return search.videos.length? search.videos[0]: null;
};

const downloadAudio = async (url) => {
    const response = await fetch(`https://nirkyy-dev.hf.space/api/v1/youtube-audio-v2?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return data?.audio_url || null;
};

const handler = async (m, { conn, command, text, usedPrefix}) => {
    if (!text) return m.reply(`Ejemplo: ${usedPrefix}${command} <consulta>`);

    try {
        const video = await searchYouTube(text);
        if (!video) return m.reply('No se encontraron resultados, intente cambiar su consulta.');

        const { title, thumbnail, timestamp, views, ago, url} = video;

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail},
            caption: `🎵 Descargando *${title}*\n⏳ Por favor espera...`,
}, { quoted: m});

        const audioUrl = await downloadAudio(url);
        if (!audioUrl) return m.reply("❌ No se pudo obtener el audio del video.");

        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl},
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            caption: `🎶 *${title}*\n⏱️ *Duración:* ${timestamp}\n👀 *Vistas:* ${views}\n📅 *Publicado:* ${ago}`,
}, { quoted: m});

        await m.react("✅");
} catch (error) {
        console.error('Error:', error.message);
        m.reply(`❌ Error al procesar la solicitud:\n${error.message}`);
}
};

handler.help = ['play'].map(v => v + ' <consulta>');
handler.tags = ['descargas'];
handler.command = /^(play)$/i;

export default handler;