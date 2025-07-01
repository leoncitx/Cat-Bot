const {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} = await import("@whiskeysockets/baileys");
import qrcode from "qrcode";
import nodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from "pino";
import util from "util";
import * as ws from "ws";
const { CONNECTING } = ws;
import { makeWASocket } from "../lib/simple.js";

let rtx = "*Convertirse en sub bot✨ / JadiBot*\n\n*ðŸŒ¼ Utilice otro celular para escanear este codigo QR o escanea el codigo mediante una PC para convertirte en Sub Bot*\n\n`1` Â» Haga clic en los tres puntos en la esquina superior derecha\n\n`2` Â» Toca dispositivos vinculados\n\n`3` Â» Escanee este codigo QR para iniciar sesiÃ³n\n\nðŸŒ¼ *Este cÃ³digo QR expira en 45 segundos*";
let rtx2 = "*Convertirse en sub bot✨ / JadiBot*\n\n*ðŸŒ¼ Usa este CÃ³digo para convertirte en un Sub Bot*\n\n`1` Â» Haga clic en los tres puntos en la esquina superior derecha\n\n`2` Â» Toca dispositivos vinculados\n\n`3` Â» Selecciona Vincular con el nÃºmero de telÃ©fono\n\n`4` Â» Escriba el CÃ³digo\n\nðŸŒ¼ *Este cÃ³digo solo funciona en en el nÃºmero que lo solicitÃ³*";

if (!(global.conns instanceof Array)) global.conns = [];

const MAX_SUBBOTS = 9999;

async function loadSubbots() {
  const serbotFolders = fs.readdirSync('./' + jadi);
  let totalConnected = 0;

  for (const folder of serbotFolders) {
    if (global.conns.length >= MAX_SUBBOTS) {
      console.log(`Límite de ${MAX_SUBBOTS} subbots alcanzado.`);
      break;
    }

    const folderPath = `./${jadi}/${folder}`;
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const { state, saveCreds } = await useMultiFileAuthState(folderPath);
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
      version,
      keepAliveIntervalMs: 30000,
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }),
      auth: state,
      browser: [`Dylux`, "IOS", "4.1.0"],
    };

    let conn = makeWASocket(connectionOptions);
    conn.isInit = false;
    let reconnectAttempts = 0;

    const connectionUpdate = async (update) => {
      const { connection, lastDisconnect } = update;
      const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

      if (connection === "open") {
        conn.isInit = true;
        if (!global.conns.includes(conn)) {
          global.conns.push(conn);
        }
        totalConnected++;
        reconnectAttempts = 0;
      } else if (connection === 'close') {
        reconnectAttempts++;
        if (statusCode === DisconnectReason.loggedOut || reconnectAttempts >= 3) {
          console.log(`Subbot "${folder}" cerró sesión o falló tras 3 intentos. Eliminando carpeta.`);
          try {
            fs.rmSync(folderPath, { recursive: true, force: true });
          } catch (err) {
            console.error(`Error al eliminar carpeta de "${folder}":`, err);
          }
          const index = global.conns.indexOf(conn);
          if (index > -1) global.conns.splice(index, 1);
          conn.ev.removeAllListeners();
          conn.ws.close();
          return;
        }

        const waitTime = Math.min(15000, 1000 * 2 ** reconnectAttempts);
        console.warn(`Subbot "${folder}" desconectado (${statusCode}). Reintentando en ${waitTime / 1000}s...`);

        setTimeout(async () => {
          try {
            conn.ws.close();
            conn.ev.removeAllListeners();
            conn = makeWASocket(connectionOptions);
            conn.handler = handler.handler.bind(conn);
            conn.connectionUpdate = connectionUpdate.bind(conn);
            conn.credsUpdate = saveCreds.bind(conn, true);
            conn.ev.on('messages.upsert', conn.handler);
            conn.ev.on('connection.update', conn.connectionUpdate);
            conn.ev.on('creds.update', conn.credsUpdate);
          } catch (err) {
            console.error(`Error al reintentar conexión con "${folder}":`, err);
          }
        }, waitTime);
      }
    };

    let handler = await import("../handler.js");
    conn.handler = handler.handler.bind(conn);
    conn.connectionUpdate = connectionUpdate.bind(conn);
    conn.credsUpdate = saveCreds.bind(conn, true);
    conn.ev.on("messages.upsert", conn.handler);
    conn.ev.on("connection.update", conn.connectionUpdate);
    conn.ev.on("creds.update", conn.credsUpdate);
  }
  console.log(`\nSubbots conectados correctamente: ${totalConnected} / ${serbotFolders.length}`);
}
loadSubbots().catch(console.error);

