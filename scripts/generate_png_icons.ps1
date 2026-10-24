Add-Type -AssemblyName System.Drawing

function Draw-InternalsLogo {
    param(
        [int]$size = 512,
        [int]$padding = 48,
        [System.Drawing.Color]$fgColor,
        [System.Drawing.Color]$bgColor,
        [bool]$isTransparent = $false,
        [string]$outputPath
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($isTransparent) {
        $g.Clear([System.Drawing.Color]::Transparent)
    } else {
        $g.Clear($bgColor)
    }

    $drawArea = $size - (2 * $padding)
    $scale = $drawArea / 688.0
    $ox = $padding
    $oy = $padding

    function T-X([double]$x) { return ($ox + ($x - 168.01) * $scale) }
    function T-Y([double]$y) { return ($oy + ($y - 168.01) * $scale) }

    $brush = New-Object System.Drawing.SolidBrush($fgColor)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath

    # 1
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 168.01), (T-Y 168.01), ((320.76 - 168.01)*$scale), ((243.40 - 168.01)*$scale)))
    # 2
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 435.42), (T-Y 168.01), ((855.99 - 435.42)*$scale), ((243.40 - 168.01)*$scale)))
    # 3
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 168.01), (T-Y 252.21), ((320.76 - 168.01)*$scale), ((419.53 - 252.21)*$scale)))

    # 4: Polygon (N top arch)
    $pts = @(
        (New-Object System.Drawing.PointF (T-X 435.42), (T-Y 252.21)),
        (New-Object System.Drawing.PointF (T-X 855.99), (T-Y 252.21)),
        (New-Object System.Drawing.PointF (T-X 855.99), (T-Y 419.53)),
        (New-Object System.Drawing.PointF (T-X 703.24), (T-Y 419.53)),
        (New-Object System.Drawing.PointF (T-X 703.24), (T-Y 320.67)),
        (New-Object System.Drawing.PointF (T-X 588.58), (T-Y 320.67)),
        (New-Object System.Drawing.PointF (T-X 588.58), (T-Y 419.53)),
        (New-Object System.Drawing.PointF (T-X 435.42), (T-Y 419.53))
    )
    $path.AddPolygon($pts)

    # 5
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 168.01), (T-Y 428.34), ((320.76 - 168.01)*$scale), ((595.66 - 428.34)*$scale)))
    # 6
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 435.42), (T-Y 428.34), ((588.58 - 435.42)*$scale), ((595.66 - 428.34)*$scale)))
    # 7
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 703.24), (T-Y 428.34), ((855.99 - 703.24)*$scale), ((595.66 - 428.34)*$scale)))
    # 8
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 168.01), (T-Y 604.47), ((320.76 - 168.01)*$scale), ((771.79 - 604.47)*$scale)))
    # 9
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 435.42), (T-Y 604.47), ((588.58 - 435.42)*$scale), ((771.79 - 604.47)*$scale)))
    # 10
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 703.24), (T-Y 604.47), ((855.99 - 703.24)*$scale), ((771.79 - 604.47)*$scale)))
    # 11
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 168.01), (T-Y 780.60), ((320.76 - 168.01)*$scale), ((855.99 - 780.60)*$scale)))
    # 12
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 435.42), (T-Y 780.60), ((588.58 - 435.42)*$scale), ((855.99 - 780.60)*$scale)))
    # 13
    $path.AddRectangle((New-Object System.Drawing.RectangleF (T-X 703.24), (T-Y 780.60), ((855.99 - 703.24)*$scale), ((855.99 - 780.60)*$scale)))

    $g.FillPath($brush, $path)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Successfully saved $outputPath"
}

if (-not (Test-Path 'public')) { New-Item -ItemType Directory -Path 'public' }

# Full bleed transparent (standard icon)
Draw-InternalsLogo -size 512 -padding 0 -fgColor ([System.Drawing.Color]::FromArgb(10,10,10)) -isTransparent $true -outputPath 'public/icon-512.png'
Draw-InternalsLogo -size 512 -padding 0 -fgColor ([System.Drawing.Color]::FromArgb(245,245,245)) -isTransparent $true -outputPath 'public/icon-512-white.png'

# Standard Console/OAuth App Cards (with 54px padding so it fits circle/square avatars nicely)
Draw-InternalsLogo -size 512 -padding 64 -fgColor ([System.Drawing.Color]::White) -bgColor ([System.Drawing.Color]::FromArgb(10,10,10)) -isTransparent $false -outputPath 'public/icon-512-dark-card.png'
Draw-InternalsLogo -size 512 -padding 64 -fgColor ([System.Drawing.Color]::FromArgb(10,10,10)) -bgColor ([System.Drawing.Color]::White) -isTransparent $false -outputPath 'public/icon-512-light-card.png'

# Also 192x192
Draw-InternalsLogo -size 192 -padding 0 -fgColor ([System.Drawing.Color]::FromArgb(10,10,10)) -isTransparent $true -outputPath 'public/icon-192.png'
Draw-InternalsLogo -size 192 -padding 24 -fgColor ([System.Drawing.Color]::White) -bgColor ([System.Drawing.Color]::FromArgb(10,10,10)) -isTransparent $false -outputPath 'public/icon-192-dark-card.png'
