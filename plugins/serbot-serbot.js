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
import { makeWASocket } from "../lib/simple.js"; // Asegúrate de que esta ruta sea correcta
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
let rtx = "*Convertirse en sub bot✨ / JadiBot*\n\n*ðŸŒ¼ Utilice otro celular para escanear este codigo QR o escanea el codigo mediante una PC para convertirte en Sub Bot*\n\n`1` Â» Haga clic en los tres puntos en la esquina superior derecha\n\n`2` Â» Toca dispositivos vinculados\n\n`3` Â» Escanee este codigo QR para iniciar sesiÃ³n\n\nðŸŒ¼ *Este cÃ³digo QR expira en 45 segundos*";
let rtx2 = "*Convertirse en sub bot✨ / JadiBot*\n\n*ðŸŒ¼ Usa este CÃ³digo para convertirte en un Sub Bot*\n\n`1` Â» Haga clic en los tres puntos en la esquina superior derecha\n\n`2` Â» Toca dispositivos vinculados\n\n`3` Â» Selecciona Vincular con el nÃºmero de telÃ©fono\n\n`4` Â» Escriba el CÃ³digo\n\nðŸŒ¼ *Este cÃ³digo solo funciona en en el nÃºmero que lo solicitÃ³*";

// Inicializa global.conns si no existe
if (!global.conns) {
  global.conns = [];
}

const MAX_SUBBOTS = 9999;
const RECONNECT_ATTEMPTS = 5; // Número máximo de intentos de reconexión
const RECONNECT_INTERVAL = 5000; // Intervalo inicial de reconexión en ms
const MAX_RECONNECT_WAIT = 60000; // Tiempo máximo de espera entre reconexiones

// Variable global para almacenar el módulo handler
let globalHandler;

// Función para cargar dinámicamente el handler
async function loadHandlerModule() {
  try {
    // Usar un parámetro de consulta para forzar la recarga del módulo
    const handlerModule = await import(`../handler.js?update=${Date.now()}`);
    if (Object.keys(handlerModule || {}).length) {
      globalHandler = handlerModule;
    }
  } catch (e) {
    console.error("❌ Error al cargar el módulo handler:", e);
  }
}

// Cargar el handler inicialmente
loadHandlerModule();


// Función para recargar handlers de todos los sub-bots
async function reloadAllSubbotHandlers() {
  await loadHandlerModule(); // Recargar el módulo principal
  for (const conn of global.conns) {
    if (conn && conn.ev) {
      conn.ev.off("messages.upsert", conn.handler);
      conn.ev.off("connection.update", conn.connectionUpdate);
      conn.ev.off("creds.update", conn.credsUpdate);

      conn.handler = globalHandler.handler.bind(conn);
      conn.connectionUpdate = conn.connectionUpdate.bind(conn); // La función ya está vinculada en el init
      conn.credsUpdate = conn.credsUpdate.bind(conn); // La función ya está vinculada en el init

      conn.ev.on("messages.upsert", conn.handler);
      conn.ev.on("connection.update", conn.connectionUpdate);
      conn.ev.on("creds.update", conn.credsUpdate);
    }
  }
}


