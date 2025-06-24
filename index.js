
import { join, dirname} from 'path';
import { createRequire} from 'module';
import { fileURLToPath} from 'url';
import { setupMaster, fork} from 'cluster';
import { watchFile, unwatchFile, existsSync, mkdirSync} from 'fs';
import cfonts from 'cfonts';
import { createInterface} from 'readline';
import yargs from 'yargs/yargs';
import { hideBin} from 'yargs/helpers';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { name, description, author, version} = require(join(__dirname, './package.json'));
const { say} = cfonts;
const rl = createInterface(process.stdin, process.stdout);

// Verifica y crea carpetas necesarias
function verifyFolders() {
  const folders = ['tmp', 'Sesiones/Subbots', 'Sesiones/Principal'];
  for (const path of folders) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true});
      console.log(`📁 Carpeta creada: ${path}`);
}
}
}
verifyFolders();

// Mostrar banners
say('Barboza - Bot', {
  font: 'chrome',
  align: 'center',
  colors: ['white'],
});
say('Developed By • Barboza Ai', {
  font: 'console',
  align: 'center',
  colors: ['magenta'],
});

let isRunning = false;

function start(file) {
  if (isRunning) return;
  isRunning = true;

  const args = [join(__dirname, file),...process.argv.slice(2)];

  setupMaster({ exec: args[0], args: args.slice(1)});
  const p = fork();

  p.on('message', data => {
    if (data === 'reset') {
      p.kill();
      isRunning = false;
      start(file);
} else if (data === 'uptime') {
      p.send(process.uptime());
}
});

  p.on('exit', (code) => {
    isRunning = false;
    console.error(chalk.red(`🚩 El proceso terminó con código: ${code}`));
    if (code!== 0) {
      watchFile(args[0], () => {
        unwatchFile(args[0]);
        start(file);
});
}
});

  const opts = yargs(hideBin(process.argv)).exitProcess(false).parse();
  if (!opts['test'] && rl.listenerCount('line') === 0) {
    rl.on('line', (line) => {
      p.emit('message', line.trim());
});
}
}

process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('🚧 Demasiados Listeners agregados:');
    console.warn(warning.stack);
}
});

start('main.js');