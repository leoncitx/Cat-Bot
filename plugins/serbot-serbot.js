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
import chalk from 'chalk'
import { makeWASocket } from "../lib/simple.js";

let rtx = `🌱 Escanea este código QR para conectarte como subbot.\n\n> I'm Fz ~`;
let rtx2 = `🌳 Introduce el siguiente código para convertirte en subbot.\n\n> Barboza ~`;

if (global.conns instanceof Array) {
  console.log();
} else {
  global.conns = [];
}

const MAX_SUBBOTS = 188;
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];

async function loadSubbots() {
  const serbotFolders = fs.readdirSync('./' + jadi);
  for (const folder of serbotFolders) {
    if (users.length >= MAX_SUBBOTS) {
    console.log(chalk.cyan(`☕ Límite de ${MAX_SUBBOTS} subbots alcanzado.`));
      break;
    }
    const folderPath = `./${jadi}/${folder}`;
    if (fs.statSync(folderPath).isDirectory()) {
      const { state, saveCreds } = await useMultiFileAuthState(folderPath);
      const { version } = await fetchLatestBaileysVersion();

      const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        auth: state,
        browser: [`Sylph`, "IOS", "4.1.0"],
      };

      let conn = makeWASocket(connectionOptions);
      conn.isInit = false;
      let isInit = true;

      let reconnectionAttempts = 0;
      async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin } = update;
        if (isNewLogin) {
          conn.isInit = true;
        }
        const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
          let i = global.conns.indexOf(conn);
          if (i < 0) return;
          delete global.conns[i];
          global.conns.splice(i, 1);
        }
if (connection == "open") {
let emoji = await remoji()
    conn.uptime = new Date();
    conn.isInit = true;
    global.conns.push(conn);
    console.log(chalk.green(`🌙 Subbot ${folder} conectado exitosamente.`));
    await joinChannels(conn)
    await react("https://whatsapp.com/channel/0029Va6InNBFCCoM9xzKFG3G/621", conn, emoji)
}

        if (connection === 'close' || connection === 'error') {
          reconnectionAttempts++;
          let waitTime = 1000;

          if (reconnectionAttempts > 4) waitTime = 10000;
          else if (reconnectionAttempts > 3) waitTime = 5000;
          else if (reconnectionAttempts > 2) waitTime = 3000;
          else if (reconnectionAttempts > 1) waitTime = 2000;

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
              conn.ev.on('group-participants.update', conn.participantsUpdate);
              conn.ev.on('creds.update', conn.credsUpdate);
              await creloadHandler(false);
            } catch (error) {
            console.log(chalk.red('Error durante la reconexión : ', error));    

            }
          }, waitTime);
        }
if (code === DisconnectReason.loggedOut) {
  if (fs.existsSync(folderPath)) {
    fs.rmdirSync(folderPath, { recursive: true });
    console.log(chalk.yellow(`Carpeta de credenciales eliminada para el subbot ${folder}.`));
  }
}
      }

      let handler = await import("../handler.js");

      let creloadHandler = async function (restatConn) {
        try {
          const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
          if (Object.keys(Handler || {}).length) handler = Handler;
        } catch (e) {
          console.error(e);
        }
        if (restatConn) {
          try {
            conn.ws.close();
          } catch {}
          conn.ev.removeAllListeners();
          conn = makeWASocket(connectionOptions);
          isInit = true;
        }
        if (!isInit) {
          conn.ev.off("messages.upsert", conn.handler);
          conn.ev.off("connection.update", conn.connectionUpdate);
          conn.ev.off('creds.update', conn.credsUpdate);
          conn.ev.off('group-participants.update', conn.participantsUpdate);
        }
        conn.handler = handler.handler.bind(conn);
        conn.connectionUpdate = connectionUpdate.bind(conn);
        conn.credsUpdate = saveCreds.bind(conn, true);
        conn.ev.on("messages.upsert", conn.handler);
        conn.ev.on('group-participants.update', conn.participantsUpdate);
        conn.ev.on("connection.update", conn.connectionUpdate);
        conn.ev.on("creds.update", conn.credsUpdate);
        isInit = false;
        return true;
      }
      creloadHandler(false);
    }
  }
}
await loadSubbots().catch(console.error);

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
 /* if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == conn.user.jid)) {
    return m.reply(`≡ 🍁 \`Este comando solo puede ser usado en el bot principal :\`\n\nwa.me/${global.conn.user.jid.split('@')[0]}?text=${usedPrefix}code`);
  }*/

  if (users.length >= MAX_SUBBOTS) {
    return conn.reply(m.chat, `*≡ Lo siento, se ha alcanzado el límite de ${MAX_SUBBOTS} subbots. Por favor, intenta más tarde.*`, m);
  }

  let user = conn;
  const isCode = command === "code" || (args[0] && /(--code|code)/.test(args[0].trim()));
  let code;
  let pairingCode;
  let qrMessage;
  let userData = global.db.data.users[m.sender];
