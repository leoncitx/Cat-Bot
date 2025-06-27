import {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import nodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from "pino";
import util from "util";
import {
  exec
} from "child_process";
import {
  makeWASocket
} from "../lib/simple.js";

const SESSION_DIR = "./sessions";
const MAX_SUBBOTS = 9999;
const RECONNECT_RETRIES = 3;
const RECONNECT_WAIT_TIME_MS = 1000;

const QR_MESSAGE = "*Convertirse en sub bot / JadiBot*\n\n*ðŸŒ¼ Utilice otro celular para escanear este codigo QR o escanea el codigo mediante una PC para convertirte en Sub Bot*\n\n`1` Â» Haga clic en los tres puntos en la esquina superior derecha\n\n`2` Â» Toca dispositivos vinculados\n\n`3` Â» Escanee este codigo QR para iniciar sesiÃ³n\n\nðŸŒ¼ *Este cÃ³digo QR expira en 45 segundos*";
const CODE_MESSAGE = "*Convertirse en sub bot / JadiBot*\n\n*ðŸŒ¼ Usa este CÃ³digo para convertirte en un Sub Bot*\n\n`1` Â» Haga clic en los tres puntos en la esquina superior derecha\n\n`2` Â» Toca dispositivos vinculados\n\n`3` Â» Selecciona Vincular con el nÃºmero de telÃ©fono\n\n`4` Â» Escriba el CÃ³digo\n\nðŸŒ¼ *Este cÃ³digo solo funciona en en el nÃºmero que lo solicitÃ³*";
const DISABLED_COMMAND_MESSAGE = "*ðŸŒ¼ Este Comando estÃ¡ deshabilitado por mi creador.*";
const MAX_SUBBOTS_REACHED_MESSAGE = `*â€ Lo siento, se ha alcanzado el lÃ­mite de ${MAX_SUBBOTS} subbots. Por favor, intenta mÃ¡s tarde.*`;
const CONNECTION_LOST_MESSAGE = "ðŸŒ¼ *ConexiÃ³n perdida...*";
const RECONNECTING_MESSAGE = "ðŸŒ¼ La conexiÃ³n se ha cerrado de manera inesperada, intentaremos reconectar...";
const BAD_SESSION_MESSAGE = "ðŸŒ¼ La conexiÃ³n se ha cerrado, deberÃ¡ de conectarse manualmente usando el comando *.serbot* y reescanear el nuevo *QR.* Que fuÃ© enviada la primera vez que se hizo *SubBot*";
const CONNECTED_MESSAGE_QR = "â€ *EstÃ¡ conectado(a)!! Por favor espere se estÃ¡ cargando los mensajes...*\n\nðŸŒ¼ *Opciones Disponibles:*\n*Â» %sdetener _(Detener la funciÃ³n Sub Bot)_*\n*Â» %seliminar_sesion _(Borrar todo rastro de Sub Bot)_*\n*Â» %sjadibot _(Nuevo cÃ³digo QR o Conectarse si ya es Sub Bot)_*";
const CONNECTED_MESSAGE_CODE = "*â€ ConexiÃ³n con Ã©xito al WhatsApp*";

if (!(global.conns instanceof Array)) {
  global.conns = [];
}

const baileysLogger = pino({
  level: "fatal"
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function normalizeJidToName(jid) {
  return jid.split('@')[0];
}

function cleanupSubbot(conn, folderPath, userName) {
  try {
    conn.ws.close();
    conn.ev.removeAllListeners();
  } catch (err) {
    console.error(`❌ Error al cerrar conexión de "${userName}":`, err);
  } finally {
    const index = global.conns.indexOf(conn);
    if (index > -1) {
      global.conns.splice(index, 1);
    }
    try {
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, {
          recursive: true,
          force: true
        });
        console.log(`🗑️ Carpeta de sesión de "${userName}" eliminada: ${folderPath}`);
      }
    } catch (err) {
      console.error(`❌ Error al eliminar carpeta de "${userName}":`, err);
    }
  }
}

async function loadExistingSubbots() {
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, {
      recursive: true
    });
  }

  const serbotFolders = fs.readdirSync(SESSION_DIR);
  let connectedCount = 0;

  for (const folder of serbotFolders) {
    if (global.conns.length >= MAX_SUBBOTS) {
      console.log(`*Límite de ${MAX_SUBBOTS} subbots alcanzado. No se cargarán más.*`);
      break;
    }

    const folderPath = path.join(SESSION_DIR, folder);
    const credsFilePath = path.join(folderPath, 'creds.json');

    if (!fs.statSync(folderPath).isDirectory() || !fs.existsSync(credsFilePath)) {
      continue;
    }

    let conn;
    let recAtts = 0;

    const connectSubbot = async () => {
      try {
        const {
          state,
          saveCreds
        } = await useMultiFileAuthState(folderPath);
        const {
          version
        } = await fetchLatestBaileysVersion();

        const connectionOptions = {
          version,
          keepAliveIntervalMs: 30000,
          printQRInTerminal: false,
          logger: baileysLogger,
          auth: state,
          browser: [`Dylux`, "IOS", "4.1.0"],
        };

        conn = makeWASocket(connectionOptions);
        conn.isInit = false;
        conn.folderName = folder;
        conn.recAtts = 0;

        let handler = await import("../handler.js");

        const connectionUpdate = async (update) => {
          const {
            connection,
            lastDisconnect,
            isNewLogin
          } = update;
          const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

          if (isNewLogin) {
            conn.isInit = true;
          }

          if (connection === "open") {
            conn.isInit = true;
            if (!global.conns.includes(conn)) {
              global.conns.push(conn);
            }
            connectedCount++;
            conn.recAtts = 0;
            console.log(`✅ Subbot "${folder}" conectado.`);
          }

          if (connection === 'close' || connection === 'error') {
            if (statusCode === DisconnectReason.loggedOut) {
              console.log(`📤 Subbot "${folder}" cerró sesión. Eliminando carpeta.`);
              cleanupSubbot(conn, folderPath, folder);
              return;
            }

            conn.recAtts++;
            if (conn.recAtts <= RECONNECT_RETRIES) {
              const waitTime = Math.min(60000, RECONNECT_WAIT_TIME_MS * (2 ** conn.recAtts));
              console.warn(`⚠️ Subbot "${folder}" desconectado (Intento ${conn.recAtts}/${RECONNECT_RETRIES}). Reintentando en ${waitTime / 1000}s...`);
              await delay(waitTime);
              await connectSubbot();
            } else {
              console.log(`🛑 Subbot "${folder}" falló tras ${RECONNECT_RETRIES} intentos. Eliminando carpeta.`);
              cleanupSubbot(conn, folderPath, folder);
            }
          }
        };

        const reloadHandler = async () => {
          try {
            const HandlerModule = await import(`../handler.js?update=${Date.now()}`);
            handler = HandlerModule;
          } catch (e) {
            console.error(`❌ Error al recargar handler para "${folder}":`, e);
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
        };

        await reloadHandler();
      } catch (err) {
        console.error(`❌ Error al iniciar subbot "${folder}":`, err);
        cleanupSubbot(conn, folderPath, folder);
      }
    };

    await connectSubbot();
  }
  console.log(`\n✅ Subbots conectados correctamente: ${connectedCount} / ${serbotFolders.length}`);
}

