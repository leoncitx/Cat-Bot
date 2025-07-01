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
const { child, spawn, exec } = await import("child_process");
const { CONNECTING } = ws;
import { makeWASocket } from "../lib/simple.js";

let check1 = "60adedfeb87c6";
let check2 = "e8d2cd8ee01fd";
let check3 = "S6A2514  in";
let check4 = "m-Donar.js";
let check5 = "76c3ff3561123379739e9faf06cc538";
let check6 = "7  _autoresponder.js59c74f1c6a3";
let check8 = "63fbbcc05babcc3de80de  info-bot.js";
let crm1 = "cd plugins";
let crm2 = "; md5sum";
let crm3 = "Sinfo-Donar.js";
let crm4 = " _autoresponder.js info-bot.js";
let drm1 = "";
let drm2 = "";

const rtx = "*Convertirse en sub bot✨ / JadiBot*\n\n*🟢 Utilice otro celular para escanear este codigo QR o escanea el codigo mediante una PC para convertirte en Sub Bot*\n\n`1` » Haga clic en los tres puntos en la esquina superior derecha\n\n`2` » Toca dispositivos vinculados\n\n`3` » Escanee este codigo QR para iniciar sesión\n\n🟢 *Este código QR expira en 45 segundos*";
const rtx2 = "*Convertirse en sub bot✨ / JadiBot*\n\n*🟢 Usa este Código para convertirte en un Sub Bot*\n\n`1` » Haga clic en los tres puntos en la esquina superior derecha\n\n`2` » Toca dispositivos vinculados\n\n`3` » Selecciona Vincular con el número de teléfono\n\n`4` » Escriba el Código\n\n🟢 *Este código solo funciona en el número que lo solicitó*";

if (global.conns instanceof Array) {
} else {
  global.conns = [];
}

const MAX_SUBBOTS = 9999;

const JADI_DIR = './jadibot';

async function loadSubbots() {
  const serbotFolders = fs.readdirSync(JADI_DIR);
  let totalConnected = 0;

  for (const folder of serbotFolders) {
    if (global.conns.length >= MAX_SUBBOTS) {
      console.log(`*Límite de ${MAX_SUBBOTS} subbots alcanzado. No se cargarán más.*`);
      break;
    }

    const folderPath = path.join(JADI_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const { state, saveCreds } = await useMultiFileAuthState(folderPath);
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
      version,
      keepAliveIntervalMs: 30000,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      auth: state,
      browser: [`Dylux`, "IOS", "4.1.0"],
    };

    let conn = makeWASocket(connectionOptions);
    conn.isInit = false;
    let recAtts = 0;
    let connected = false;

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin } = update;
      const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

      if (isNewLogin) {
        conn.isInit = true;
      }

      if (connection === "open") {
        conn.isInit = true;
        if (!global.conns.some(c => c.user?.jid === conn.user?.jid)) {
          global.conns.push(conn);
        }
        connected = true;
        totalConnected++;
        recAtts = 0;
        console.log(`✅ Subbot "${folder}" conectado.`);
      }

      if (connection === 'close' || connection === 'error') {
        if (!connected && recAtts < 3) {
          recAtts++;
          const waitTime = Math.min(15000, 1000 * 2 ** recAtts);
          console.warn(`⚠️ Subbot "${folder}" desconectado (Intento ${recAtts}/3). Reintentando en ${waitTime / 1000}s...`);

          setTimeout(async () => {
            try {
              conn.ev.removeAllListeners();
              conn = makeWASocket(connectionOptions);
              conn.handler = handler.handler.bind(conn);
              conn.connectionUpdate = connectionUpdate.bind(conn);
              conn.credsUpdate = saveCreds.bind(conn, true);
              conn.ev.on('messages.upsert', conn.handler);
              conn.ev.on('connection.update', conn.connectionUpdate);
              conn.ev.on('creds.update', conn.credsUpdate);
              await creloadHandler(false);
            } catch (err) {
              console.error(`❌ Error al reintentar conexión con "${folder}":`, err);
            }
          }, waitTime);
        } else if (statusCode === DisconnectReason.loggedOut || statusCode === 405) {
          console.log(`📤 Subbot "${folder}" cerró sesión o la sesión es inválida. Eliminando carpeta.`);
          try {
            fs.rmSync(folderPath, { recursive: true, force: true });
          } catch (err) {
            console.error(`❌ Error al eliminar carpeta de "${folder}":`, err);
          }
          global.conns = global.conns.filter(c => c !== conn);
          conn.ev.removeAllListeners();
          conn = null;
        } else if (statusCode === DisconnectReason.connectionClosed || statusCode === DisconnectReason.connectionLost) {
          console.warn(`⚠️ Subbot "${folder}" perdió la conexión. Intentando reconectar...`);
        } else {
          console.log(`❌ Subbot "${folder}" desconectado por razón desconocida: ${statusCode || ''} - ${connection}.`);
        }
      }
    }

    let handler = await import("../handler.js");

    let creloadHandler = async function (restartConn = false) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) handler = Handler;
      } catch (e) {
        console.error("Error al recargar handler:", e);
      }

      if (restartConn) {
        try {
          conn.ws.close();
        } catch {}
        conn.ev.removeAllListeners();
        conn = makeWASocket(connectionOptions);
      }

      conn.ev.off("messages.upsert", conn.handler);
      conn.ev.off("connection.update", conn.connectionUpdate);
      conn.ev.off("creds.update", conn.credsUpdate);

      conn.handler = handler.handler.bind(conn);
      conn.connectionUpdate = connectionUpdate.bind(conn);
      conn.credsUpdate = saveCreds.bind(conn, true);

      conn.ev.on("messages.upsert", conn.handler);
      conn.ev.on("connection.update", conn.connectionUpdate);
      conn.ev.on("creds.update", conn.credsUpdate);

      return true;
    }

    await creloadHandler(false);
  }

  console.log(`\n✅ Subbots conectados correctamente: ${totalConnected} / ${serbotFolders.length}`);
}

