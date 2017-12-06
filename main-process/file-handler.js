const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const path = require('path')
const fs = require('fs');

ipc.on('save-file', (event, data) => {
    try {
        const options = {
            title: '保存可玩配置文件',
            filters: [{
                name: 'zprf',
                extensions: ['js']
            }]
        }
        dialog.showSaveDialog(options, function (filename) {
            if (filename) {
                fs.writeFileSync(filename, data, 'utf-8');
                event.sender.send('file-saved', filename);
            }
        })

    } catch (e) {
        event.sender.send('file-saved', 'save file failed')
    }
})

ipc.on('open-file', (event) => {
    try {
        const options = {
            title: '选择可玩视频',
            properties: ['openFile', 'openDirectory'],
            filters: [{
                name: 'Movies',
                extensions: ['mkv', 'avi', 'mp4']
            }]
        }
        dialog.showOpenDialog(options, (filename) => {
            event.sender.send('file-opend', filename);
        })
    } catch (e) {
        event.sender.send('file-opend');
    }
})

ipc.on('cache-file', (event, filename, data) => {
    if (filename && data) {
        fs.writeFileSync(filename, JSON.stringify(data), 'utf-8');
        event.sender.send('file-cached', filename);
    }
})