let input = args[1] || args[0];
let userJid;

if (m.mentionedJid?.length) {
  userJid = m.mentionedJid[0];
} else if (input && /^\d{5,}$/.test(input.replace(/\D/g, ""))) {
  let cleaned = input.replace(/\D/g, "");
  userJid = `${cleaned}@s.whatsapp.net`;
} else if (m.fromMe) {
  userJid = user.user.jid;
} else {
  userJid = m.sender;
}
let userName = userJid.split("@")[0];



  if (isCode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim() || undefined;
    if (args[1]) {
      args[1] = args[1].replace(/^--code$|^code$/, "").trim();
    }
  }

  if (!fs.existsSync("./" + jadi + "/" + userName)) {
    fs.mkdirSync("./" + jadi + "/" + userName, { recursive: true });
  }

  if (args[0] && args[0] != undefined) {
try {
  const jsonString = Buffer.from(args[0], "base64").toString("utf-8");
  const jsonParsed = JSON.parse(jsonString);
  fs.writeFileSync(`./${jadi}/${userName}/creds.json`, JSON.stringify(jsonParsed, null, "\t"));
} catch (e) {
  return m.reply("≡ Ocurrió un error al procesar el código.\n\nPon *#delsesi* y luego ejecuta *#serbot --code* de nuevo.");
}
  } else {
    "";
  }
