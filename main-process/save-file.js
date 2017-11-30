const ipc = require('electron').ipcMain
const path = require('path')
const fs = require('fs');

ipc.on('save-file', (event, data) => {
    try {
        fs.writeFileSync(path.join(__dirname, "/data.json"), JSON.stringify(data), 'utf-8');
        event.sender.send('file-saved', path.join(__dirname, "/data.json"));
    } catch (e) {
        console.log(e)
        event.sender.send('file-saved', 'save file failed')
    }
})