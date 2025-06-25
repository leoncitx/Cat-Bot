/**
 * @ 🍀 Descargador de MP3 de YT (Alternativo)
 * @ 🍀 Fuente: https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
 * @ 🍀 Scrape: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3588
 */

import axios from 'axios';

// Función de ayuda para extraer el ID del video de YouTube
function extractVideoId(url) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
}

/**
 * Descarga videos de YouTube como MP3 usando múltiples fuentes de API.
 * @param {string} url - La URL del video de YouTube.
 * @returns {Promise<object>} Un objeto que contiene el enlace de descarga, título, miniatura y otros detalles.
 * @throws {Error} Si la URL no es válida o la descarga falla.
 */
export async function ytmp3(url) {
    if (!url) throw new Error('¡Por favor, proporciona una URL de YouTube!');
    const videoId = extractVideoId(url);
    const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

    // --- Intento 1: Usando la API de y2mate.com ---
    try {
        const y2mateApiUrl = `https://www.y2mate.com/mates/analyzeV2/ajax`;
        const y2matePayload = new URLSearchParams();
        y2matePayload.append('query', url);
        y2matePayload.append('vt', 'mp3'); // Solicitando formato MP3

        const y2mateRes = await axios.post(y2mateApiUrl, y2matePayload.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.y2mate.com/'
            }
        });

        const y2mateData = y2mateRes.data;

        if (y2mateData && y2mateData.status === 'success' && y2mateData.downloads && y2mateData.downloads.mp3) {
            const audioData = Object.values(y2mateData.downloads.mp3).sort((a, b) => {
                // Priorizar la calidad de audio más alta si está disponible
                const qualityA = parseFloat(a.quality.replace('kbps', '')) || 0;
                const qualityB = parseFloat(b.quality.replace('kbps', '')) || 0;
                return qualityB - qualityA;
            })[0]; // Obtener el MP3 de mayor calidad

            if (audioData && audioData.url) {
                return {
                    link: audioData.url,
                    title: y2mateData.title || 'Título Desconocido',
                    thumbnail,
                    filesize: audioData.size || 'N/A',
                    quality: audioData.quality || 'N/A',
                    success: true
                };
            }
        }
    } catch (e) {
        console.warn('Fallo con la API de y2mate:', e.message);
    }

    // --- Intento 2: Usando la API de xfetch (una herramienta de scraping más general) ---
    try {
        // Reemplaza YOUR_XFETCH_API_KEY con tu clave API real de xfetch si tienes una.
        const xfetchApiUrl = `https://api.xfarr.com/api/ytmp3?url=${encodeURIComponent(url)}&apikey=YOUR_XFETCH_API_KEY`; 
        
        // Nota: xfetch es una API de pago o con límite de velocidad. Puede que necesites registrarte para obtener una clave.
        // Si no tienes una clave API de xfetch, puedes eliminar esta sección o reemplazarla con otra API gratuita.

        const xfetchRes = await axios.get(xfetchApiUrl);
        const xfetchData = xfetchRes.data;

        if (xfetchData && xfetchData.status && xfetchData.result && xfetchData.result.url) {
            return {
                link: xfetchData.result.url,
                title: xfetchData.result.title || 'Título Desconocido',
                thumbnail: xfetchData.result.thumb || thumbnail,
                filesize: xfetchData.result.filesize || 'N/A',
                duration: xfetchData.result.duration || 'N/A',
                success: true
            };
        }
    } catch (e) {
        console.warn('Fallo con la API de xfetch:', e.message);
        // Si xfetch falla, podría ser debido a problemas con la clave API o límites de velocidad.
    }

    throw new Error('No se pudo descargar el MP3 de ninguna fuente disponible.');
}

// --- Integración con el Bot de WhatsApp (asumiendo que esta parte permanece similar) ---
let yeon = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        await conn.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        return conn.sendMessage(m.chat, {
            text: `🎧 *Senpai*, ¡por favor, introduce la URL de YouTube que quieres convertir a audio!
Ejemplo: *${usedPrefix + command}* https://www.youtube.com/watch?v=dQw4w9WgXcQ`
        });
    }

    try {
        await conn.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        const result = await ytmp3(text);

        await conn.sendMessage(m.chat, {
            audio: { url: result.link },
            fileName: (result.title || 'audio').replace(/[^\w\-\.]/g, '_') + '.mp3',
            mimetype: 'audio/mpeg',
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: result.title,
                    body: 'Duración: ' + (result.duration || 'Desconocida'),
                    thumbnailUrl: result.thumbnail,
                    sourceUrl: text,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

        await conn.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });

    } catch (e) {
        console.error('Error:', e.message);
        await conn.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        await conn.sendMessage(m.chat, {
            text: `⚠️ *¡Ups, algo salió mal, Senpai!*
Esta función está experimentando problemas, por favor, intenta de nuevo más tarde 😅`
        });
    }
};

yeon.help = ['ytmp3 <url>'];
yeon.tags = ['downloader'];
yeon.command = /^ytmp3$/i;
yeon.register = true;
yeon.limit = true;
export default yeon;
