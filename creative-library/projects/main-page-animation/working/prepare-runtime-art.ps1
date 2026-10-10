$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$source = Join-Path $PSScriptRoot 'supporting-preview-v5'
$target = Join-Path $PSScriptRoot '..\..\..\..\assets\estate-supporting'
if (Test-Path $target) { throw 'Runtime artwork already exists; preserve it before regenerating.' }
$memory = Get-CimInstance Win32_OperatingSystem
if ($memory.FreePhysicalMemory -lt 4MB -or $memory.FreeVirtualMemory -lt 8MB) { throw 'Insufficient free memory for artwork preparation.' }
New-Item -ItemType Directory -Path $target | Out-Null
$records = @()
foreach ($file in Get-ChildItem $source -Filter '*.png') {
  $brightness = switch ($file.BaseName) {
    'large-tree' { .35 }; 'arch-tree' { .4 }; 'distant-tree' { .32 }
    'moon' { .9 }; 'candle' { 1 }; 'glow' { 1 }; 'lightning' { .8 }
    'rain' { .7 }; 'fog' { .75 }; default { .65 }
  }
  $original = [Drawing.Bitmap]::new($file.FullName)
  $width = [Math]::Min(1100, $original.Width)
  if ($file.BaseName -eq 'bat') { $width = 100 }
  if ($file.BaseName -eq 'candle') { $width = 80 }
  if ($file.BaseName -eq 'glow') { $width = 120 }
  $height = [Math]::Max(1, [int]($width * $original.Height / $original.Width))
  $bitmap = [Drawing.Bitmap]::new($width, $height)
  $graphics = [Drawing.Graphics]::FromImage($bitmap)
  $attributes = [Drawing.Imaging.ImageAttributes]::new()
  try {
    $matrix = [Drawing.Imaging.ColorMatrix]::new()
    $matrix.Matrix00 = $brightness
    $matrix.Matrix11 = $brightness
    $matrix.Matrix22 = $brightness
    $attributes.SetColorMatrix($matrix)
    $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($original, [Drawing.Rectangle]::new(0, 0, $width, $height), 0, 0, $original.Width, $original.Height, [Drawing.GraphicsUnit]::Pixel, $attributes)
    $output = Join-Path $target $file.Name
    $bitmap.Save($output, [Drawing.Imaging.ImageFormat]::Png)
    $records += @{ Name=$file.Name; Width=$width; Height=$height; Brightness=$brightness; SourceSHA256=(Get-FileHash $file.FullName).Hash; OutputSHA256=(Get-FileHash $output).Hash }
  } finally {
    $attributes.Dispose(); $graphics.Dispose(); $bitmap.Dispose(); $original.Dispose()
  }
}
$records | ConvertTo-Json | Set-Content (Join-Path $PSScriptRoot 'runtime-art-preparation.json')
