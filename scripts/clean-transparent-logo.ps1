param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [Parameter(Mandatory = $true)][string]$IconPath
)

if ($PSVersionTable.PSEdition -eq 'Core') {
  $windowsPowerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
  & $windowsPowerShell -NoProfile -ExecutionPolicy Bypass -File $PSCommandPath -InputPath $InputPath -OutputPath $OutputPath -IconPath $IconPath
  exit $LASTEXITCODE
}

$sourcePath = [System.IO.Path]::GetFullPath($InputPath)
$markPath = [System.IO.Path]::GetFullPath($OutputPath)
$squareIconPath = [System.IO.Path]::GetFullPath($IconPath)

Add-Type -AssemblyName System.Drawing

if (-not ('MinistryAi.BrandLogoCleaner' -as [type])) {
  $drawingAssembly = [System.Drawing.Bitmap].Assembly.Location
  Add-Type -ReferencedAssemblies $drawingAssembly -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace MinistryAi {
  public static class BrandLogoCleaner {
    public static void Clean(string inputPath, string outputPath, string iconPath) {
      using (var source = new Bitmap(inputPath))
      using (var bitmap = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb)) {
        using (var graphics = Graphics.FromImage(bitmap)) {
          graphics.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
          graphics.DrawImageUnscaled(source, 0, 0);
        }

        var rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
        var data = bitmap.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int byteCount = Math.Abs(data.Stride) * data.Height;
        var pixels = new byte[byteCount];
        System.Runtime.InteropServices.Marshal.Copy(data.Scan0, pixels, 0, byteCount);

        int width = bitmap.Width;
        int height = bitmap.Height;
        var labels = new int[width * height];
        var sizes = new List<int> { 0 };
        var queue = new int[width * height];
        int nextLabel = 0;
        int[] dx = { -1, 0, 1, -1, 1, -1, 0, 1 };
        int[] dy = { -1, -1, -1, 0, 0, 1, 1, 1 };

        Func<int, int, byte> alphaAt = (x, y) => pixels[y * data.Stride + x * 4 + 3];

        for (int y = 0; y < height; y++) {
          for (int x = 0; x < width; x++) {
            int start = y * width + x;
            if (labels[start] != 0 || alphaAt(x, y) < 20) continue;

            nextLabel++;
            int head = 0;
            int tail = 0;
            int size = 0;
            queue[tail++] = start;
            labels[start] = nextLabel;

            while (head < tail) {
              int current = queue[head++];
              int cx = current % width;
              int cy = current / width;
              size++;

              for (int i = 0; i < 8; i++) {
                int nx = cx + dx[i];
                int ny = cy + dy[i];
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                int index = ny * width + nx;
                if (labels[index] != 0 || alphaAt(nx, ny) < 20) continue;
                labels[index] = nextLabel;
                queue[tail++] = index;
              }
            }

            sizes.Add(size);
          }
        }

        int minX = width;
        int minY = height;
        int maxX = -1;
        int maxY = -1;

        for (int y = 0; y < height; y++) {
          for (int x = 0; x < width; x++) {
            int index = y * width + x;
            int label = labels[index];
            bool keep = label > 0 && sizes[label] >= 1000;
            int offset = y * data.Stride + x * 4;

            if (!keep) {
              pixels[offset] = 0;
              pixels[offset + 1] = 0;
              pixels[offset + 2] = 0;
              pixels[offset + 3] = 0;
              continue;
            }

            minX = Math.Min(minX, x);
            minY = Math.Min(minY, y);
            maxX = Math.Max(maxX, x);
            maxY = Math.Max(maxY, y);
          }
        }

        System.Runtime.InteropServices.Marshal.Copy(pixels, 0, data.Scan0, byteCount);
        bitmap.UnlockBits(data);

        if (maxX < minX || maxY < minY) throw new InvalidOperationException("No logo pixels remained after cleanup.");

        const int padding = 18;
        int cropX = Math.Max(0, minX - padding);
        int cropY = Math.Max(0, minY - padding);
        int cropRight = Math.Min(width - 1, maxX + padding);
        int cropBottom = Math.Min(height - 1, maxY + padding);
        var cropRect = Rectangle.FromLTRB(cropX, cropY, cropRight + 1, cropBottom + 1);

        Directory.CreateDirectory(Path.GetDirectoryName(outputPath));
        Directory.CreateDirectory(Path.GetDirectoryName(iconPath));

        using (var cropped = bitmap.Clone(cropRect, PixelFormat.Format32bppArgb)) {
          cropped.Save(outputPath, ImageFormat.Png);

          int iconPadding = Math.Max(24, Math.Max(cropped.Width, cropped.Height) / 14);
          int side = Math.Max(cropped.Width, cropped.Height) + iconPadding * 2;
          using (var icon = new Bitmap(side, side, PixelFormat.Format32bppArgb))
          using (var iconGraphics = Graphics.FromImage(icon)) {
            iconGraphics.Clear(Color.Transparent);
            int left = (side - cropped.Width) / 2;
            int top = (side - cropped.Height) / 2;
            iconGraphics.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
            iconGraphics.DrawImageUnscaled(cropped, left, top);
            icon.Save(iconPath, ImageFormat.Png);
          }
        }
      }
    }
  }
}
'@
}

[MinistryAi.BrandLogoCleaner]::Clean($sourcePath, $markPath, $squareIconPath)