loadSubbots().catch(console.error);

let handler = async (msg, { conn, args, usedPrefix, command, isOwner }) => {
  if (!global.db.data.settings[conn.user.jid].jadibotmd) {
    return conn.reply(msg.chat, "*🔴 Este Comando está deshabilitado por mi creador.*", msg, rcanal);
  }

  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, `*❌ Lo siento, se ha alcanzado el límite de ${MAX_SUBBOTS} subbots. Por favor, intenta más tarde.*`, msg, rcanal);
  }

  let user = conn;
  const isCode = command === "code" || (args[0] && /(--code|code)/.test(args[0].trim()));
  let code;
  let pairingCode;
  let qrMessage;
  let userData = global.db.data.users[msg.sender];
  let userJid = msg.sender;
  let userName = userJid.split('@')[0];

  const userFolderPath = path.join(JADI_DIR, userName);

  if (isCode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim() || undefined;
    if (args[1]) {
      args[1] = args[1].replace(/^--code$|^code$/, "").trim();
    }
  }

  if (!fs.existsSync(userFolderPath)) {
    fs.mkdirSync(userFolderPath, { recursive: true });
  }

  if (args[0] && args[0] != undefined) {
    try {
      const credsData = JSON.parse(Buffer.from(args[0], "base64").toString("utf-8"));
      fs.writeFileSync(path.join(userFolderPath, "creds.json"), JSON.stringify(credsData, null, "\t"));
    } catch (e) {
      console.error("Error al parsear credenciales:", e);
      return conn.reply(msg.chat, "❌ Formato de credenciales inválido. Asegúrate de que sea un JSON Base64 válido.", msg, rcanal);
    }
  } else {
    if (fs.existsSync(path.join(userFolderPath, "creds.json"))) {
      let creds = JSON.parse(fs.readFileSync(path.join(userFolderPath, "creds.json")));
      if (creds && creds.registered === false) {
        fs.unlinkSync(path.join(userFolderPath, "creds.json"));
      }
    }
  }

  const execCommand = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64");
  exec(execCommand.toString("utf-8"), async (error, stdout, stderr) => {
    const secret = Buffer.from(drm1 + drm2, "base64");

    async function initSubBot() {
      if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
      }

      let { version, isLatest } = await fetchLatestBaileysVersion();
      const msgRetry = () => {};
      const cache = new nodeCache();
      const { state, saveState, saveCreds } = await useMultiFileAuthState(userFolderPath);

      const config = {
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        msgRetry: msgRetry,
        msgRetryCache: cache,
        version: [2, 3000, 1023223821],
        syncFullHistory: true,
        browser: isCode ? ["Ubuntu", "Chrome", "110.0.5585.95"] : ["${botname} (Sub Bot)", "Chrome", "2.0.0"],
        defaultQueryTimeoutMs: undefined,
        getMessage: async msgId => {
          return {
            conversation: "${botname}Bot-MD"
          };
        }
      };

      let subBot = makeWASocket(config);
      subBot.isInit = false;
      let isConnectedFlag = true;

      async function handleConnectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update;
        if (isNewLogin) {
          subBot.isInit = false;
        }

        if (qr && !isCode) {
          qrMessage = await user.sendMessage(msg.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: rtx + "\n" + secret.toString("utf-8"),
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
          code = await user.sendMessage(msg.chat, {
            text: rtx2 + "\n" + secret.toString("utf-8"),
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

          if (pairingCode) {
            pairingCode = await user.sendMessage(msg.chat, {
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
        }

        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        console.log(`Estado de conexión para ${userName}: ${connection}, Código de desconexión: ${statusCode}`);

        const closeAndRemoveSubBot = async () => {
          try {
            subBot.ws.close();
          } catch {}
          subBot.ev.removeAllListeners();
          global.conns = global.conns.filter(c => c !== subBot);
          console.log(`Subbot "${userName}" eliminado de la lista de conexiones.`);
        };

        if (connection === "close") {
          console.log(`Desconexión para ${userName}, razón: ${DisconnectReason[statusCode] || 'Desconocida'} (${statusCode})`);

          switch (statusCode) {
            case DisconnectReason.loggedOut:
            case 405:
              await msg.reply("🔴 *Conexión perdida, la sesión ha caducado. Por favor, reescanea el QR.*");
              fs.rmSync(userFolderPath, { recursive: true, force: true });
              await closeAndRemoveSubBot();
              break;
            case DisconnectReason.connectionClosed:
            case DisconnectReason.connectionLost:
            case DisconnectReason.timedOut:
            case DisconnectReason.restartRequired:
              console.log(`🟢 ${userName} intentando reconectar...`);
              break;
            case DisconnectReason.badSession:
              await msg.reply("🔴 *La conexión se ha cerrado debido a una sesión inválida. Deberá de conectarse manualmente usando el comando *.serbot* y reescanear el nuevo QR.*");
              fs.rmSync(userFolderPath, { recursive: true, force: true });
              await closeAndRemoveSubBot();
              break;
            default:
              console.log(`❌ Razon de desconexión no manejada para ${userName}: ${statusCode}.`);
              break;
          }
        }

        if (global.db.data == null) {
        }

        if (connection == "open") {
          subBot.isInit = true;
          if (!global.conns.some(c => c.user?.jid === subBot.user?.jid)) {
            global.conns.push(subBot);
          }
          isConnectedFlag = true;
          await user.sendMessage(msg.chat, {
            text: args[0] ? "*✅ ¡Está conectado(a)! Por favor espere, se están cargando los mensajes...*\n\n🟢 *Opciones Disponibles:*\n*» " + usedPrefix + "pausarai _(Detener la función Sub Bot)_*\n*» " + usedPrefix + "deletesession _(Borrar todo rastro de Sub Bot)_*\n*» " + usedPrefix + "serbot _(Nuevo código QR o Conectarse si ya es Sub Bot)_*" : "*✅ Conexión con éxito al WhatsApp*"
          }, { quoted: msg });

          if (isNewLogin) {
            joinChannels(subBot);
          }
        }
      }

      setInterval(async () => {
        if (!subBot.user || subBot.ws.readyState !== CONNECTING && subBot.ws.readyState !== ws.OPEN) {
          console.warn(`Subbot "${userName}" inactivo o desconectado. Intentando cerrar y limpiar.`);
          try {
            subBot.ws.close();
          } catch (error) {
            console.error(`Error al intentar cerrar ws de ${userName}:`, error);
          }
          subBot.ev.removeAllListeners();
          global.conns = global.conns.filter(c => c !== subBot);
        }
      }, 60000);

      let handlerModule = await import("../handler.js");
      let updateHandler = async (shouldReconnect = false) => {
        try {
          const updatedModule = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
          if (Object.keys(updatedModule || {}).length) {
            handlerModule = updatedModule;
          }
        } catch (error) {
          console.error("Error al recargar handler en updateHandler:", error);
        }

        if (shouldReconnect) {
          try {
            subBot.ws.close();
          } catch {}
          subBot.ev.removeAllListeners();
          subBot = makeWASocket(config);
          isConnectedFlag = true;
        }

        subBot.ev.off("messages.upsert", subBot.handler);
        subBot.ev.off("connection.update", subBot.connectionUpdate);
        subBot.ev.off("creds.update", subBot.credsUpdate);

        subBot.handler = handlerModule.handler.bind(subBot);
        subBot.connectionUpdate = handleConnectionUpdate.bind(subBot);
        subBot.credsUpdate = saveCreds.bind(subBot, true);

        subBot.ev.on("messages.upsert", subBot.handler);
        subBot.ev.on("connection.update", subBot.connectionUpdate);
        subBot.ev.on("creds.update", subBot.credsUpdate);

        return true;
      };

      updateHandler(false);
    }

    initSubBot();
  });
};

handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["serbot"];
handler.command = ["jadibot", "serbot", "code"];

export default handler;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function joinChannels(conn) {
  try {
    await conn.newsletterFollow("120363414007802886@newsletter");
    await conn.newsletterFollow("120363419364337473@newsletter");
    console.log(`Subbot ${conn.user?.jid} se unió a los canales.`);
  } catch (e) {
    console.error(`Error al unirse a los canales para ${conn.user?.jid}:`, e);
  }
}
