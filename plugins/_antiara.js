import * as cheerio from "cheerio";
import { fetch } from "undici";
import { lookup } from "mime-types";

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`➤ \`ACCION MAL USADA\` ❗\n\n> 𝖠𝗀𝗋𝖾𝗀𝖺 𝖾𝗅 𝗅𝗂𝗇𝗄 𝗏𝖺𝗅𝗂𝖽𝗈 𝗉𝖺𝗋𝖺 𝖽𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝗋 𝗎𝗇 𝖺𝗋𝖼𝗁𝗂𝗏𝗈 𝗈 𝖽𝗈𝖼𝗎𝗆𝖾𝗓𝗇𝗍𝗈 𝖽𝖾 𝗆𝖾𝖽𝗂𝖺𝖿𝗂𝗋𝖾.\n\n» 𝖥𝗈𝗋𝗆𝖺𝗍𝗈 𝖼𝗈𝗋𝗋𝖾𝖼𝗍𝗈:\n#mediafire Link\n\n» 𝖤𝗃𝖾𝗆𝗉𝗅𝗈 𝖽𝖾 𝗎𝗌𝗈:\n#mediafire https://www.mediafire.com/file/`);

    await m.react('🕒');
    return new Promise(async (resolve, reject) => {
        await mediafire(text).then(async (mf) => {
            let caption = `*DESCARGA MEDIAFIRE*  
━━━━━━━━━━━━━━━━━━    
*🌳 Nombre:* ${mf.filename}  
*🌳 Tipo:* ${mf.ext.toUpperCase()}  
*🌳 Tamaño:* ${mf.size}  
*🌳 MIME:* ${mf.mimetype}  
━━━━━━━━━━━━━━━━━━`;

            conn.sendMessage(m.chat, {
                document: { url: mf.download },
                fileName: mf.filename,
                mimetype: mf.mimetype,
                caption
            }, { quoted: m });
            await m.react('✅');
            resolve();
        }).catch(async (error) => {
            await m.react('❌');
            console.error(error);
            reject({ msg: '❌ Lo siento, error al procesar tu solicitud. Quizá has hecho demasiadas peticiones.' });
        });
    });
};

handler.help = ['mediafire *`url`*'];
handler.tags = ['dl'];
handler.command = ['mf', 'mediafire', 'mfdl'];

export default handler;

async function mediafire(url) {
    return new Promise(async (resolve, reject) => {
        if (!url || typeof url !== "string" || !url.startsWith("https://www.mediafire.com/")) {
            throw new Error("URL de Mediafire inválida o faltante");
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const filename = $(".dl-btn-label").attr("title");
        if (!filename) {
            throw new Error("No se pudo extraer el nombre del archivo");
        }

        const extMatch = filename.match(/\.([^\.]+)$/);
        const ext = extMatch ? extMatch[1].toLowerCase() : "desconocida";
        const mimetype = lookup(ext) || `application/${ext}`;

        const iconClass = $(".dl-btn-cont .icon").attr("class") || "";
        const typeMatch = iconClass.match(/archive\s*(\w+)/);
        const type = typeMatch ? typeMatch[1].trim() : "desconocido";

        const sizeText = $(".download_link .input").text().trim();
        const sizeMatch = sizeText.match(/\((.*?)\)/);
        const size = sizeMatch ? sizeMatch[1] : "desconocido";

        const download = $(".input").attr("href");
        if (!download) {
            throw new Error("No se pudo extraer el enlace de descarga");
        }

        let uploadDate = "Fecha no encontrada";
        let creationTimestamp = null;
        const dataCreation = $("[data-creation]").attr("data-creation");
        if (dataCreation && !isNaN(dataCreation)) {
            creationTimestamp = parseInt(dataCreation, 10);
        } else {
            const scripts = $("script").text();
            const timestampMatch = scripts.match(/"creation":\s*(\d+)/);
            if (timestampMatch) {
                creationTimestamp = parseInt(timestampMatch[1], 10);
            }
        }

        if (creationTimestamp) {
            const date = new Date(creationTimestamp * 1000);
            if (!isNaN(date.getTime())) {
                uploadDate = date.toLocaleString("es-ES", { month: "long", day: "numeric", year: "numeric" });
            }
        } else {
            const selectors = [".file-info", ".details", ".info", ".file-details", ".upload-info"];
            let dateText = null;
            for (const selector of selectors) {
                dateText = $(selector).text().trim();
                if (dateText && /Uploaded/i.test(dateText)) break;
            }
            if (dateText) {
                const datePatterns = [/(?:Uploaded:?\s*)(\w+)\s+(\d{1,2}),?\s+(\d{4})/i,/(?:Uploaded:?\s*)(\d{1,2})\s+(\w+),?\s+(\d{4})/i];
                for (const pattern of datePatterns) {
                    const match = dateText.match(pattern);
                    if (match) {
                        let month = match[1];
                        let day = match[2];
                        let year = match[3];
                        uploadDate = `${month} ${day}, ${year}`;
                        break;
                    }
                }
            }
        }

        resolve({ filename, type, size, ext, mimetype, download, uploadDate, url });
    }).catch((error) => {
        reject({ msg: `Error al procesar el enlace de Mediafire: ${error.message}` });
    });
}