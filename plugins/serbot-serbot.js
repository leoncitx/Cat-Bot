import {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from "pino";
import util from "util";
import { makeWASocket } from "../lib/simple.js";

const SUBBOTS_DIR = "./sessions";
const MAX_SUBBOTS = 9999;
const RECONNECT_ATTEMPTS = 5;
const RECONNECT_INITIAL_DELAY_MS = 2000;
const RECONNECT_MAX_DELAY_MS = 30000;

const MESSAGES = {
  QR_SCAN_INSTRUCTIONS: "*¡Bienvenido a la conexión Sub Bot! ✨🌀*\n\n*Para unirte, ¡escanea este código QR con otro dispositivo o PC! 📱💻*\n\n`1` » Toca los *tres puntos* en la esquina superior derecha.\n`2` » Selecciona *'Dispositivos vinculados'*.\n`3` » ¡Escanea este QR y listo para iniciar sesión! 🎉\n\n*⚠️ Este código QR caduca en 45 segundos. ¡Conéctate rápido!*",
  PAIRING_CODE_INSTRUCTIONS: "*¡Conexión Sub Bot por Código! ✨🌀*\n\n*Usa este código único para convertirte en un Sub Bot. ¡Es rápido y seguro! 🚀*\n\n`1` » Toca los *tres puntos* en la esquina superior derecha.\n`2` » Selecciona *'Dispositivos vinculados'*.\n`3` » Elige *'Vincular con el número de teléfono'*.\n`4` » ¡Introduce el *código* que te proporcionaremos a continuación! 👇\n\n*🔒 Este código solo funciona para ti. ¡No lo compartas!*",
  CONNECTION_SUCCESS_QR: "✅ *¡Está conectado(a)! Por favor, espere, se están cargando los mensajes...*\n\n*✨ Opciones Disponibles:*\n*» %s-pausarai _(Detener la función Sub Bot)_*\n*» %s-deletesession _(Borrar todo rastro de Sub Bot)_*\n*» %s-serbot _(Nuevo código QR o Conectarse si ya es Sub Bot)_*",
  CONNECTION_SUCCESS_CODE: "*✅ Conexión con éxito al WhatsApp*",
  COMMAND_DISABLED: "*❌ Este Comando está deshabilitado por mi creador.*",
  MAX_SUBBOTS_REACHED: "*❌ Lo siento, se ha alcanzado el límite de %d subbots. Por favor, intenta más tarde.*",
  RETRY_CONNECTION: "⚠️ Subbot \"%s\" desconectado (Intento %d/%d). Reintentando en %dms...",
  FAILED_CONNECTION_ATTEMPTS: "🛑 Subbot \"%s\" falló tras %d intentos. Eliminando carpeta.",
  LOGGED_OUT: "📤 Subbot \"%s\" cerró sesión. Eliminando carpeta.",
  CONNECTION_LOST: "❌ *Conexión perdida...*",
  UNEXPECTED_DISCONNECT: "❌ La conexión se ha cerrado de manera inesperada, intentaremos reconectar...",
  BAD_SESSION: "❌ La conexión se ha cerrado, deberá de conectarse manualmente usando el comando *.serbot* y reescanear el nuevo *QR.* Que fue enviada la primera vez que se hizo *SubBot*",
  UNKNOWN_DISCONNECT_REASON: "❌ Razón de la desconexión desconocida: %s >> %s",
  RESTART_REQUIRED: "\n⏳ Tiempo de conexión agotado, reconectando...",
  CONNECTION_LOST_RECONNECTING: "\n⏳ Conexión perdida con el servidor, reconectando....",
  TIMEOUT_RECONNECTING: "\n⏳ Tiempo de conexión agotado, reconectando....",
  CREDS_ERROR: "❌ Reenvia nuevamente el comando.",
  ERROR_DELETING_FOLDER: "❌ Error al eliminar carpeta de \"%s\": %s",
  DEBUG_MESSAGE_READ: "Leyendo mensaje entrante: %s",
  DEBUG_MESSAGE_SKIPPED: "⚠️ Omitiendo mensajes en espera.",
};

if (!Array.isArray(global.conns)) {
  global.conns = [];
}

if (!fs.existsSync(SUBBOTS_DIR)) {
  fs.mkdirSync(SUBBOTS_DIR, { recursive: true });
}

async function loadSubbots() {
  const serbotFolders = fs.readdirSync(SUBBOTS_DIR);
  let totalConnected = 0;

  for (const folder of serbotFolders) {
    if (global.conns.length >= MAX_SUBBOTS) {
      console.log(util.format(MESSAGES.MAX_SUBBOTS_REACHED, MAX_SUBBOTS));
      break;
    }

    const folderPath = path.join(SUBBOTS_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    await connectSubBot(folder);
  }

  console.log(`\n✅ Subbots conectados correctamente: ${totalConnected} / ${serbotFolders.length}`);
}

async function connectSubBot(folderName, userId = folderName) {
  const folderPath = path.join(SUBBOTS_DIR, folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

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
  let isSubBotConnected = false;

  const handleConnectionUpdate = async (update) => {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

    if (isNewLogin) conn.isInit = true;

    if (connection === "open") {
      conn.isInit = true;
      global.conns.push(conn);
      isSubBotConnected = true;
      reconnectAttempts = 0;
      console.log(`✅ Subbot "${folderName}" conectado.`);

      await joinNewsletters(conn);
    }

    if ((connection === 'close' || connection === 'error') && !isSubBotConnected) {
      reconnectAttempts++;
      const waitTime = Math.min(RECONNECT_MAX_DELAY_MS, RECONNECT_INITIAL_DELAY_MS * 2 ** reconnectAttempts);

      if (reconnectAttempts >= RECONNECT_ATTEMPTS) {
        console.log(util.format(MESSAGES.FAILED_CONNECTION_ATTEMPTS, folderName, RECONNECT_ATTEMPTS));
        try {
          fs.rmSync(folderPath, { recursive: true, force: true });
        } catch (err) {
          console.error(util.format(MESSAGES.ERROR_DELETING_FOLDER, folderName, err));
        }
        return;
      }

      console.warn(util.format(MESSAGES.RETRY_CONNECTION, folderName, reconnectAttempts, RECONNECT_ATTEMPTS, waitTime));

      setTimeout(async () => {
        try {
          conn.ws.close();
        } catch {}
        conn.ev.removeAllListeners();
        conn = makeWASocket(connectionOptions);
        await setupSubBotListeners(conn, saveCreds, handleConnectionUpdate);
      }, waitTime);
    }

    if (statusCode === DisconnectReason.loggedOut) {
      console.log(util.format(MESSAGES.LOGGED_OUT, folderName));
      try {
        fs.rmSync(folderPath, { recursive: true, force: true });
      } catch (err) {
        console.error(util.format(MESSAGES.ERROR_DELETING_FOLDER, folderName, err));
      }
    } else if (connection === "close" && statusCode !== DisconnectReason.loggedOut) {
      console.log(util.format(MESSAGES.UNKNOWN_DISCONNECT_REASON, (statusCode || ""), (connection || "")));
    }
  };

  const setupSubBotListeners = async (subBotConn, saveCredsFunc, connectionUpdateHandler) => {
    let handlerModule = await import("../handler.js");
    subBotConn.handler = handlerModule.handler.bind(subBotConn);
    subBotConn.connectionUpdate = connectionUpdateHandler.bind(subBotConn);
    subBotConn.credsUpdate = saveCredsFunc.bind(subBotConn, true);

    subBotConn.ev.on("messages.upsert", subBotConn.handler);
    subBotConn.ev.on("connection.update", subBotConn.connectionUpdate);
    subBotConn.ev.on("creds.update", subBotConn.credsUpdate);

    setInterval(() => {
      if (!subBotConn.user && isSubBotConnected) {
        console.log(`Subbot for ${folderName} seems disconnected, cleaning up.`);
        try {
          subBotConn.ws.close();
        } catch (error) {
          console.error(`Error closing WebSocket for ${folderName}:`, error);
        }
        subBotConn.ev.removeAllListeners();
        const index = global.conns.indexOf(subBotConn);
        if (index > -1) {
          global.conns.splice(index, 1);
        }
        isSubBotConnected = false;
      }
    }, 60000);
  };

  await setupSubBotListeners(conn, saveCreds, handleConnectionUpdate);
}

loadSubbots().catch(console.error);

let handler = async (msg, { conn, args, usedPrefix, command, isOwner }) => {
  if (!global.db.data.settings[conn.user.jid]?.jadibotmd) {
    return conn.reply(msg.chat, MESSAGES.COMMAND_DISABLED, msg, global.rcanal);
  }

  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, util.format(MESSAGES.MAX_SUBBOTS_REACHED, MAX_SUBBOTS), msg, global.rcanal);
  }

  const isCodeCommand = command === "code" || (args[0] && /(--code|code)/.test(args[0].trim()));
  const userJid = msg.fromMe ? conn.user.jid : msg.sender;
  const userName = userJid.split('@')[0];
  const userSessionPath = path.join(SUBBOTS_DIR, userName);

  if (!fs.existsSync(userSessionPath)) {
    fs.mkdirSync(userSessionPath, { recursive: true });
  }

  if (args[0] && !isCodeCommand) {
    try {
      const decodedCreds = JSON.parse(Buffer.from(args[0], "base64").toString("utf-8"));
      fs.writeFileSync(path.join(userSessionPath, "creds.json"), JSON.stringify(decodedCreds, null, "\t"));
    } catch (e) {
      console.error("Error processing base64 credentials:", e);
      return conn.reply(msg.chat, "❌ Formato de credenciales inválido.", msg, global.rcanal);
    }
  }

  if (fs.existsSync(path.join(userSessionPath, "creds.json"))) {
    try {
      const creds = JSON.parse(fs.readFileSync(path.join(userSessionPath, "creds.json")));
      if (creds.registered === false) {
        fs.unlinkSync(path.join(userSessionPath, "creds.json"));
      }
    } catch (e) {
      console.error("Error reading or parsing creds.json:", e);
      fs.unlinkSync(path.join(userSessionPath, "creds.json"));
    }
  }

  async function initializeNewSubBot() {
    const { version } = await fetchLatestBaileysVersion();
    const cache = new NodeCache();
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);

    const config = {
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      msgRetry: () => {},
      msgRetryCache: cache,
      version: [2, 3000, 1023223821],
      syncFullHistory: true,
      browser: isCodeCommand ? ["Ubuntu", "Chrome", "110.0.5585.95"] : ["${botname} (Sub Bot)", "Chrome", "2.0.0"],
      defaultQueryTimeoutMs: undefined,
      getMessage: async msgId => {
        if (global.store) {

        }
        return {
          conversation: "${botname}Bot-MD"
        };
      }
    };

    let subBot = makeWASocket(config);
    subBot.isInit = false;
    let isConnectedFlag = false;

    const handleNewSubBotConnectionUpdate = async (update) => {
      const { connection, lastDisconnect, isNewLogin, qr } = update;

      if (isNewLogin) {
        subBot.isInit = false;
      }

      let qrMessageId = null;

      if (qr && !isCodeCommand) {
        const qrImageBuffer = await qrcode.toBuffer(qr, { scale: 8 });
        const sentMessage = await conn.sendMessage(msg.chat, {
          image: qrImageBuffer,
          caption: MESSAGES.QR_SCAN_INSTRUCTIONS,
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
        qrMessageId = sentMessage.key.id;
        return;
      }

      if (qr && isCodeCommand) {
        await conn.sendMessage(msg.chat, {
          text: MESSAGES.PAIRING_CODE_INSTRUCTIONS,
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

        const pairingCode = await subBot.requestPairingCode(msg.sender.split`@`[0]);

        await conn.sendMessage(msg.chat, {
          text: `\`\`\`${pairingCode}\`\`\``,
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

      const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
      console.log("SubBot connection status code:", statusCode);

      const closeSubBotConnection = async (shouldRemove = true) => {
        try {
          subBot.ws.close();
        } catch {}
        subBot.ev.removeAllListeners();
        if (shouldRemove) {
          const index = global.conns.indexOf(subBot);
          if (index > -1) {
            global.conns.splice(index, 1);
          }
        }
      };

      if (connection === "close") {
        console.log("Disconnect reason:", statusCode);
        if (statusCode === 405) {
          await fs.unlinkSync(path.join(userSessionPath, "creds.json"));
          return await conn.reply(msg.chat, MESSAGES.CREDS_ERROR, msg, global.rcanal);
        } else if (statusCode === DisconnectReason.restartRequired) {
          initializeNewSubBot();
          return console.log(MESSAGES.RESTART_REQUIRED);
        } else if (statusCode === DisconnectReason.loggedOut) {
          fs.rmSync(userSessionPath, { recursive: true, force: true });
          return conn.reply(msg.chat, MESSAGES.CONNECTION_LOST, msg, global.rcanal);
        } else if (statusCode === 428) {
          await closeSubBotConnection(false);
          return conn.reply(msg.chat, MESSAGES.UNEXPECTED_DISCONNECT, msg, global.rcanal);
        } else if (statusCode === DisconnectReason.connectionLost) {
          await initializeNewSubBot();
          return console.log(MESSAGES.CONNECTION_LOST_RECONNECTING);
        } else if (statusCode === DisconnectReason.badSession) {
          return conn.reply(msg.chat, MESSAGES.BAD_SESSION, msg, global.rcanal);
        } else if (statusCode === DisconnectReason.timedOut) {
          await closeSubBotConnection(false);
          return console.log(MESSAGES.TIMEOUT_RECONNECTING);
        } else {
          console.log(util.format(MESSAGES.UNKNOWN_DISCONNECT_REASON, (statusCode || ""), (connection || "")));
        }
      }

      if (global.db.data == null) {
        global.loadDatabase();
      }

      if (connection === "open") {
        subBot.isInit = true;
        global.conns.push(subBot);
        isConnectedFlag = true;

        if (qrMessageId) {
          await conn.sendMessage(msg.chat, { delete: qrMessageId }).catch(e => console.error("Error deleting QR message:", e));
        }

        const successMessage = isCodeCommand ? MESSAGES.CONNECTION_SUCCESS_CODE : util.format(MESSAGES.CONNECTION_SUCCESS_QR, usedPrefix, usedPrefix, usedPrefix);
        await conn.sendMessage(msg.chat, { text: successMessage }, { quoted: msg });
        await joinNewsletters(subBot);
      }
    };

    setInterval(async () => {
      if (!subBot.user && isConnectedFlag) {
        console.log(`Subbot for ${userName} seems disconnected, cleaning up.`);
        try {
          subBot.ws.close();
        } catch (error) {
          console.error(`Error closing WebSocket for ${userName}:`, error);
        }
        subBot.ev.removeAllListeners();
        const index = global.conns.indexOf(subBot);
        if (index > -1) {
          global.conns.splice(index, 1);
        }
        isConnectedFlag = false;
      }
    }, 60000);

    const updateAndSetupHandler = async (shouldReconnect) => {
      let handlerModule = await import("../handler.js");
      try {
        const updatedModule = await import(`../handler.js?update=${Date.now()}`);
        if (Object.keys(updatedModule || {}).length) {
          handlerModule = updatedModule;
        }
      } catch (error) {
        console.error("Error updating handler module:", error);
      }

      if (shouldReconnect) {
        const chats = subBot.chats;
        try {
          subBot.ws.close();
        } catch {}
        subBot.ev.removeAllListeners();
        subBot = makeWASocket(config, { chats: chats });
        isConnectedFlag = true;
      }

      if (!subBot.ev.listenerCount("messages.upsert") || shouldReconnect) {
        subBot.ev.off("messages.upsert", subBot.handler);
        subBot.ev.off("connection.update", subBot.connectionUpdate);
        subBot.ev.off("creds.update", subBot.credsUpdate);
      }

      subBot.handler = handlerModule.handler.bind(subBot);
      subBot.connectionUpdate = handleNewSubBotConnectionUpdate.bind(subBot);
      subBot.credsUpdate = saveCreds.bind(subBot, true);

      subBot.ev.on("messages.upsert", subBot.handler);
      subBot.ev.on("connection.update", subBot.connectionUpdate);
      subBot.ev.on("creds.update", subBot.credsUpdate);
    };

    await updateAndSetupHandler(false);
  }

  initializeNewSubBot();
};

handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["serbot"];
handler.command = ["jadibot", "serbot", "code"];

export default handler;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function joinNewsletters(conn) {
  try {
    await conn.newsletterFollow("120363414007802886@newsletter");
    await conn.newsletterFollow("120363419364337473@newsletter");
    console.log("Successfully joined newsletters.");
  } catch (error) {
    console.error("Error joining newsletters:", error);
  }
}
