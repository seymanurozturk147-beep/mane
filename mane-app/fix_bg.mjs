import Jimp from 'jimp'

const INPUT = 'src/renderer/src/assets/babaanne.png'
const OUTPUT = 'src/renderer/src/assets/babaanne.png'
const BACKUP = 'src/renderer/src/assets/babaanne_eski.png'

const img = await Jimp.read(INPUT)

// Backup the original first
await img.clone().writeAsync(BACKUP)

// Create a white background the same size
const bg = new Jimp(img.bitmap.width, img.bitmap.height, 0xFFFFFFFF)

// Composite the original on top (respects alpha)
bg.composite(img, 0, 0, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 1,
    opacityDest: 1,
})

await bg.writeAsync(OUTPUT)
console.log(`✅ Tamamlandı! ${img.bitmap.width}×${img.bitmap.height}px — arka plan beyaza boyandı.`)
console.log(`📂 Eski görsel yedeklendi: ${BACKUP}`)
