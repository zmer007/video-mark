const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const path = require('path')
const fs = require('fs');

ipc.on('save-file', (event, data) => {
    try {
        const options = {
            title: '保存可玩配置文件',
            filters: [
                { name: 'zprofile', extensions: ['zprof'] }
            ]
        }
        dialog.showSaveDialog(options, function (filename) {
            if (filename) {
                fs.writeFileSync(filename, JSON.stringify(data), 'utf-8');
                event.sender.send('file-saved', filename);
            }
        })

    } catch (e) {
        event.sender.send('file-saved', 'save file failed')
    }
})