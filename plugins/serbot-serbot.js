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
import * as ws from "ws";
const { child, spawn, exec } = await import("child_process");
const { CONNECTING } = ws;
import { makeWASocket } from "../lib/simple.js";

const rtx = "*¡Bienvenido a la conexión Sub Bot! ✨*\n\n*Para unirte, ¡escanea este código QR con otro dispositivo o PC! 📱💻*\n\n`1` » Toca los *tres puntos* en la esquina superior derecha.\n`2` » Selecciona *'Dispositivos vinculados'*.\n`3` » ¡Escanea este QR y listo para iniciar sesión! 🎉\n\n*⚠️ Este código QR caduca en 45 segundos. ¡Conéctate rápido!*";
const rtx2 = "*¡Conexión Sub Bot por Código! ✨*\n\n*Usa este código único para convertirte en un Sub Bot. ¡Es rápido y seguro! 🚀*\n\n`1` » Toca los *tres puntos* en la esquina superior derecha.\n`2` » Selecciona *'Dispositivos vinculados'*.\n`3` » Elige *'Vincular con el número de teléfono'*.\n`4` » ¡Introduce el *código* que te proporcionaremos a continuación! 👇\n\n*🔒 Este código solo funciona para ti. ¡No lo compartas!*";

if (!(global.conns instanceof Array)) global.conns = [];
const MAX_SUBBOTS = 9999;

export async function loadSubbots() {
  const serbotFolders = fs.readdirSync('./' + global.jadi);
  let totalC = 0;

  for (const folder of serbotFolders) {
    if (global.conns.length >= MAX_SUBBOTS) {
      console.log(`*Límite de ${MAX_SUBBOTS} subbots alcanzado.*`);
      break;
    }

    const folderPath = `./${global.jadi}/${folder}`;
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
    let recAtts = 0;
    let connected = false;

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin } = update;
      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

      if (isNewLogin) conn.isInit = true;

      if (connection === "open") {
        if (!connected) {
          global.conns.push(conn);
          totalC++;
          recAtts = 0;
          connected = true;
          console.log(`Subbot \"${folder}\" conectado correctamente.`);
        }
      }

      if ((connection === 'close' || connection === 'error') && !connected) {
        recAtts++;
        const waitTime = Math.min(15000, 1000 * 2 ** recAtts);
        console.warn(`⚠️ Subbot \"${folder}\" desconectado (Intento ${recAtts}/3). Reintentando en ${waitTime / 1000}s...`);

        if (recAtts >= 3) {
          console.log(`🛑 Subbot \"${folder}\" falló tras 3 intentos. Eliminando carpeta.`);
          try {
            fs.rmSync(folderPath, { recursive: true, force: true });
          } catch (err) {
            console.error(`❌ Error al eliminar carpeta de \"${folder}\":`, err);
          }
          return;
        }

        setTimeout(async () => {
          try {
            const idx = global.conns.indexOf(conn);
            if (idx > -1) global.conns.splice(idx, 1);

            try { conn.ws.close() } catch { }
            conn.ev.removeAllListeners();

            conn = makeWASocket(connectionOptions);

            let handler = await import("../handler.js");
            conn.handler = handler.handler.bind(conn);
            conn.connectionUpdate = connectionUpdate.bind(conn);
            conn.credsUpdate = saveCreds.bind(conn, true);

            conn.ev.on('messages.upsert', conn.handler);
            conn.ev.on('connection.update', conn.connectionUpdate);
            conn.ev.on('creds.update', conn.credsUpdate);

            console.log(`✅ Subbot \"${folder}\" reconectado.`);
          } catch (err) {
            console.error(`❌ Error al reintentar conexión con \"${folder}\":`, err);
          }
        }, waitTime);
      }

      if (code === DisconnectReason.loggedOut) {
        console.log(`📤 Subbot \"${folder}\" cerró sesión. Eliminando carpeta.`);
        try {
          fs.rmSync(folderPath, { recursive: true, force: true });
        } catch (err) {
          console.error(`❌ Error al eliminar carpeta de \"${folder}\":`, err);
        }
      }
    }

    let handler = await import("../handler.js");
    conn.handler = handler.handler.bind(conn);
    conn.connectionUpdate = connectionUpdate.bind(conn);
    conn.credsUpdate = saveCreds.bind(conn, true);

    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('connection.update', conn.connectionUpdate);
    conn.ev.on('creds.update', conn.credsUpdate);
  }

  console.log(`\n✅ Subbots conectados correctamente: ${totalC} / ${serbotFolders.length}`);
}

