const { exec } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';

const command = isWindows
  ? 'taskkill /F /IM node.exe'
  : "pkill -f 'node|nodemon'";

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.log('没有找到需要清理的进程');
    return;
  }
  console.log('已清理所有 Node 进程');
}); 