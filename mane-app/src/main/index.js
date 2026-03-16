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
      devTools: true // Geliştirme için açık
    }
  })

  // ─── Hata Yakalama ───────────────────────────────────────────────────────
  mainWindow.webContents.on('did-fail-load', (_, code, desc) => {
    console.error(`[Main] Yükleme hatası: ${code} - ${desc}`)
  })

  // ─── Geçiş Mantığı ───────────────────────────────────────────────────────
  // Pencere hazır olduğunda splash'i kapatıp ana pencereyi göster.
  // 5 saniye bekleme süresini 3 saniyeye çekelim (kullanıcıyı çok bekletmeyelim).
  mainWindow.once('ready-to-show', () => {
    const elapsed = Date.now() - splashStartTime
    const wait = Math.max(3000 - elapsed, 0)
    
    console.log(`[Main] Pencere hazır. Geçen: ${elapsed}ms, Ek: ${wait}ms`)

    setTimeout(() => {
      if (!mainWindow || mainWindow.isDestroyed()) return
      
      // Önce ana pencereyi göster
      mainWindow.show()
      
      // Sonra splash'i imha et
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.hide() // Önce gizle
        splashWindow.close()
        splashWindow = null
      }
      
      mainWindow.focus()
      
      if (is.dev) {
        mainWindow.webContents.openDevTools({ mode: 'detach' })
      }
    }, wait)
  })

  // URL Yükleme
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).catch(err => {
      console.error('[Main] Dev servera bağlanılamadı:', err.message)
    })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).catch(err => {
      console.error('[Main] HTML dosyası yüklenemedi:', err.message)
    })
  }
}

// ─── Uygulama Hazır ──────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // macOS için Dock kimliği
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'MANE',
      applicationVersion: '1.0.4'
    })
  }

  electronApp.setAppUserModelId('com.electron.mane')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Başlat
  const st = createSplashWindow()
  createMainWindow(st)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

process.on('uncaughtException', (err) => {
  console.error('[Main] Kritik Hata:', err)
})