loadExistingSubbots().catch(console.error);

let handler = async (msg, {
  conn,
  args,
  usedPrefix,
  command
}) => {
  if (!global.db?.data?.settings?.[conn.user?.jid]?.jadibotmd) {
    return conn.reply(msg.chat, DISABLED_COMMAND_MESSAGE, msg, rcanal);
  }

  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, MAX_SUBBOTS_REACHED_MESSAGE, msg, rcanal);
  }

  const isCodeCommand = command === "code" || (args[0] && /(--code|code)/.test(args[0].trim()));
  const userJid = msg.sender;
  const userName = normalizeJidToName(userJid);
  const userSessionPath = path.join(SESSION_DIR, userName);
  const credsFilePath = path.join(userSessionPath, 'creds.json');

  if (!fs.existsSync(userSessionPath)) {
    fs.mkdirSync(userSessionPath, {
      recursive: true
    });
  }

  if (args[0] && !isCodeCommand) {
    try {
      const credsJson = JSON.parse(Buffer.from(args[0], "base64").toString("utf-8"));
      if (credsJson && typeof credsJson === 'object') {
        fs.writeFileSync(credsFilePath, JSON.stringify(credsJson, null, "\t"));
      } else {
        return conn.reply(msg.chat, "❌ Formato de credenciales inválido. Debe ser un JSON en base64.", msg);
      }
    } catch (e) {
      console.error("Error al decodificar o guardar credenciales:", e);
      return conn.reply(msg.chat, "❌ Error al procesar las credenciales proporcionadas. Asegúrate de que sean un JSON Base64 válido.", msg);
    }
  }

  if (fs.existsSync(credsFilePath)) {
    try {
      const creds = JSON.parse(fs.readFileSync(credsFilePath, 'utf-8'));
      if (creds?.registered === false) {
        fs.unlinkSync(credsFilePath);
        console.log(`🗑️ Credenciales inválidas para "${userName}" eliminadas.`);
      }
    } catch (e) {
      console.error(`Error al leer creds.json para "${userName}":`, e);
      fs.unlinkSync(credsFilePath);
    }
  }

  async function initNewSubBot() {
    let subBot;
    let qrMessageId;
    let pairingCodeMessageId;

    try {
      const {
        version
      } = await fetchLatestBaileysVersion();
      const cache = new nodeCache();
      const {
        state,
        saveCreds
      } = await useMultiFileAuthState(userSessionPath);

      const config = {
        printQRInTerminal: false,
        logger: pino({
          level: "silent"
        }),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({
            level: "silent"
          }))
        },
        msgRetry: msgRetry => {},
        msgRetryCache: cache,
        version: version,
        syncFullHistory: true,
        browser: isCodeCommand ? ["Ubuntu", "Chrome", "110.0.5585.95"] : [`${global.botname || "Bot"} (Sub Bot)`, "Chrome", "2.0.0"],
        defaultQueryTimeoutMs: undefined,
        getMessage: async msgId => {
          return {
            conversation: `${global.botname || "Bot"}-MD`
          };
        }
      };

      subBot = makeWASocket(config);
      subBot.isInit = false;
      subBot.folderName = userName;
      subBot.recAtts = 0;

      let handlerModule = await import("../handler.js");

      const handleSubbotConnectionUpdate = async (update) => {
        const {
          connection,
          lastDisconnect,
          isNewLogin,
          qr
        } = update;
        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

        if (isNewLogin) {
          subBot.isInit = true;
        }

        if (qr && !isCodeCommand) {
          if (qrMessageId) {
            await conn.sendMessage(msg.chat, {
              image: await qrcode.toBuffer(qr, {
                scale: 8
              }),
              caption: QR_MESSAGE,
            }, {
              quoted: msg,
              edit: qrMessageId.key
            });
          } else {
            qrMessageId = await conn.sendMessage(msg.chat, {
              image: await qrcode.toBuffer(qr, {
                scale: 8
              }),
              caption: QR_MESSAGE,
              contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363375378707428@newsletter',
                  newsletterName: 'Barboza',
                  serverMessageId: -1
                }
              }
            }, {
              quoted: msg
            });
          }
          return;
        }

        if (qr && isCodeCommand) {
          if (pairingCodeMessageId) {
            await conn.sendMessage(msg.chat, {
              text: CODE_MESSAGE,
            }, {
              quoted: msg,
              edit: pairingCodeMessageId.key
            });
          } else {
            pairingCodeMessageId = await conn.sendMessage(msg.chat, {
              text: CODE_MESSAGE,
              contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363375378707428@newsletter',
                  newsletterName: 'barboza',
                  serverMessageId: -1
                }
              }
            }, {
              quoted: msg
            });
          }

          await delay(3000);
          const pairingCode = await subBot.requestPairingCode(userJid.split`@`[0]);

          if (pairingCodeMessageId) {
            await conn.sendMessage(msg.chat, {
              text: pairingCode
            }, {
              quoted: msg,
              edit: pairingCodeMessageId.key
            });
          } else {
            pairingCodeMessageId = await conn.sendMessage(msg.chat, {
              text: pairingCode,
              contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363375378707428@newsletter',
                  newsletterName: 'Barboza',
                  serverMessageId: -1
                }
              }
            }, {
              quoted: msg
            });
          }
        }

        if (connection === "open") {
          subBot.isInit = true;
          if (!global.conns.includes(subBot)) {
            global.conns.push(subBot);
          }
          const replyMessage = util.format(args[0] ? CONNECTED_MESSAGE_QR : CONNECTED_MESSAGE_CODE, usedPrefix, usedPrefix, usedPrefix);
          await conn.sendMessage(msg.chat, {
            text: replyMessage
          }, {
            quoted: msg
          });
        }

        if (connection === "close") {
          console.log(`Subbot "${userName}" cerrado. Código: ${statusCode}`);

          switch (statusCode) {
            case DisconnectReason.connectionClosed:
            case DisconnectReason.connectionLost:
            case DisconnectReason.restartRequired:
              console.log(`Reconectando subbot "${userName}"...`);
              subBot.recAtts++;
              if (subBot.recAtts <= RECONNECT_RETRIES) {
                const waitTime = Math.min(60000, RECONNECT_WAIT_TIME_MS * (2 ** subBot.recAtts));
                console.warn(`Reintentando conexión para "${userName}" en ${waitTime / 1000}s...`);
                await delay(waitTime);
                initNewSubBot();
              } else {
                conn.reply(msg.chat, `🛑 Subbot "${userName}" falló tras ${RECONNECT_RETRIES} intentos de reconexión. Eliminando sesión.`, msg);
                cleanupSubbot(subBot, userSessionPath, userName);
              }
              break;
            case DisconnectReason.loggedOut:
              conn.reply(msg.chat, `📤 Subbot "${userName}" cerró sesión. Eliminando datos.`, msg);
              cleanupSubbot(subBot, userSessionPath, userName);
              break;
            case 405:
              await conn.reply(msg.chat, "â€ Reenvia nuevamente el comando.", msg);
              cleanupSubbot(subBot, userSessionPath, userName);
              break;
            case DisconnectReason.badSession:
              conn.reply(msg.chat, BAD_SESSION_MESSAGE, msg);
              cleanupSubbot(subBot, userSessionPath, userName);
              break;
            case 428:
              conn.reply(msg.chat, RECONNECTING_MESSAGE, msg);
              subBot.recAtts++;
              if (subBot.recAtts <= RECONNECT_RETRIES) {
                const waitTime = Math.min(60000, RECONNECT_WAIT_TIME_MS * (2 ** subBot.recAtts));
                await delay(waitTime);
                initNewSubBot();
              } else {
                cleanupSubbot(subBot, userSessionPath, userName);
              }
              break;
            default:
              console.log(`\nðŸŒ¼ RazÃ³n de la desconexiÃ³n desconocida para "${userName}": ${statusCode || ""} >> ${connection || ""}`);
              break;
          }
        }
      };

      const reloadSubbotHandler = async () => {
        try {
          const updatedModule = await import(`../handler.js?update=${Date.now()}`);
          handlerModule = updatedModule;
        } catch (error) {
          console.error(`❌ Error al recargar handler para subbot "${userName}":`, error);
        }

        if (!subBot.isInit) {
          subBot.ev.off("messages.upsert", subBot.handler);
          subBot.ev.off("connection.update", subBot.connectionUpdate);
          subBot.ev.off("creds.update", subBot.credsUpdate);
        }

        subBot.handler = handlerModule.handler.bind(subBot);
        subBot.connectionUpdate = handleSubbotConnectionUpdate.bind(subBot);
        subBot.credsUpdate = saveCreds.bind(subBot, true);

        subBot.ev.on("messages.upsert", subBot.handler);
        subBot.ev.on("connection.update", subBot.connectionUpdate);
        subBot.ev.on("creds.update", subBot.credsUpdate);
      };

      setInterval(async () => {
        if (!subBot.user && !subBot.isInit) {
          console.log(`⚠️ Subbot "${userName}" inactivo o desconectado. Intentando reconectar.`);
          cleanupSubbot(subBot, userSessionPath, userName);
        }
      }, 60000);

      await reloadSubbotHandler();
    } catch (err) {
      console.error(`❌ Error general al inicializar subbot para "${userName}":`, err);
      conn.reply(msg.chat, `❌ Error al iniciar tu subbot. Por favor, inténtalo de nuevo o contacta al soporte.`, msg);
      cleanupSubbot(subBot, userSessionPath, userName);
    }
  }

  await initNewSubBot();
};

handler.help = ["serbot", "serbot --code", "code"];
handler.tags = ["serbot"];
handler.command = ["jadibot", "serbot", "code"];

export default handler;

async function joinChannels(conn) {
  try {
    await conn.newsletterFollow("120363414007802886@newsletter");
    await conn.newsletterFollow("120363419364337473@newsletter");
    console.log("✅ Subbot unido a los canales de newsletter.");
  } catch (e) {
    console.error("❌ Error al unirse a canales de newsletter:", e);
  }
}