try {
  if (fs.existsSync("./" + jadi + "/" + userName + "/creds.json")) {
    let creds = JSON.parse(fs.readFileSync("./" + jadi + "/" + userName + "/creds.json"));
    if (creds) {
      if (creds.registered === false) {
        fs.unlinkSync("./" + jadi + "/" + userName + "/creds.json");
      }
    }
  }
} catch (e) {
  return m.reply(`≡ Ocurrió un error al procesar el código.\n\nPon *#delsesi* y luego ejecuta *#${command}* de nuevo.`);
}
    async function initSubBot() {
      if (!fs.existsSync("./" + jadi + "/" + userName)) {
        fs.mkdirSync("./" + jadi + "/" + userName, { recursive: true });
      }

      if (args[0]) {
        fs.writeFileSync("./" + jadi + "/" + userName + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));
      } else {
        "";
      }

      let { version, isLatest } = await fetchLatestBaileysVersion();
      const msgRetry = msgRetry => {};
      const cache = new nodeCache();
      const { state, saveState, saveCreds } = await useMultiFileAuthState("./" + jadi + "/" + userName);

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
        browser: isCode ? ["Ubuntu", "Chrome", "110.0.5585.95"] : ["Sylphiette", "Chrome", "2.0.0"],
        defaultQueryTimeoutMs: undefined,
        getMessage: async msgId => {
          if (store) {}
          return {
            conversation: "Sylph"
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
          qrMessage = await user.sendMessage(m.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: rtx,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          }, { quoted: m });
          return;
        }
        if (qr && isCode) {
          code = await user.sendMessage(m.chat, {
            text: rtx2,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          }, { quoted: m });


          await sleep(3000);
          pairingCode = await subBot.requestPairingCode(userName, "BARBOZAX")

          pairingCode = await user.sendMessage(m.chat, {
            text: pairingCode, 
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          }, { quoted: m });
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
            await fs.unlinkSync("./" + jadi + "/" + userName + "/creds.json");
            return await m.reply("≡ Reenvia nuevamente el comando.");
          }
          if (disconnectCode === DisconnectReason.restartRequired) {
            initSubBot();
            return console.log("\n≡ Tiempo de conexión agotado, reconectando...");
          } else if (disconnectCode === DisconnectReason.loggedOut) {
            fs.rmdirSync(`./${jadi}/${userName}`, { recursive: true });
            return m.reply("≡ *Conexión perdida...*");
          } else if (disconnectCode == 428) {
            await closeConnection(false);
            return m.reply("≡ La conexión se ha cerrado de manera inesperada, intentaremos reconectar...");
          } else if (disconnectCode === DisconnectReason.connectionLost) {
            await initSubBot();
            return console.log("\n≡Conexión perdida con el servidor, reconectando....");
          } else if (disconnectCode === DisconnectReason.badSession) {
            return await m.reply("≡ La conexión se ha cerrado, deberá de conectarse manualmente usando el comando *.serbot* o *.code*");
          } else if (disconnectCode === DisconnectReason.timedOut) {
            await closeConnection(false);
            return console.log("\n≡ Tiempo de conexión agotado, reconectando....");
          } else {
            console.log("\n🍂 Razón de la desconexión desconocida: " + (disconnectCode || "") + " >> " + (connection || ""));
          }
        }

        if (global.db.data == null) {
          loadDatabase();
        }

        if (connection == "open") {
        const emoj = await remoji()
          subBot.uptime = new Date();
          subBot.isInit = true;
          global.conns.push(subBot);
          await user.sendMessage(m.chat, {
            text: args[0] ? "🌙 *¡Está conectado!*\nPor favor espere se está cargando los mensajes..." : "¡Conectado con éxito!"
          }, { quoted: m })
await joinChannels(subBot)
await react("https://whatsapp.com/channel/0029Va6InNBFCCoM9xzKFG3G/621", subBot, emoj)
          if (!args[0]) {
            /* user.sendMessage(msg.chat, {
               text: usedPrefix + command + " " + Buffer.from(fs.readFileSync("./" + jadi + "/" + userName + "/creds.json"), "utf-8").toString("base64")
             }, { quoted: msg });*/
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
        const lastEventTime = new Date(subBot.ev * 1000);
        if (currentTime.getTime() - lastEventTime.getTime() <= 300000) {
          console.log("Leyendo mensaje entrante:", subBot.ev);
          Object.keys(subBot.chats).forEach(chatId => {
            subBot.chats[chatId].isBanned = false;
          });
        } else {
          //console.log(subBot.chats, "🚩 Omitiendo mensajes en espera.", subBot.ev);
          Object.keys(subBot.chats).forEach(chatId => {
            subBot.chats[chatId].isBanned = true;
          });
        }
        subBot.handler = handlerModule.handler.bind(subBot);
        subBot.connectionUpdate = handleConnectionUpdate.bind(subBot);
      //  subBot.participantsUpdate = handler.participantsUpdate.bind(global.conn);
        subBot.credsUpdate = saveCreds.bind(subBot, true);
        subBot.ev.on("messages.upsert", subBot.handler);
      //  conn.ev.on('group-participants.update', subBot.participantsUpdate);
        subBot.ev.on("connection.update", subBot.connectionUpdate);
        subBot.ev.on("creds.update", subBot.credsUpdate);
        isConnected = false;
        return true;
      };

      updateHandler(false);
    }
try {
    initSubBot();
  } catch(e) {
  m.reply(`Ocurrió un error. Intenta borra tu sesión usando: !delsesi y vuelve a intentarlo`)
  }
};

handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["serbot"];
handler.command = ["serbot", "code"];

export default handler;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function remoji() {
const emojis = ['🍰', '♥️', '🍓', '😛', '🍒', '🌱', '🍄', '🌺', '🌷', '🍷', '😈', '🙀', '😿', '😹'];
const em = emojis[Math.floor(Math.random() * emojis.length)];
return em
}
async function react(link, conn, emoji) {
try {
        const channelId = link.split('/')[4];
        const messageId = link.split('/')[5];
        const res = await conn.newsletterMetadata("invite", channelId);
        await conn.newsletterReactMessage(res.id, messageId, emoji);
        console.log(`Se envió exitosamente la reacción *${emoji}* al mensaje en el canal *${res.name}*.`);
    } catch (e) {
        console.log("No se pudo enviar la reacción. Asegúrese de que el enlace y el texto sean válidos: " + e)
    }
};

async function joinChannels(conn) {
await conn.newsletterFollow("120363375378707428@newsletter")
await conn.newsletterFollow("120363414007802886@newsletter")
conn.newsletterFollow("120363419364337473@newsletter")
}