async function loadSubbots() {
  const jadiPath = './' + (typeof jadi !== 'undefined' ? jadi : 'sessions'); // Asegúrate de que 'jadi' esté definida o usa un valor por defecto
  if (!fs.existsSync(jadiPath)) {
    fs.mkdirSync(jadiPath, { recursive: true });
  }

  const serbotFolders = fs.readdirSync(jadiPath);
  let totalC = 0;

  for (const folder of serbotFolders) {
    if (global.conns.length >= MAX_SUBBOTS) {
      console.log(`*Límite de ${MAX_SUBBOTS} subbots alcanzado. No se cargarán más.*`);
      break;
    }

    const folderPath = path.join(jadiPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const { state, saveCreds } = await useMultiFileAuthState(folderPath);
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
      version,
      keepAliveIntervalMs: 30000,
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
      },
      browser: [`Dylux`, "IOS", "4.1.0"],
      // Añadir la configuración para el auto-reintento de mensajes
      getMessage: async key => {
        // Implementar lógica para recuperar mensajes si es necesario
        return {
          conversation: "Bot-MD"
        };
      }
    };

    let conn = makeWASocket(connectionOptions);
    conn.isInit = false;
    let recAtts = 0; // Intentos de reconexión para este subbot

    // Asegurarse de que las funciones estén vinculadas al 'conn' correcto
    conn.handler = globalHandler ? globalHandler.handler.bind(conn) : undefined;
    conn.connectionUpdate = async function(update) {
      const { connection, lastDisconnect, isNewLogin } = update;
      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

      if (isNewLogin) conn.isInit = true;

      if (connection === "open") {
        conn.isInit = true;
        // Solo añade a global.conns si no está ya presente
        if (!global.conns.some(c => c.user && c.user.id === conn.user.id)) {
          global.conns.push(conn);
        }
        totalC++;
        recAtts = 0; // Resetear intentos al conectar
        console.log(`✅ Subbot "${folder}" conectado.`);
      }

      if (connection === 'close') {
        if (code === DisconnectReason.loggedOut || code === 401) { // 401: Unauthorized
          console.log(`📤 Subbot "${folder}" cerró sesión o credenciales inválidas. Eliminando carpeta.`);
          try {
            fs.rmSync(folderPath, { recursive: true, force: true });
          } catch (err) {
            console.error(`❌ Error al eliminar carpeta de "${folder}":`, err);
          }
          // Eliminar de global.conns
          global.conns = global.conns.filter(c => c !== conn);
          return;
        }

        if (recAtts < RECONNECT_ATTEMPTS) {
          recAtts++;
          const waitTime = Math.min(MAX_RECONNECT_WAIT, RECONNECT_INTERVAL * Math.pow(2, recAtts - 1));
          console.warn(`⚠️ Subbot "${folder}" desconectado (${code || connection}). Intento ${recAtts}/${RECONNECT_ATTEMPTS}. Reintentando en ${waitTime / 1000}s...`);

          setTimeout(async () => {
            try {
              // Limpiar listeners antes de reintentar
              conn.ev.removeAllListeners();
              // Crear una nueva instancia de makeWASocket
              const newConn = makeWASocket(connectionOptions);
              // Copiar propiedades importantes
              Object.assign(conn, newConn);
              conn.handler = globalHandler.handler.bind(conn);
              conn.connectionUpdate = conn.connectionUpdate.bind(conn); // Re-vincular
              conn.credsUpdate = saveCreds.bind(conn, true);
              conn.ev.on('messages.upsert', conn.handler);
              conn.ev.on('connection.update', conn.connectionUpdate);
              conn.ev.on('creds.update', conn.credsUpdate);
            } catch (err) {
              console.error(`❌ Error al reintentar conexión con "${folder}":`, err);
            }
          }, waitTime);
        } else {
          console.error(`🛑 Subbot "${folder}" falló tras ${RECONNECT_ATTEMPTS} intentos. Eliminando carpeta.`);
          try {
            fs.rmSync(folderPath, { recursive: true, force: true });
          } catch (err) {
            console.error(`❌ Error al eliminar carpeta de "${folder}":`, err);
          }
          // Eliminar de global.conns
          global.conns = global.conns.filter(c => c !== conn);
        }
      }
    }.bind(conn); // Asegúrate de vincular 'this' a 'conn' para connectionUpdate

    conn.credsUpdate = saveCreds.bind(conn, true);

    if (conn.handler) {
      conn.ev.on("messages.upsert", conn.handler);
    } else {
      console.warn(`⚠️ Handler no cargado para "${folder}" al inicio.`);
    }
    conn.ev.on("connection.update", conn.connectionUpdate);
    conn.ev.on("creds.update", conn.credsUpdate);
  }

  console.log(`\n✅ Subbots conectados y cargados: ${totalC} / ${serbotFolders.length}`);
}

// Cargar subbots al iniciar
loadSubbots().catch(console.error);

