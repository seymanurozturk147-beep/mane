const path = require('path')
const fs   = require('fs')
const Jimp = require('jimp')

const assetDir = path.join(__dirname, 'src', 'renderer', 'src', 'assets')
const srcFile  = path.join(assetDir, 'babaanne.png')
const bakFile  = path.join(assetDir, 'babaanne_eski.png')
const outFile  = path.join(assetDir, 'babaanne_out.png')

console.log('Processing:', srcFile)

Jimp.read(srcFile)
  .then(img => {
    console.log('Read OK, size:', img.bitmap.width, 'x', img.bitmap.height)
    console.log('Has alpha:', img.hasAlpha())

    // The key: set a white background and flatten alpha by converting to RGB
    // Jimp.MIME_JPEG strips alpha; we then re-save as PNG
    img
      .background(0xFFFFFFFF)   // set background to white for transparent areas
      .flatten({ background: 0xFFFFFFFF })   // flatten alpha onto white
      .write(outFile, (err) => {
        if (err) { console.error('Write err:', err.message); process.exit(1) }
        
        const origSize = fs.statSync(srcFile).size
        const newSize  = fs.statSync(outFile).size
        console.log('Original size:', origSize, 'New size:', newSize)

        // Backup original, then replace
        fs.copyFileSync(srcFile, bakFile)
        fs.copyFileSync(outFile, srcFile)
        fs.unlinkSync(outFile)

        console.log('DONE! babaanne.png updated with white background.')
        console.log('Backup at:', bakFile)
      })
  })
  .catch(e => { console.error('Read err:', e.message); process.exit(1) })
