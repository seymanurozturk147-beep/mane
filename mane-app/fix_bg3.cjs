const path = require('path')
const fs = require('fs')
const Jimp = require('jimp')

const assetDir = path.join(__dirname, 'src', 'renderer', 'src', 'assets')
const srcFile = path.join(assetDir, 'babaanne.png')
const bakFile = path.join(assetDir, 'babaanne_eski.png')
const tmpFile = path.join(assetDir, 'babaanne_white_tmp.png')

console.log('Reading:', srcFile)

Jimp.read(srcFile)
    .then(img => {
        const w = img.bitmap.width
        const h = img.bitmap.height
        console.log('Size:', w, 'x', h)

        // Backup
        fs.copyFileSync(srcFile, bakFile)
        console.log('Backup OK at:', bakFile)

        // Create pure white image, same size
        return new Promise((resolve, reject) => {
            new Jimp(w, h, 0xFFFFFFFF, (err, bg) => {
                if (err) return reject(err)

                // Composite original on top (alpha blending)
                bg.composite(img, 0, 0, { mode: Jimp.BLEND_SOURCE_OVER, opacityDest: 1, opacitySource: 1 })

                // Save to tmp first, then overwrite src
                bg.write(tmpFile, (err2) => {
                    if (err2) return reject(err2)

                    // Now copy tmp → src (atomic replace)
                    fs.copyFileSync(tmpFile, srcFile)
                    fs.unlinkSync(tmpFile)

                    console.log('DONE! White background saved to:', srcFile)
                    resolve()
                })
            })
        })
    })
    .catch(e => {
        console.error('ERROR:', e.message)
        process.exit(1)
    })
