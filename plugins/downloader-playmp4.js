import yts from "yt-search";
import fetch from "node-fetch";

// --- Constants ---
const LIMIT_MB = 100;
const API_KEY = "Sylphiette's"; // This should ideally be loaded from environment variables for security.

const COUNTRY_CODES = {
  '+54': { country: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires'},
  '+591': { country: 'Bolivia', timeZone: 'America/La_Paz'},
  '+56': { country: 'Chile', timeZone: 'America/Santiago'},
  '+57': { country: 'Colombia', timeZone: 'America/Bogota'},
  '+506': { country: 'Costa Rica', timeZone: 'America/Costa_Rica'},
  '+53': { country: 'Cuba', timeZone: 'America/Havana'},
  '+593': { country: 'Ecuador', timeZone: 'America/Guayaquil'},
  '+503': { country: 'El Salvador', timeZone: 'America/El_Salvador'},
  '+34': { country: 'España', timeZone: 'Europe/Madrid'},
  '+502': { country: 'Guatemala', timeZone: 'America/Guatemala'},
  '+504': { country: 'Honduras', timeZone: 'America/Tegucigalpa'},
  '+52': { country: 'México', timeZone: 'America/Mexico_City'},
  '+505': { country: 'Nicaragua', timeZone: 'America/Managua'},
  '+507': { country: 'Panamá', timeZone: 'America/Panama'},
  '+595': { country: 'Paraguay', timeZone: 'America/Asuncion'},
  '+51': { country: 'Perú', timeZone: 'America/Lima'},
  '+1': { country: 'Puerto Rico', timeZone: 'America/Puerto_Rico'},
  '+1-809': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo'},
  '+1-829': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo'},
  '+1-849': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo'},
  '+598': { country: 'Uruguay', timeZone: 'America/Montevideo'},
  '+58': { country: 'Venezuela', timeZone: 'America/Caracas'}
};

// --- Utility Functions ---

/**
 * Determines the appropriate greeting based on the hour.
 * @param {number} hour - The current hour (0-23).
 * @returns {string} The greeting string.
 */
const getGreeting = (hour) => {
  if (hour < 12) return 'Buenos días 🌅';
  if (hour < 18) return 'Buenas tardes 🌄';
  return 'Buenas noches 🌃';
};

/**
 * Generates a personalized greeting for a user based on their phone number's country code.
 * @param {string} userNumber - The user's full phone number (e.g., "+584123456789@s.whatsapp.net").
 * @returns {string} The personalized greeting.
 */
const getUserGreeting = (userNumber) => {
  const phoneCodeMatch = userNumber.match(/\+(\d+)/);
  const phoneCode = phoneCodeMatch ? `+${phoneCodeMatch[1].split('-')[0]}` : null;
  const countryInfo = phoneCode ? COUNTRY_CODES[phoneCode] : null;
  const now = new Date();
  const username = userNumber.split('@')[0];

  if (countryInfo) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: countryInfo.timeZone,
        hour: 'numeric',
        hour12: false
      });
      const hour = parseInt(formatter.format(now));
      return `${getGreeting(hour)} @${username}, (${countryInfo.country})`;
    } catch (e) {
      console.error(`Error getting local time for ${userNumber}:`, e.message);
      // Fallback to local server time if timezone conversion fails
      return `${getGreeting(now.getHours())} @${username}, (${countryInfo.country})`;
    }
  }
  return `${getGreeting(now.getHours())} @${username}`;
};

/**
 * Fetches YouTube video information based on a query.
 * @param {string} query - The search query or YouTube URL.
 * @returns {Promise<object|null>} The first video result object or null if not found/error.
 */
const fetchVideoInfo = async (query) => {
  try {
    const res = await yts(query);
    return res?.all?.[0] || null;
  } catch (error) {
    console.error("Error fetching video info from yt-search:", error);
    return null;
  }
};

/**
 * Constructs download URLs for audio and video using the Sylphy API.
 * @param {string} youtubeUrl - The URL of the YouTube video.
 * @returns {object} An object containing audio and video download URLs.
 */
const getDownloadLinks = (youtubeUrl) => ({
  audio: `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(youtubeUrl)}&apikey=${API_KEY}`,
  video: `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(youtubeUrl)}&apikey=${API_KEY}`,
});

/**
 * Fetches data from a given URL and returns the JSON response.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<object>} The JSON response data.
 * @throws {Error} If the network request fails or the response is not OK.
 */
const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * Calculates the size of a file from its URL in MB.
 * @param {string} url - The URL of the file.
 * @returns {Promise<number>} The file size in MB, or 0 if content-length is not available.
 */
const getFileSizeInMB = async (url) => {
  try {
    const head = await fetch(url, { method: "HEAD" });
    const contentLength = head.headers.get("content-length");
    return contentLength ? parseInt(contentLength, 10) / (1024 * 1024) : 0;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};

// --- Command Handler ---

/**
 * Main handler function for YouTube download commands.
 * @param {object} m - The message object.
 * @param {object} options - An object containing conn, text, and command.
 */
const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply("✨ Ingresa el nombre de un video o una URL de YouTube.");
  }

  await m.react("🔎");

  const saludo = getUserGreeting(m.sender);
  const intro = `${saludo}, ¿cómo estás? 🎧 Tu pedido será procesado...`;
  await conn.sendMessage(m.chat, { text: intro, mentions: [m.sender] }, { quoted: m });

  const video = await fetchVideoInfo(text);
  if (!video) {
    return m.reply("🚫 No encontré ningún resultado.");
  }

  const caption = `
┌─「🎬 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗥𝗲𝘀𝘂𝗹𝘁𝗮𝗱𝗼」─┐
📌 *Título:* ${video.title}
👤 *Autor:* ${video.author.name}
⏰ *Duración:* ${video.duration.timestamp}
👁️‍🗨️ *Vistas:* ${video.views.toLocaleString()}
🔗 *Enlace:* ${video.url}
└────────────────────────┘
`;

  try {
    const thumbnailBuffer = await (await fetch(video.thumbnail)).buffer();
    await conn.sendFile(m.chat, thumbnailBuffer, "thumb.jpg", caption, m);
  } catch (e) {
    console.error("Error sending thumbnail:", e);
    await m.reply(caption); // Send caption without thumbnail on error
  }

  const { audio, video: videoLink } = getDownloadLinks(video.url);

  try {
    if (command === "play") {
      const audioData = await fetchData(audio);
      if (!audioData.status || !audioData.res?.downloadURL) {
        return m.reply("😢 No pude obtener el audio o el enlace de descarga.");
      }
      await conn.sendFile(m.chat, audioData.res.downloadURL, `${audioData.res.title}.mp3`, "", m);
    } else if (["play2", "playvid"].includes(command)) {
      const videoData = await fetchData(videoLink);
      if (!videoData.status || !videoData.res?.url) {
        return m.reply("😢 No pude obtener el video o el enlace de descarga.");
      }

      const sizeMB = await getFileSizeInMB(videoData.res.url);
      const asDoc = sizeMB >= LIMIT_MB;

      await conn.sendFile(m.chat, videoData.res.url, `${videoData.res.title}.mp4`, "", m, null, {
        asDocument: asDoc,
        mimetype: "video/mp4",
      });
    }
    await m.react("✅");
  } catch (err) {
    console.error("Error during download process:", err);
    m.reply("💥 Ocurrió un error al procesar tu solicitud: " + err.message);
  }
};

// --- Handler Metadata ---
handler.help = ["play", "play2", "playvid"];
handler.tags = ["download"];
handler.command = ["play", "play2", "playvid"];

export default handler;
