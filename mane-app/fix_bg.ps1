Add-Type -AssemblyName System.Drawing

$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$src  = Join-Path $base "src\renderer\src\assets\babaanne.png"
$bak  = Join-Path $base "src\renderer\src\assets\babaanne_eski.png"

# Backup
Copy-Item -Path $src -Destination $bak -Force
Write-Host "Yedek olusturuldu: $bak"

# Load original
$orig = [System.Drawing.Image]::FromFile($src)
$w = $orig.Width
$h = $orig.Height

# Create white bitmap
$bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$g.DrawImage($orig, 0, 0, $w, $h)
$g.Dispose()
$orig.Dispose()

# Save (must close original file handle first)
$bmp.Save($src, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "Tamamlandi! $w x $h px — arka plan beyaz yapildi."