let handler = async (msg, { conn, args, usedPrefix, command, isOwner }) => {
  if (!global.db.data.settings[conn.user.jid].jadibotmd) {
    return conn.reply(msg.chat, "*ðŸŒ¼ Este Comando estÃ¡ deshabilitado por mi creador.*", msg);
  }

  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, `*â€ Lo siento, se ha alcanzado el lÃ­mite de ${MAX_SUBBOTS} subbots. Por favor, intenta mÃ¡s tarde.*`, msg);
  }

  let user = conn;
  const isCode = command === "code" || (args[0] && /(--code|code)/.test(args[0].trim()));
  let qrMessage, pairingCode;
  let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? user.user.jid : msg.sender;
  let userName = "" + userJid.split`@`[0];

  const subbotPath = `./${jadi}/${userName}`;
  if (!fs.existsSync(subbotPath)) fs.mkdirSync(subbotPath, { recursive: true });

  if (args[0] && args[0] !== undefined) {
    try {
      fs.writeFileSync(`${subbotPath}/creds.json`, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));
    } catch (e) {
      console.error("Error writing creds.json:", e);
    }
  }

  if (fs.existsSync(`${subbotPath}/creds.json`)) {
    try {
      let creds = JSON.parse(fs.readFileSync(`${subbotPath}/creds.json`));
      if (creds && creds.registered === false) {
        fs.unlinkSync(`${subbotPath}/creds.json`);
      }
    } catch (e) {
      console.error("Error reading or parsing creds.json:", e);
    }
  }

  async function initSubBot() {
    let { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(subbotPath);

    const config = {
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      version: [2, 3000, 1023223821],
      syncFullHistory: true,
      browser: isCode ? ["Ubuntu", "Chrome", "110.0.5585.95"] : ["${botname} (Sub Bot)", "Chrome", "2.0.0"],
      defaultQueryTimeoutMs: undefined,
      getMessage: async msgId => ({ conversation: "${botname}Bot-MD" })
    };

    let subBot = makeWASocket(config);
    subBot.isInit = false;

    const handleConnectionUpdate = async (update) => {
      const { connection, lastDisconnect, qr } = update;
      const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

      if (qr && !isCode) {
        qrMessage = await user.sendMessage(msg.chat, {
          image: await qrcode.toBuffer(qr, { scale: 8 }),
          caption: rtx,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363419364337473@newsletter',
              newsletterName: 'sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀',
              serverMessageId: -1
            }
          }
        }, { quoted: msg });
        return;
      }
      if (qr && isCode) {
        await user.sendMessage(msg.chat, {
          text: rtx2,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363419364337473@newsletter',
              newsletterName: 'sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀',
              serverMessageId: -1
            }
          }
        }, { quoted: msg });
        await delay(3000);
        pairingCode = await subBot.requestPairingCode(msg.sender.split`@`[0]);
        await user.sendMessage(msg.chat, {
          text: pairingCode,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363419364337473@newsletter',
              newsletterName: 'sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀',
              serverMessageId: -1
            }
          }
        }, { quoted: msg });
      }

      if (connection === "close") {
        if (statusCode == 405) {
          fs.unlinkSync(`${subbotPath}/creds.json`);
          return await msg.reply("â€ Reenvia nuevamente el comando.");
        }
        if (statusCode === DisconnectReason.loggedOut) {
          fs.rmSync(subbotPath, { recursive: true, force: true });
          return msg.reply("ðŸŒ¼ *ConexiÃ³n perdida...*");
        }
        if (statusCode === DisconnectReason.restartRequired || statusCode === DisconnectReason.connectionLost || statusCode === DisconnectReason.timedOut || statusCode == 428) {
          console.log(`Reconectando subbot (${statusCode})...`);
          subBot.ws.close();
          subBot.ev.removeAllListeners();
          initSubBot();
        } else if (statusCode === DisconnectReason.badSession) {
          return await msg.reply("ðŸŒ¼ La conexiÃ³n se ha cerrado, deberÃ¡ de conectarse manualmente usando el comando *.serbot* y reescanear el nuevo *QR.* Que fuÃ³ enviada la primera vez que se hizo *SubBot*");
        } else {
          console.log(`RazÃ³n de la desconexiÃ³n desconocida: ${statusCode || ""} >> ${connection || ""}`);
        }
      } else if (connection === "open") {
        subBot.isInit = true;
        if (!global.conns.includes(subBot)) global.conns.push(subBot);
        await user.sendMessage(msg.chat, {
          text: args[0] ? "â€ *EstÃ¡ conectado(a)!! Por favor espere se estÃ¡ cargando los mensajes...*\n\nðŸŒ¼ *Opciones Disponibles:*\n*Â» " + usedPrefix + "pausarai _(Detener la funciÃ³n Sub Bot)_*\n*Â» " + usedPrefix + "deletesession _(Borrar todo rastro de Sub Bot)_*\n*Â» " + usedPrefix + "serbot _(Nuevo cÃ³digo QR o Conectarse si ya es Sub Bot)_*" : "*â€ ConexiÃ³n con Ã©xito al WhatsApp*"
        }, { quoted: msg });
      }
    };

    let handlerModule = await import("../handler.js");
    subBot.handler = handlerModule.handler.bind(subBot);
    subBot.connectionUpdate = handleConnectionUpdate.bind(subBot);
    subBot.credsUpdate = saveCreds.bind(subBot, true);
    subBot.ev.on("messages.upsert", subBot.handler);
    subBot.ev.on("connection.update", subBot.connectionUpdate);
    subBot.ev.on("creds.update", subBot.credsUpdate);
  }
  initSubBot();
};

handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["serbot"];
handler.command = ["jadibot", "serbot", "code"];

export default handler;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

