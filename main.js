const { app, BrowserWindow, screen, desktopCapturer} = require('electron')
const path = require('path');
const fs = require('fs');

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });

    setInterval(async () => {
        const displays = [screen.getPrimaryDisplay()];

        for (let display of displays) {
            const { width, height } = display.workAreaSize;
            const sources = await desktopCapturer.getSources({
                types: ['screen'],
                thumbnailSize: {
                    height,
                    width
                },
            });

            // get source for specific display
            const source = sources.find(source => source.display_id == display.id);

            if (!source) {
                continue;
            }

            let src = source.thumbnail.toJPEG(95);
            fs.writeFile(`${+new Date()}.jpg`, src, () => {});
        }
    }, 10000);
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
