const fs = require("fs").promises; // Usamos promesas para I/O asíncrono
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// -----------------------------------------------------------
// Funciones auxiliares para gestión de datos
// -----------------------------------------------------------

/**
 * Lee el archivo de configuración setmenu.json.
 * @returns {Promise<object>} El objeto de datos del menú.
 */
const readMenuData = async () => {
    const filePath = path.resolve("setmenu.json");
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe o está vacío, devuelve un objeto vacío.
        if (error.code === 'ENOENT' || error.name === 'SyntaxError') {
            return {};
        }
        throw error;
    }
};

/**
 * Guarda los datos actualizados en setmenu.json.
 * @param {object} data El objeto de datos a guardar.
 */
const writeMenuData = async (data) => {
    const filePath = path.resolve("setmenu.json");
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// -----------------------------------------------------------
// Handler principal del comando setmenu
// -----------------------------------------------------------

const handler = async (msg, { conn, text }) => {
    const chatJid = msg.key.remoteJid;

    try {
        // 1. Verificación de permisos y origen del mensaje
        // Para que solo el bot pueda usar el comando para su propio número.
        if (!msg.key.fromMe) {
            return await conn.sendMessage(chatJid, {
                text: "❌ Este comando solo puede ser ejecutado por el *subbot*."
            }, { quoted: msg });
        }

        // 2. Extracción de información del mensaje citado
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = quotedMsg?.imageMessage;

        // 3. Verificación de la entrada (Imagen citada y texto proporcionado)
        if (!imageMsg || !text) {
            return await conn.sendMessage(chatJid, {
                text: `📌 *Uso correcto del comando:*\n\nResponde a una *imagen* con el comando *!setmenu* seguido del nombre del bot.\n\nEjemplo:\n*!setmenu MiBotNombre*`
            }, { quoted: msg });
        }

        // 4. Descarga de la imagen citada
        const stream = await downloadContentFromMessage(imageMsg, "image");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        const base64Image = buffer.toString("base64");

        // 5. Preparación de los datos y guardado
        // Usamos el JID del bot como clave única.
        const botId = conn.user.id.split(":")[0] + "@s.whatsapp.net";
        
        const menuData = await readMenuData();
        menuData[botId] = {
            nombre: text,
            imagen: base64Image
        };

        await writeMenuData(menuData);

        // 6. Confirmación de éxito
        await conn.sendMessage(chatJid, {
            text: `✅ Menú personalizado guardado:\n*Nombre:* ${text}\n*Imagen:* Aplicada correctamente.`
        }, { quoted: msg });

        await conn.sendMessage(chatJid, {
            react: { text: "✅", key: msg.key }
        });

    } catch (e) {
        console.error("❌ Error en setmenu:", e);
        await conn.sendMessage(chatJid, {
            text: "❌ Ocurrió un error al procesar la solicitud para guardar el menú personalizado."
        }, { quoted: msg });
    }
};

handler.command = ["setmenu"];
module.exports = handler;
