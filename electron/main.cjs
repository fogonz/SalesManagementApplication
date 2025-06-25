const { app, BrowserWindow, dialog } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

let djangoProcess

function createWindow() {
  const frontendPath = path.join(__dirname, '../frontend/react-app/dist/index.html')
  if (!fs.existsSync(frontendPath)) {
    dialog.showErrorBox(
      'Frontend no encontrado',
      `No se encontró el archivo:\n${frontendPath}\n\nEjecuta 'npm run build' en el frontend antes de empaquetar.`
    )
    app.quit()
    return
  }
  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: { nodeIntegration: false }
  })
  win.loadFile(frontendPath)
  win.removeMenu()
}

app.whenReady().then(() => {
  // 1) Arranca Django
  djangoProcess = spawn('python3', ['manage.py', 'runserver', '127.0.0.1:8000'], {
    cwd: path.join(__dirname, '../backend'),
    stdio: 'inherit'
  })
  djangoProcess.on('error', (err) => {
    dialog.showErrorBox(
      'Error al iniciar Django',
      `No se pudo iniciar el servidor Django.\n\n${err.message}\n\n¿Está Python3 instalado?`
    )
    app.quit()
  })

  // 2) Cuando Django esté listo (puedes sincronizar con delay o chequeo), abres ventana
  setTimeout(createWindow, 3000)  // ajustar según lo lento que arranque

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// al cerrar la app, mata Django
app.on('window-all-closed', () => {
  if (djangoProcess) djangoProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})
