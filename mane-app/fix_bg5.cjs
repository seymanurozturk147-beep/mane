const path = require('path')
const fs   = require('fs')
const Jimp = require('jimp')

const assetDir = path.join(__dirname, 'src', 'renderer', 'src', 'assets')
const srcFile  = path.join(assetDir, 'babaanne.png')
const bakFile  = path.join(assetDir, 'babaanne_eski.png')
const outFile  = path.join(assetDir, 'babaanne_new.png')

console.log('Processing:', srcFile)

Jimp.read(srcFile)
  .then(img => {
    const w = img.bitmap.width
    const h = img.bitmap.height
    console.log('Read OK, size:', w, 'x', h)

    // Create pure white destination image (no alpha)
    const out = new Jimp(w, h, 0xFFFFFFFF)

    // Manually blend each pixel onto white background
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const srcPixel = Jimp.intToRGBA(img.getPixelColor(x, y))
        const a = srcPixel.a / 255  // alpha 0–1

        // Alpha blend: result = src * alpha + white * (1 - alpha)
        const r = Math.round(srcPixel.r * a + 255 * (1 - a))
        const g = Math.round(srcPixel.g * a + 255 * (1 - a))
        const b = Math.round(srcPixel.b * a + 255 * (1 - a))

        const blended = Jimp.rgbaToInt(r, g, b, 255)
        out.setPixelColor(blended, x, y)
      }
    }

    console.log('Pixel blending done, writing...')
    return out.writeAsync(outFile)
  })
  .then(() => {
    const origSize = fs.statSync(srcFile).size
    const newSize  = fs.statSync(outFile).size
    console.log('Original size:', origSize, 'New size:', newSize)

    // Replace: backup old, move new into place
    fs.copyFileSync(srcFile, bakFile)
    fs.copyFileSync(outFile, srcFile)
    fs.unlinkSync(outFile)

    console.log('DONE! babaanne.png now has a solid white background.')
  })
  .catch(e => { console.error('ERROR:', e.message, '\n', e.stack); process.exit(1) })
