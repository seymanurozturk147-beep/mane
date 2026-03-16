// fix_bg.cjs — fill transparent PNG background with solid white
// Runs from the mane-app project root. Uses __dirname to get the correct path
// regardless of any special characters in parent folder names.
const path = require('path')
const fs = require('fs')

// Resolve paths relative to THIS file's location (mane-app/)
const assetDir = path.join(__dirname, 'src', 'renderer', 'src', 'assets')
const srcFile = path.join(assetDir, 'babaanne.png')
const bakFile = path.join(assetDir, 'babaanne_eski.png')

console.log('Asset dir:', assetDir)
console.log('Source   :', srcFile)
console.log('Exists   :', fs.existsSync(srcFile))

const Jimp = require('jimp')

Jimp.read(srcFile)
    .then(img => {
        const w = img.bitmap.width
        const h = img.bitmap.height
        console.log('Image size:', w, 'x', h)

        // Backup original
        fs.copyFileSync(srcFile, bakFile)
        console.log('Yedek olusturuldu:', bakFile)

        // Create white canvas
        return new Promise((resolve, reject) => {
            new Jimp(w, h, 0xFFFFFFFF, (err, bg) => {
                if (err) return reject(err)
                bg.composite(img, 0, 0)
                    .write(srcFile, (err2) => {
                        if (err2) return reject(err2)
                        resolve({ w, h })
                    })
            })
        })
    })
    .then(({ w, h }) => {
        console.log('TAMAM! ' + w + 'x' + h + ' - arka plan beyaz yapildi!')
    })
    .catch(e => {
        console.error('HATA:', e.message)
        process.exit(1)
    })
