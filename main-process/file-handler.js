const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const path = require('path')
const fs = require('fs-extra');

ipc.on('save-file', (event, data, videoPath) => {
    try {
        const options = {
            title: '保存可玩文件',
            filters: [{
                name: 'zprf',
                extensions: ['*']
            }]
        }
        dialog.showSaveDialog(options, function (filename) {
            if (filename) {
                // fs.writeFileSync(filename, data, 'utf-8');
                fs.mkdir(filename);
                exportFiles(filename, data, videoPath);
                event.sender.send('file-saved', filename);
            }
        })
    } catch (e) {
        event.sender.send('file-saved', 'save file failed')
    }
})

function exportFiles(outputDir, profileData, videoPath) {
    var isPortrait = profileData.indexOf('portrait') != -1;
    var videoBasename = path.basename(videoPath[0])
    var videoDir = path.dirname(videoPath[0])
    var videoName = videoBasename.substr(0, videoBasename.indexOf('.'))
    const posterName = 'poster.jpg';
    const bgmName = 'bgm.mp3';
    const playName = 'play.mp4';

    var playpageFile = fs.readFileSync(path.resolve(__dirname, '../assets/client-material/playable.html'), 'utf-8');
    var landpageFile = fs.readFileSync(path.resolve(__dirname, '../assets/client-material/playable-landpage.html'), 'utf-8');

    playpageFile = playpageFile.replace('bgm-src-holder', bgmName);
    playpageFile = playpageFile.replace('video-class-holder', isPortrait ? 'portrait-video' : 'landscape-video')
    playpageFile = playpageFile.replace('video-src-holder', playName)

    landpageFile = landpageFile.replace('background-img-src-holder', posterName)
    landpageFile = landpageFile.replace('background-img-class-holder', isPortrait ? 'portrait-video' : 'landscape-video')
    landpageFile = landpageFile.replace('download-btn-class-holder', isPortrait ? 'portrait-download' : 'landscape-download')
    landpageFile = landpageFile.replace('close-btn-class-holder', isPortrait ? 'portrait-close' : 'landscape-close')

    fs.writeFileSync(outputDir + '/playable.html', playpageFile, 'utf-8');
    fs.writeFileSync(outputDir + '/playable-landpage.html', landpageFile, 'utf-8');
    fs.writeFileSync(outputDir + '/zprf.js', profileData, 'utf-8');

    fs.copySync(path.resolve(__dirname, '../assets/client-material/close.png'), outputDir + '/close.png');
    fs.copySync(path.resolve(__dirname, '../assets/client-material/download.png'), outputDir + '/download.png');
    fs.copySync(path.resolve(__dirname, '../assets/client-material/main.js'), outputDir + '/main.js');
    fs.copySync(path.resolve(__dirname, '../assets/client-material/style.css'), outputDir + '/style.css');
    fs.copySync(videoDir + '/' + videoName + '.mp4', outputDir + '/' + playName)
    fs.copySync(videoDir + '/' + videoName + '.mp3', outputDir + '/' + bgmName)
    fs.copySync(videoDir + '/' + videoName + '.jpg', outputDir + '/' + posterName)
}

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