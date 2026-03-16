const path = require('path')
const fs = require('fs')

const assetDir = path.join(__dirname, 'src', 'renderer', 'src', 'assets')
const srcFile = path.join(assetDir, 'babaanne.png')
const bakFile = path.join(assetDir, 'babaanne_eski.png')

// Override console to also write to log
const LOG = path.join(__dirname, 'fix_bg_log.txt')
fs.writeFileSync(LOG, '')
const log = (...args) => {
    const msg = args.join(' ') + '\n'
    process.stdout.write(msg)
    fs.appendFileSync(LOG, msg)
}

log('Asset dir:', assetDir)
log('Source   :', srcFile)
log('Exists   :', fs.existsSync(srcFile))

let Jimp
try {
    Jimp = require('jimp')
    log('Jimp loaded OK')
} catch (e) {
    log('Jimp load FAILED:', e.message)
    process.exit(1)
}

Jimp.read(srcFile)
    .then(img => {
        const w = img.bitmap.width
        const h = img.bitmap.height
        log('Image size:', w, 'x', h)

        fs.copyFileSync(srcFile, bakFile)
        log('Backup created')

        return new Promise((resolve, reject) => {
            new Jimp(w, h, 0xFFFFFFFF, (err, bg) => {
                if (err) { log('Jimp constructor error:', err.message); return reject(err) }
                bg.composite(img, 0, 0)
                    .write(srcFile, (err2) => {
                        if (err2) { log('Write error:', err2.message); return reject(err2) }
                        log('DONE! ' + w + 'x' + h + ' white background applied')
                        resolve()
                    })
            })
        })
    })
    .catch(e => {
        log('ERROR:', e.message, e.stack)
        process.exit(1)
    })
