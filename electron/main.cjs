const { app, BrowserWindow, dialog } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const { autoUpdater } = require('electron-updater')
const os = require('os')

let djangoProcess

function getFrontendPath() {
  if (app.isPackaged) {
    // Ruta para app empaquetada
    return path.join(process.resourcesPath, 'frontend', 'react-app', 'dist', 'index.html')
  } else {
    // Ruta para desarrollo
    return path.join(__dirname, '../frontend/react-app/dist/index.html')
  }
}

function createWindow() {
  const frontendPath = getFrontendPath()
  console.log('Intentando cargar frontend en:', frontendPath)
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
  // win.removeMenu()  // Comentado para poder ver el menú y abrir devtools
  win.webContents.openDevTools()  // Abre automáticamente las herramientas de desarrollador
  console.log('Ventana creada y frontend cargado.')
}

app.whenReady().then(() => {
  // Siempre intenta primero 'python3', luego 'python'
  let pythonPath = 'python3'
  if (process.platform === 'win32') {
    pythonPath = 'python'
  }

  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend')
    : path.join(__dirname, '../backend')

  // Solo verifica si requirements.txt existe, pero NO instala automáticamente
  const requirementsFile = path.join(backendPath, 'requirements.txt')
  if (!fs.existsSync(requirementsFile)) {
    dialog.showErrorBox(
      'Faltan dependencias',
      `No se encontró el archivo requirements.txt en:\n${requirementsFile}\nInstala las dependencias manualmente antes de usar la app.`
    )
    app.quit()
    return
  }

  // Arranca Django directamente (el usuario debe instalar dependencias antes)
  const venvPython = process.platform === 'win32'
    ? path.join(backendPath, 'venv', 'Scripts', 'python.exe')
    : path.join(backendPath, 'venv', 'bin', 'python')

  const pythonToUse = fs.existsSync(venvPython) ? venvPython : pythonPath

  // Carpeta temporal para logs
  const tempDir = os.tmpdir()
  const out = fs.openSync(path.join(tempDir, 'django_stdout.log'), 'a')
  const err = fs.openSync(path.join(tempDir, 'django_stderr.log'), 'a')

  djangoProcess = spawn(pythonToUse, ['manage.py', 'runserver', '127.0.0.1:8000'], {
    cwd: backendPath,
    stdio: ['ignore', out, err],
    env: { ...process.env }
  })
  djangoProcess.on('spawn', () => {
    console.log('Django iniciado correctamente.')
  })

  djangoProcess.on('error', (err) => {
    dialog.showErrorBox(
      'Error al iniciar Django',
      `No se pudo iniciar el servidor Django.\n\n${err.message}\n\n¿Están instaladas las dependencias de Python?`
    )
    app.quit()
  })

  // Inicia el chequeo de actualizaciones solo si la app está empaquetada
  if (app.isPackaged) {
    console.log('App empaquetada detectada, iniciando auto-updater...')
    
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...')
    })
    
    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info)
      dialog.showMessageBox({
        type: 'info',
        title: 'Actualización disponible',
        message: 'Hay una nueva versión disponible. Se descargará en segundo plano.'
      })
    })

    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available:', info)
    })

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info)
      dialog.showMessageBox({
        type: 'info',
        title: 'Actualización lista',
        message: 'La actualización está lista. La aplicación se reiniciará para aplicar los cambios.'
      }).then(() => {
        autoUpdater.quitAndInstall()
      })
    })

    autoUpdater.on('error', (err) => {
      console.error('Error en autoUpdater:', err)
      dialog.showErrorBox('Error de actualización', `Error: ${err.message}`)
    })

    // Chequear actualizaciones después de un delay
    setTimeout(() => {
      console.log('Iniciando chequeo de actualizaciones...')
      autoUpdater.checkForUpdatesAndNotify()
    }, 5000)
  } else {
    console.log('App en desarrollo, auto-updater deshabilitado')
  }

  setTimeout(createWindow, 3000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// al cerrar la app, mata Django
app.on('window-all-closed', () => {
  if (djangoProcess) djangoProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})
