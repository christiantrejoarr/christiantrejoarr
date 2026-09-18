$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\slipk\.cursor\projects\c-Users-slipk-OneDrive-Documentos-GitHub-christiantrejoarr\assets\c__Users_slipk_AppData_Roaming_Cursor_User_workspaceStorage_2ca6becaa78aed21dfb202c6bf905eec_images_image-ed7371c3-0a7f-444f-8338-7fd5ec502a3b.png"
$outDir = (Resolve-Path "assets\doom").Path
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($src, 0, 0, $src.Width, $src.Height)
$g.Dispose()
$src.Dispose()

for ($y = 0; $y -lt $bmp.Height; $y++) {
  for ($x = 0; $x -lt $bmp.Width; $x++) {
    $p = $bmp.GetPixel($x, $y)
    if ($p.R -le 22 -and $p.G -le 18 -and $p.B -le 18) {
      $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    }
  }
}

function CropNonTransparent([System.Drawing.Bitmap]$img, [int]$x0, [int]$x1) {
  $minX = $x1; $minY = $img.Height; $maxX = $x0; $maxY = 0
  for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = $x0; $x -lt $x1; $x++) {
      if ($img.GetPixel($x, $y).A -lt 16) { continue }
      if ($x -lt $minX) { $minX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
  if ($maxX -lt $minX) { return $null }
  $w = $maxX - $minX + 1
  $h = $maxY - $minY + 1
  $crop = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $cg = [System.Drawing.Graphics]::FromImage($crop)
  $cg.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), $minX, $minY, $w, $h, [System.Drawing.GraphicsUnit]::Pixel)
  $cg.Dispose()
  return $crop
}

$mid = [int]($bmp.Width / 2)
$left = CropNonTransparent $bmp 0 $mid
$right = CropNonTransparent $bmp $mid $bmp.Width
$left.Save((Join-Path $outDir "wing-left.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$right.Save((Join-Path $outDir "wing-right.png"), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host ("left=" + $left.Width + "x" + $left.Height + " right=" + $right.Width + "x" + $right.Height)
$left.Dispose()
$right.Dispose()
$bmp.Dispose()
