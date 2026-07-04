const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    width: 512, 
    height: 512, 
    show: false, 
    transparent: true, 
    frame: false 
  });
  
  const svg = fs.readFileSync(path.join(__dirname, '../typetrace-website/public/favicon.svg'), 'utf8');
  
  // Replace the viewBox size with explicit 512x512
  const resizedSvg = svg.replace('width="32"', 'width="512"').replace('height="32"', 'height="512"');
  
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; overflow: hidden; background: transparent;">
        ${resizedSvg}
      </body>
    </html>
  `;
  
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  
  setTimeout(async () => {
    const image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(__dirname, 'build/icon.png'), image.toPNG());
    console.log('Icon successfully rendered and saved to build/icon.png');
    app.quit();
  }, 1000);
});
