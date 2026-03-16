import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// ─── Kural 1: Global değişkenler — Garbage Collection koruması ───────────────
// Bu değişkenler ASLA fonksiyon içinde const/let ile tanımlanmamalı.
// Global scope'ta tutmak Electron'un bunları hafızadan silmesini engeller.
let mainWindow = null
let splashWindow = null

// ─── Splash Penceresi ─────────────────────────────────────────────────────────
function createSplashWindow() {
  const splashStartTime = Date.now()

  splashWindow = new BrowserWindow({
    width: 500,
    height: 400,
    frame: false,
    transparent: true,
    backgroundColor: '#FFF9F2',
    resizable: false,
    movable: true,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    icon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    }
  })

  splashWindow.loadFile(join(__dirname, '../../resources/splash.html'))
  splashWindow.once('ready-to-show', () => splashWindow.show())

  return splashStartTime
}

// ─── Ana Pencere ──────────────────────────────────────────────────────────────
function createMainWindow(splashStartTime = Date.now()) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'MANE',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
    }
  })

  // ─── Kural 2: Tüm renderer hatalarını yakala ─────────────────────────────
  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    console.log('[MANE] Yükleme hatası:', code, desc)
  })
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    console.log('[MANE] React çöktü! Sebep:', details.reason, '| ExitCode:', details.exitCode)
  })
  mainWindow.webContents.on('unresponsive', () => {
    console.log('[MANE] Renderer yanıt vermiyor!')
  })

  // ─── Geçiş: toplam 5 saniye splash garantisi ─────────────────────────────
  // ready-to-show tetiklenince kalan süreyi hesapla; mainWindow.show() ÖNCE,
  // splashWindow.close() SONRA çalışır — bu sıra window-all-closed'ı önler.
  mainWindow.once('ready-to-show', () => {
    const elapsed = Date.now() - splashStartTime
    const remainingTime = Math.max(5000 - elapsed, 0)
    console.log(`[MANE] ready-to-show — elapsed: ${elapsed}ms, beklenen: ${remainingTime}ms`)

    setTimeout(() => {
      if (!mainWindow || mainWindow.isDestroyed()) return
      
      mainWindow.show()
      
      // splash kapatma — mainWindow gösterildikten sonra
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close()
        // splashWindow = null // GC'ye yardım et
      }
      
      mainWindow.focus()
      console.log('[MANE] mainWindow gösterildi ve odaklandı')
    }, remainingTime)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // ─── URL Yükleme (.catch ile güvenli) ────────────────────────────────────
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
      .catch(err => console.log('[MANE] Vite bağlantısı bekleniyor...', err.message))
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
      .catch(err => console.log('[MANE] index.html yüklenemedi:', err.message))
  }
}

// ─── Uygulama Hazır ──────────────────────────────────────────────────────────
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  const splashStartTime = createSplashWindow()
  createMainWindow(splashStartTime)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const st = createSplashWindow()
      createMainWindow(st)
    }
  })
})

app.on('window-all-closed', () => {
  console.log('[MANE] Tüm pencereler kapatıldı')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Yakalanamayan hataları logla
process.on('uncaughtException', (err) => {
  console.error('[MANE] Beklenmedik hata (Main):', err)
})
