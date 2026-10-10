param(
    [ValidateRange(1, 1000)]
    [int]$Revision = 1
)
$ErrorActionPreference = 'Stop'
$os = Get-CimInstance Win32_OperatingSystem
if ($os.FreePhysicalMemory / 1MB -lt 4 -or $os.FreeVirtualMemory / 1MB -lt 8) {
    throw 'Image preparation paused: need at least 4 GB free physical and 8 GB free virtual memory.'
}
$project = Split-Path $PSScriptRoot
$output = Join-Path $PSScriptRoot "supporting-preview-v$Revision"
$preview = Join-Path $project "previews\estate-composition-v$Revision.png"
if ((Test-Path -LiteralPath $output) -or (Test-Path -LiteralPath $preview)) {
    throw 'This revision already exists. Choose a new revision; never overwrite preserved candidates.'
}
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class EstatePreview {
    public static Bitmap Prepare(string path, string mode, out Rectangle crop) {
        using (var source = new Bitmap(path))
        using (var rgba = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb)) {
            using (var g = Graphics.FromImage(rgba)) {
                g.CompositingMode = CompositingMode.SourceCopy;
                g.DrawImage(source, new Rectangle(0,0,source.Width,source.Height), 0,0,source.Width,source.Height,GraphicsUnit.Pixel);
            }
            int w = rgba.Width, h = rgba.Height;
            var data = rgba.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            byte[] pixels = new byte[data.Stride * h];
            Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);
            int left = w, top = h, right = -1, bottom = -1;
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
                int i = y * data.Stride + x * 4;
                int b = pixels[i], g = pixels[i+1], r = pixels[i+2];
                int max = Math.Max(r, Math.Max(g, b)), min = Math.Min(r, Math.Min(g, b));
                double alpha = 1;
                if (mode == "white") {
                    // Neutral white key also clears enclosed gate and branch gaps.
                    if (max - min <= 35 && min > 210) {
                        alpha = Math.Max(0, Math.Min(1, (235.0 - min) / 25.0));
                        if (alpha > 0) {
                            pixels[i] = (byte)Math.Max(0, Math.Min(255, (b - 255 * (1-alpha)) / alpha));
                            pixels[i+1] = (byte)Math.Max(0, Math.Min(255, (g - 255 * (1-alpha)) / alpha));
                            pixels[i+2] = (byte)Math.Max(0, Math.Min(255, (r - 255 * (1-alpha)) / alpha));
                        }
                    }
                } else if (mode == "black") {
                    // Unpremultiply black-backed light; preserves its visible RGB contribution.
                    alpha = max <= 6 ? 0 : max / 255.0;
                    if (alpha > 0) {
                        pixels[i] = (byte)Math.Min(255, b / alpha);
                        pixels[i+1] = (byte)Math.Min(255, g / alpha);
                        pixels[i+2] = (byte)Math.Min(255, r / alpha);
                    }
                } else if (mode != "material") throw new ArgumentException("Unknown key mode");
                pixels[i+3] = (byte)Math.Round(alpha * 255);
                if (pixels[i+3] > 12) {
                    left = Math.Min(left, x); right = Math.Max(right, x);
                    top = Math.Min(top, y); bottom = Math.Max(bottom, y);
                }
            }
            Marshal.Copy(pixels, 0, data.Scan0, pixels.Length);
            rgba.UnlockBits(data);
            if (mode == "white" && (rgba.GetPixel(0,0).A > 12 || rgba.GetPixel(w-1,h-1).A > 12))
                throw new InvalidOperationException("Background corners remain opaque: " + path);
            if (right < left) throw new InvalidOperationException("Mask removed the entire image: " + path);
            if (mode == "material") crop = new Rectangle(0, 0, w, h);
            else crop = Rectangle.FromLTRB(Math.Max(0,left-4), Math.Max(0,top-4), Math.Min(w,right+5), Math.Min(h,bottom+5));
            return rgba.Clone(crop, PixelFormat.Format32bppArgb);
        }
    }
    static string directory;
    static Graphics canvas;
    static void Place(string name, float x, float y, float width, float brightness, float opacity) {
        using (var image = new Bitmap(System.IO.Path.Combine(directory, name+".png")))
        using (var attributes = new ImageAttributes()) {
            var matrix = new ColorMatrix();
            matrix.Matrix00 = brightness * 0.82f;
            matrix.Matrix11 = brightness * 0.98f;
            matrix.Matrix22 = brightness * 1.08f;
            matrix.Matrix33 = opacity;
            attributes.SetColorMatrix(matrix);
            int height = (int)Math.Round(width * image.Height / image.Width);
            canvas.DrawImage(image, new Rectangle((int)x,(int)y,(int)width,height), 0,0,image.Width,image.Height,GraphicsUnit.Pixel,attributes);
        }
    }
    static void Height(string name, float x, float baseY, float height, float brightness, float opacity) {
        using (var image = new Bitmap(System.IO.Path.Combine(directory,name+".png"))) {
            Place(name,x,baseY-height,height*image.Width/image.Height,brightness,opacity);
        }
    }
    static void FenceStrip(float end, bool left) {
        using (var image = new Bitmap(System.IO.Path.Combine(directory,"fence.png"))) {
            float width = 155f*image.Width/image.Height;
            for(int i=0;i<3;i++) Height("fence",left?end-(i+1)*width:end+i*width,965,155,0.55f,1);
        }
    }
    public static void Compose(string assets, string house, string target) {
        directory = assets;
        using (var scene = new Bitmap(1600,1000,PixelFormat.Format32bppArgb))
        using (canvas = Graphics.FromImage(scene)) {
            canvas.SmoothingMode = SmoothingMode.HighQuality;
            canvas.InterpolationMode = InterpolationMode.HighQualityBicubic;
            using (var sky = new LinearGradientBrush(new Rectangle(0,0,1600,1000),Color.FromArgb(10,25,38),Color.FromArgb(34,64,73),90f))
                canvas.FillRectangle(sky,0,0,1600,1000);
            Place("moon",355,40,210,0.95f,0.95f);
            Place("cloud",0,35,950,0.7f,0.7f);
            Place("cloud",700,65,1050,0.8f,0.8f);
            Place("lightning",230,180,260,0.8f,0.65f);
            Place("lightning",1140,150,300,0.9f,0.7f);
            for(int i=0;i<8;i++) Height("distant-tree",120+i*185,700,180+(i%3)*35,0.32f,0.55f);
            using (var terrain = new Bitmap(1600,380,PixelFormat.Format32bppArgb)) {
                using (var ground = Graphics.FromImage(terrain))
                using (var texture = new Bitmap(System.IO.Path.Combine(directory,"soil.png")))
                using (var brush = new TextureBrush(texture))
                using (var shade = new SolidBrush(Color.FromArgb(155,5,23,28))) {
                    brush.ScaleTransform(0.45f,0.45f);
                    ground.FillRectangle(brush,0,0,1600,380);
                    ground.FillRectangle(shade,0,0,1600,380);
                }
                var data = terrain.LockBits(new Rectangle(0,0,1600,380),ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);
                var pixels = new byte[data.Stride*380];
                Marshal.Copy(data.Scan0,pixels,0,pixels.Length);
                for(int y=0;y<70;y++) for(int x=0;x<1600;x++) pixels[y*data.Stride+x*4+3]=(byte)(255*y/70);
                Marshal.Copy(pixels,0,data.Scan0,pixels.Length);
                terrain.UnlockBits(data);
                canvas.DrawImage(terrain,new Rectangle(0,620,1600,380),0,0,1600,380,GraphicsUnit.Pixel);
            }
            using (var path = new GraphicsPath()) {
                path.AddPolygon(new Point[]{new Point(760,655),new Point(850,655),new Point(1130,1000),new Point(430,1000)});
                using (var paving = new Bitmap(System.IO.Path.Combine(directory,"paving.png")))
                using (var brush = new TextureBrush(paving)) {
                    brush.ScaleTransform(0.18f,0.18f);
                    canvas.FillPath(brush,path);
                }
                using (var shade = new SolidBrush(Color.FromArgb(175,9,27,32))) canvas.FillPath(shade,path);
            }
            string[] markers = {"rounded","broken","cross"};
            for(int i=0;i<16;i++) {
                float x = i<8 ? 90+i*65 : 970+(i-8)*75;
                Height(markers[i%3],x,685+(i%4)*9,45+(i%3)*15,0.48f,0.7f);
            }
            Place("large-tree",-485,155,1100,0.32f,1);
            Place("arch-tree",870,90,1050,0.34f,1);
            using (var mansion = new Bitmap(house))
                canvas.DrawImage(mansion, new Rectangle(485,235,630,(int)Math.Round(630.0*mansion.Height/mansion.Width)),0,0,mansion.Width,mansion.Height,GraphicsUnit.Pixel);
            Place("fog",0,625,1600,0.8f,0.4f);
            for(int i=0;i<10;i++) {
                float x = i<5 ? 90+i*82 : 1130+(i-5)*85;
                Height(markers[i%3],x,800+(i%3)*24,85+(i%4)*23,0.65f,1);
            }
            Height("angel",270,845,260,0.66f,1);
            Height("cross",1320,880,230,0.58f,1);
            for(int i=0;i<15;i++) {
                float x = i<7 ? i*72 : 1100+(i-7)*70;
                Height(i%2==0?"grass":"weeds",x,920+(i%3)*23,35+(i%3)*14,0.6f,0.9f);
            }
            for(int i=0;i<5;i++) {
                float y=695+i*46, spread=54+i*24;
                Height("candle",805-spread,y,16+i*6,1,1);
                Height("candle",805+spread,y,16+i*6,1,1);
                Place("glow",790-spread,y-35-i*4,32+i*8,1,0.35f);
                Place("glow",790+spread,y-35-i*4,32+i*8,1,0.35f);
            }
            FenceStrip(495,true);
            FenceStrip(1111,false);
            Height("pillar",495,980,255,0.64f,1);
            Height("pillar",1018,980,255,0.64f,1);
            Place("gate",588,719,430,0.62f,1);
            Height("lantern",540,800,55,0.7f,1);
            Height("lantern",1040,800,55,0.7f,1);
            Place("fog",-40,843,1680,0.5f,0.22f);
            for(int i=0;i<6;i++) Place("bat",660+i*70,145+(i%3)*28,20+(i%2)*9,0.45f,1);
            Place("rain",0,0,1600,0.7f,0.18f);
            using (var vignette = new GraphicsPath()) {
                vignette.AddEllipse(-300,-200,2200,1450);
                using(var brush = new PathGradientBrush(vignette)) {
                    brush.CenterColor = Color.Transparent;
                    brush.SurroundColors = new[]{Color.FromArgb(180,0,5,8)};
                    canvas.FillRectangle(brush,0,0,1600,1000);
                }
            }
            scene.Save(target,ImageFormat.Png);
        }
    }
}
'@
$choices = @(
    @('gate','copilot-gothic-estate-gate-candidate-3-2026-10-10.png','white'),
    @('fence','copilot-gothic-fence-panel-candidate-2026-10-10.png','white'),
    @('pillar','gemini-gothic-stone-gate-pillar-candidate-2-2026-10-10.jpg','white'),
    @('lantern','gemini-gothic-lantern-fixture-candidate-2-2026-10-10.jpg','white'),
    @('rounded','gemini-gothic-rounded-headstone-candidate-2026-10-10.jpg','white'),
    @('broken','gemini-gothic-small-broken-stone-marker-candidate-2026-10-10.jpg','white'),
    @('cross','gemini-gothic-stone-cross-monument-candidate-2026-10-10.jpg','white'),
    @('angel','gemini-gothic-angel-monument-candidate-2026-10-10.jpg','white'),
    @('large-tree','gemini-gothic-large-bare-tree-candidate-2026-10-10.jpg','white'),
    @('arch-tree','gemini-gothic-second-framing-tree-candidate-2026-10-10.jpg','white'),
    @('distant-tree','gemini-gothic-slender-distant-tree-candidate-2026-10-10.jpg','white'),
    @('grass','gemini-gothic-grass-clump-candidate-2026-10-10.jpg','white'),
    @('weeds','gemini-gothic-edge-weeds-candidate-2026-10-10.jpg','white'),
    @('moon','gemini-gothic-full-moon-candidate-2026-10-10.jpg','black'),
    @('cloud','gemini-gothic-storm-cloud-bank-candidate-2026-10-10.jpg','black'),
    @('bat','gemini-gothic-flying-bat-candidate-2026-10-10.jpg','white'),
    @('lightning','gemini-gothic-contained-lightning-bolt-candidate-3-2026-10-10.jpg','black'),
    @('rain','gemini-gothic-rain-overlay-candidate-2026-10-10.jpg','black'),
    @('fog','gemini-gothic-ground-fog-candidate-2026-10-10.jpg','black'),
    @('candle','gemini-gothic-driveway-candle-candidate-2026-10-10.jpg','black'),
    @('glow','gemini-gothic-candle-glow-candidate-2026-10-10.jpg','black'),
    @('soil','gemini-gothic-ground-texture-candidate-2026-10-10.jpg','material'),
    @('paving','gemini-gothic-driveway-paving-texture-candidate-2026-10-10.jpg','material')
)
$house = Join-Path $project '..\..\..\assets\estate-generated-manor.png'
foreach ($choice in $choices) {
    if (-not (Test-Path -LiteralPath (Join-Path $project "originals\$($choice[1])"))) {
        throw "Missing original: $($choice[1])"
    }
}
if (-not (Test-Path -LiteralPath $house)) { throw 'Accepted house is missing.' }
$houseHash = (Get-FileHash -LiteralPath $house -Algorithm SHA256).Hash
New-Item -ItemType Directory -Path $output | Out-Null
$records = foreach ($choice in $choices) {
    $source = Join-Path $project "originals\$($choice[1])"
    $hash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
    $crop = New-Object System.Drawing.Rectangle
    $bitmap = [EstatePreview]::Prepare($source, $choice[2], [ref]$crop)
    try {
        $destination = Join-Path $output "$($choice[0]).png"
        $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
        [pscustomobject]@{
            Name = $choice[0]; Original = $choice[1]; SourceSHA256 = $hash
            Key = $choice[2]; Crop = @($crop.X,$crop.Y,$crop.Width,$crop.Height)
            Width = $bitmap.Width; Height = $bitmap.Height
            OutputSHA256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
        }
    } finally { $bitmap.Dispose() }
    if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne $hash) {
        throw 'Original changed during preparation.'
    }
}
[EstatePreview]::Compose($output, $house, $preview)
if ((Get-FileHash -LiteralPath $house -Algorithm SHA256).Hash -ne $houseHash) {
    throw 'Accepted house changed during preparation.'
}
[pscustomobject]@{
    Status = 'Local still candidate only; not runtime artwork or motion validation'
    HouseSHA256 = $houseHash
    PreviewSHA256 = (Get-FileHash -LiteralPath $preview -Algorithm SHA256).Hash
    Width = 1600; Height = 1000; Assets = @($records)
} | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $output 'preparation.json') -Encoding UTF8
Write-Output "Prepared $($records.Count) derivatives; originals and accepted house unchanged."
Write-Output "Still preview: $preview"