let handler = async (msg, { conn, args, usedPrefix, command, isOwner }) => {
  if (!global.db.data.settings[conn.user.jid].jadibotmd) {
    return conn.reply(msg.chat, "*ðŸŒ¼ Este Comando estÃ¡ deshabilitado por mi creador.*", msg, rcanal);
  }

  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, `*â€ Lo siento, se ha alcanzado el lÃ­mite de ${MAX_SUBBOTS} subbots. Por favor, intenta mÃ¡s tarde.*`, msg, rcanal);
  }

  let user = conn;
  const isCode = command === "code" || (args[0] && /(--code|code)/.test(args[0].trim()));
  let code;
  let pairingCode;
  let qrMessage;
  let userData = global.db.data.users[msg.sender];
  let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? user.user.jid : msg.sender;
  let userName = "" + userJid.split`@`[0];
  const jadiPath = './' + (typeof jadi !== 'undefined' ? jadi : 'sessions'); // Asegúrate de que 'jadi' esté definida

  if (isCode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim() || undefined;
    if (args[1]) {
      args[1] = args[1].replace(/^--code$|^code$/, "").trim();
    }
  }

  if (!fs.existsSync(path.join(jadiPath, userName))) {
    fs.mkdirSync(path.join(jadiPath, userName), { recursive: true });
  }

  if (args[0] && args[0] != undefined) {
    try {
      fs.writeFileSync(path.join(jadiPath, userName, "creds.json"), JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));
    } catch (e) {
      console.error("Error al escribir credenciales desde base64:", e);
      return conn.reply(msg.chat, "❌ Formato de credenciales inválido. Por favor, asegúrate de que el código sea correcto.", msg);
    }
  }

  if (fs.existsSync(path.join(jadiPath, userName, "creds.json"))) {
    try {
      let creds = JSON.parse(fs.readFileSync(path.join(jadiPath, userName, "creds.json")));
      if (creds && creds.registered === false) {
        fs.unlinkSync(path.join(jadiPath, userName, "creds.json"));
      }
    } catch (e) {
      console.error("Error al leer o parsear creds.json:", e);
      fs.unlinkSync(path.join(jadiPath, userName, "creds.json")); // Eliminar archivo corrupto
      return conn.reply(msg.chat, "❌ Error en el archivo de credenciales. Intenta de nuevo.", msg);
    }
  }

  const execCommand = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64");
  exec(execCommand.toString("utf-8"), async (error, stdout, stderr) => {
    const secret = Buffer.from(drm1 + drm2, "base64");

    async function initSubBot() {
      let userJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.fromMe ? user.user.jid : msg.sender;
      let userName = "" + userJid.split`@`[0];

      const userFolderPath = path.join(jadiPath, userName);

      if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
      }

      if (args[0]) {
        try {
          fs.writeFileSync(path.join(userFolderPath, "creds.json"), JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));
        } catch (e) {
          console.error("Error al escribir credenciales desde base64 en initSubBot:", e);
          return conn.reply(msg.chat, "❌ Formato de credenciales inválido. Por favor, asegúrate de que el código sea correcto.", msg);
        }
      }

      let { version } = await fetchLatestBaileysVersion();
      const msgRetry = msgRetry => {}; // Función dummy, puedes implementarla si la necesitas
      const cache = new nodeCache();
      const { state, saveCreds } = await useMultiFileAuthState(userFolderPath);

      const config = {
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        msgRetry: msgRetry,
        msgRetryCache: cache,
        version: version, // Usar la versión obtenida
        syncFullHistory: true,
        browser: isCode ? ["Ubuntu", "Chrome", "110.0.5585.95"] : ["${botname} (Sub Bot)", "Chrome", "2.0.0"],
        defaultQueryTimeoutMs: undefined,
        getMessage: async msgId => {
          // Implementar si necesitas recuperar mensajes por ID
          return {
            conversation: "${botname}Bot-MD"
          };
        }
      };

      let subBot = makeWASocket(config);
      subBot.isInit = false;
      let isConnected = true;
      let reconnectAttempts = 0; // Intentos de reconexión para la sesión actual

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

          await sleep(3000);
          pairingCode = await subBot.requestPairingCode(msg.sender.split`@`[0]);

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

        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;

        if (connection === "close") {
          console.log(`⚠️ Subbot "${userName}" desconectado. Código: ${statusCode || lastDisconnect?.error?.message}`);

          // Manejar casos específicos de desconexión
          if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
            console.log(`📤 Subbot "${userName}" cerró sesión o credenciales inválidas. Eliminando carpeta.`);
            try {
              fs.rmSync(userFolderPath, { recursive: true, force: true });
            } catch (err) {
              console.error(`❌ Error al eliminar carpeta de "${userName}":`, err);
            }
            // Eliminar de global.conns
            global.conns = global.conns.filter(c => c !== subBot);
            return msg.reply("ðŸŒ¼ *ConexiÃ³n perdida (sesión cerrada o inválida). Intenta de nuevo con *.jadibot*", msg);
          } else if (statusCode === 405) { // Method Not Allowed (posiblemente credenciales corruptas)
             await fs.unlinkSync(path.join(userFolderPath, "creds.json"));
             return await msg.reply("â€ Reenvia nuevamente el comando (credenciales corruptas detectadas).");
          } else if (statusCode === DisconnectReason.restartRequired || statusCode === DisconnectReason.connectionLost || statusCode === DisconnectReason.timedOut || statusCode === 428) {
            // Reintentar conexión para estos casos
            if (reconnectAttempts < RECONNECT_ATTEMPTS) {
              reconnectAttempts++;
              const waitTime = Math.min(MAX_RECONNECT_WAIT, RECONNECT_INTERVAL * Math.pow(2, reconnectAttempts - 1));
              console.log(`Reconectando subbot "${userName}" en ${waitTime / 1000}s... (Intento ${reconnectAttempts}/${RECONNECT_ATTEMPTS})`);
              setTimeout(() => {
                subBot.ev.removeAllListeners();
                initSubBot(); // Reiniciar la conexión
              }, waitTime);
            } else {
              console.error(`🛑 Subbot "${userName}" falló tras ${RECONNECT_ATTEMPTS} intentos de reconexión. Eliminando carpeta.`);
              try {
                fs.rmSync(userFolderPath, { recursive: true, force: true });
              } catch (err) {
                console.error(`❌ Error al eliminar carpeta de "${userName}":`, err);
              }
              global.conns = global.conns.filter(c => c !== subBot);
              return msg.reply("ðŸŒ¼ *La conexión del Sub Bot se ha cerrado permanentemente después de múltiples intentos fallidos.*", msg);
            }
          } else {
            console.log("\nðŸŒ¼ RazÃ³n de la desconexiÃ³n desconocida: " + (statusCode || "") + " >> " + (connection || ""));
            // En caso de desconexión desconocida, también podemos intentar reiniciar
            if (reconnectAttempts < RECONNECT_ATTEMPTS) {
              reconnectAttempts++;
              const waitTime = Math.min(MAX_RECONNECT_WAIT, RECONNECT_INTERVAL * Math.pow(2, reconnectAttempts - 1));
              console.log(`Reconectando subbot "${userName}" en ${waitTime / 1000}s... (Intento ${reconnectAttempts}/${RECONNECT_ATTEMPTS})`);
              setTimeout(() => {
                subBot.ev.removeAllListeners();
                initSubBot(); // Reiniciar la conexión
              }, waitTime);
            } else {
              console.error(`🛑 Subbot "${userName}" falló tras ${RECONNECT_ATTEMPTS} intentos de reconexión por razón desconocida. Eliminando carpeta.`);
              try {
                fs.rmSync(userFolderPath, { recursive: true, force: true });
              } catch (err) {
                console.error(`❌ Error al eliminar carpeta de "${userName}":`, err);
              }
              global.conns = global.conns.filter(c => c !== subBot);
              return msg.reply("ðŸŒ¼ *La conexión del Sub Bot se ha cerrado permanentemente.*", msg);
            }
          }
        }

        if (global.db.data == null) {
          // Si tu base de datos necesita ser cargada, asegúrate de que 'loadDatabase' esté definida
          // loadDatabase();
        }

        if (connection == "open") {
          subBot.isInit = true;
          // Añadir a global.conns solo si no está ya presente
          if (!global.conns.some(c => c.user && c.user.id === subBot.user.id)) {
            global.conns.push(subBot);
          }
          reconnectAttempts = 0; // Resetear intentos al conectar con éxito
          await user.sendMessage(msg.chat, {
            text: args[0] ? "â€ *EstÃ¡ conectado(a)!! Por favor espere se estÃ¡ cargando los mensajes...*\n\nðŸŒ¼ *Opciones Disponibles:*\n*Â» " + usedPrefix + "pausarai _(Detener la funciÃ³n Sub Bot)_*\n*Â» " + usedPrefix + "deletesession _(Borrar todo rastro de Sub Bot)_*\n*Â» " + usedPrefix + "serbot _(Nuevo cÃ³digo QR o Conectarse si ya es Sub Bot)_*" : "*â€ ConexiÃ³n con Ã©xito al WhatsApp*"
          }, { quoted: msg });
        }
      }

      // Vuelve a cargar el handler si no está definido (posiblemente un rein