loadSubbots().catch(console.error);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let handler = async (msg, { conn, args, usedPrefix, command, isOwner }) => {
  if (!global.db.data.settings[conn.user.jid].jadibotmd) {
    return conn.reply(msg.chat, "*Este comando esta deshabilitado por mi creador Barboza.*", msg, global.rcanal); // Changed rcanal to global.rcanal
  }

  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, `*Lo siento se ah alcanzado el limite de ${MAX_SUBBOTS} subbots. Por favor, intenta mas tarde.*`, msg, global.rcanal); // Changed rcanal to global.rcanal
  }

  let user = conn;
  const isCode = command === "code" || (args[0] && /(--code|code)/.test(args[0].trim()));
  let code;
  let pairingCode;
  let qrMessage;
  let userData = global.db.data.users[msg.sender];
  let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? user.user.jid : msg.sender;
  let userName = "" + userJid.split`@`[0];

  if (isCode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim() || undefined;
    if (args[1]) {
      args[1] = args[1].replace(/^--code$|^code$/, "").trim();
    }
  }

  if (!fs.existsSync("./" + global.jadi + "/" + userName)) { // Changed to global.jadi
    fs.mkdirSync("./" + global.jadi + "/" + userName, { recursive: true }); // Changed to global.jadi
  }

  if (args[0] && args[0] != undefined) {
    fs.writeFileSync("./" + global.jadi + "/" + userName + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t")); // Changed to global.jadi
  } else {
    "";
  }

  if (fs.existsSync("./" + global.jadi + "/" + userName + "/creds.json")) { // Changed to global.jadi
    let creds = JSON.parse(fs.readFileSync("./" + global.jadi + "/" + userName + "/creds.json")); // Changed to global.jadi
    if (creds) {
      if (creds.registered === false) {
        fs.unlinkSync("./" + global.jadi + "/" + userName + "/creds.json"); // Changed to global.jadi
      }
    }
  }
    async function initSubBot() {
      let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? user.user.jid : msg.sender;
      let userName = "" + userJid.split`@`[0];

      if (!fs.existsSync("./" + global.jadi + "/" + userName)) { // Changed to global.jadi
        fs.mkdirSync("./" + global.jadi + "/" + userName, { recursive: true }); // Changed to global.jadi
      }

      if (args[0]) {
        fs.writeFileSync("./" + global.jadi + "/" + userName + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t")); // Changed to global.jadi
      } else {
        "";
      }

      let { version, isLatest } = await fetchLatestBaileysVersion();
      const msgRetry = msgRetry => {};
      const cache = new nodeCache();
      const { state, saveState, saveCreds } = await useMultiFileAuthState("./" + global.jadi + "/" + userName); // Changed to global.jadi

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
          if (global.store) {} // Changed to global.store
          return {
            conversation: ``
          };
        }
      };

      let subBot = makeWASocket(config);
      subBot.isInit = false;
      let isConnected = true;

      async function handleConnectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update;
        if (isNewLogin) {
          subBot.isInit = false;
        }
        if (qr && !isCode) {
          qrMessage = await user.sendMessage(msg.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: rtx,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363419364337473@newsletter',
                newsletterName: 'Canal principal sigan gente',
                serverMessageId: -1
              }
            }
          }, { quoted: msg });
          return;
        }
        if (qr && isCode) {
          code = await user.sendMessage(msg.chat, {
            image: { url: "https://cdn-sunflareteam.vercel.app/images/fe2072569a.jpg" },
            caption: rtx2,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363419364337473@newsletter',
                newsletterName: 'canal principal sigan gente',
               serverMessageId: -1
              }
            }
          }, { quoted: msg });

          await sleep(3000);
          pairingCode = await subBot.requestPairingCode(msg.sender.split`@`[0]);

          pairingCode = await user.sendMessage(msg.chat, {
            text: `\`\`\`${pairingCode}\`\`\``, // Only the code, no extra text
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363419364337473@newsletter',
                newsletterName: 'canal principal sigan gente',
                serverMessageId: -1
              }
            }
          }, { quoted: msg });
        }

        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        console.log(statusCode);

        const closeConnection = async shouldClose => {
          if (!shouldClose) {
            try {
              subBot.ws.close();
            } catch {}
            subBot.ev.removeAllListeners();
            let index = global.conns.indexOf(subBot);
            if (index < 0) {
              return;
            }
            delete global.conns[index];
            global.conns.splice(index, 1);
          }
        };

        const disconnectCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (connection === "close") {
          console.log(disconnectCode);
          if (disconnectCode == 405) {
            await fs.unlinkSync("./" + global.jadi + "/" + userName + "/creds.json"); // Changed to global.jadi
            return await msg.reply(" Reenvia nuevamente el comando.");
          }
          if (disconnectCode === DisconnectReason.restartRequired) {
            initSubBot();
            return console.log("\n Tiempo de conexion agotado, reconectando...");
          } else if (disconnectCode === DisconnectReason.loggedOut) {
            fs.rmdirSync(`./${global.jadi}/${userName}`, { recursive: true }); // Changed to global.jadi
            return msg.reply(" *Conexion perdida...*");
          } else if (disconnectCode == 428) {
            await closeConnection(false);
            return msg.reply("La conexion se ha cerrado de manera inesperada, intentaremos reconectar...");
          } else if (disconnectCode === DisconnectReason.connectionLost) {
            await initSubBot();
            return console.log("\nConexion perdida con el servidor, reconectando....");
          } else if (disconnectCode === DisconnectReason.badSession) {
            return await msg.reply(" La conexion se ha cerrado, deberia de conectarse manualmente usando el comando *.serbot* y reescanear el nuevo *QR.* Que fuÃ³ enviada la primera vez que se hizo *SubBot*");
          } else if (disconnectCode === DisconnectReason.timedOut) {
            await closeConnection(false);
            return console.log("\n Tiempo de conecion agotado, reconectando....");
          } else {
            console.log("\n Razon de la desconeccion desconocida: " + (disconnectCode || "") + " >> " + (connection || ""));
          }
        }

        if (global.db.data == null) {
          global.loadDatabase(); // Changed to global.loadDatabase()
        }

        if (connection == "open") {
          subBot.isInit = true;
          global.conns.push(subBot);
          await user.sendMessage(msg.chat, {
            text: args[0] ? " *Esta conectado(a)!! Por favor espere se esta¡ cargando los mensajes...*\n\n *Opciones Disponibles:*\n* " + usedPrefix + "pausarai _(Detener la funciÃ³n Sub Bot)_*\n*Â» " + usedPrefix + "deletesession _(Borrar todo rastro de Sub Bot)_*\n*Â» " + usedPrefix + "serbot _(Nuevo cÃ³digo QR o Conectarse si ya es Sub Bot)_*" : "*â€ ConexiÃ³n con Ã©xito al WhatsApp*"
          }, { quoted: msg });
          if (!args[0]) {
          }
        }
      }

      setInterval(async () => {
        if (!subBot.user) {
          try {
            subBot.ws.close();
          } catch (error) {
            console.log(await updateHandler(true).catch(console.error));
          }
          subBot.ev.removeAllListeners();
          let index = global.conns.indexOf(subBot);
          if (index < 0) {
            return;
          }
          delete global.conns[index];
          global.conns.splice(index, 1);
        }
      }, 60000);

      let handlerModule = await import("../handler.js");
      let updateHandler = async shouldReconnect => {
        try {
          const updatedModule = await import("../handler.js?update=" + Date.now()).catch(console.error);
          if (Object.keys(updatedModule || {}).length) {
            handlerModule = updatedModule;
          }
        } catch (error) {
          console.error(error);
        }
        if (shouldReconnect) {
          const chats = subBot.chats;
          try {
            subBot.ws.close();
          } catch {}
          subBot.ev.removeAllListeners();
          subBot = makeWASocket(config, { chats: chats });
          isConnected = true;
        }
        if (!isConnected) {
          subBot.ev.off("messages.upsert", subBot.handler);
          subBot.ev.off("connection.update", subBot.connectionUpdate);
          subBot.ev.off("creds.update", subBot.credsUpdate);
        }
        const currentTime = new Date();
        const lastEventTime = new Date(subBot.ev * 1000); // Assuming subBot.ev might be a timestamp
        if (currentTime.getTime() - lastEventTime.getTime() <= 300000) {
          console.log("Leyendo mensaje entrante:", subBot.ev);
          Object.keys(subBot.chats).forEach(chatId => {
            subBot.chats[chatId].isBanned = false;
          });
        } else {
          console.log(subBot.chats, " Omitiendo mensajes en espera.", subBot.ev);
          Object.keys(subBot.chats).forEach(chatId => {
            subBot.chats[chatId].isBanned = true;
          });
        }
        subBot.handler = handlerModule.handler.bind(subBot);
        subBot.connectionUpdate = handleConnectionUpdate.bind(subBot);
        subBot.credsUpdate = saveCreds.bind(subBot, true);
        subBot.ev.on("messages.upsert", subBot.handler);
        subBot.ev.on("connection.update", subBot.connectionUpdate);
        subBot.ev.on("creds.update", subBot.credsUpdate);
        isConnected = false;
        return true;
      };

      updateHandler(false);
    }

    initSubBot();
}

handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["serbot"];
handler.command = ["jadibot", "serbot", "code"];

export default handler;

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch || {})) {
    await conn.newsletterFollow(channelId).catch(() => { });
  }
}