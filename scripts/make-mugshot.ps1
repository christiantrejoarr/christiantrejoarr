$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$asm = [System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")
Add-Type -ReferencedAssemblies $asm.Location -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class Mugshot {
  static bool IsBg(int p) {
    int r = p & 255, g = (p>>8)&255, b = (p>>16)&255, a = (p>>24)&255;
    if (a < 8) return true;
    int rng = Math.Max(r, Math.Max(g,b)) - Math.Min(r, Math.Min(g,b));
    return rng <= 22 && r >= 176 && g >= 176 && b >= 176;
  }
  public static Bitmap KeyAndCrop(Bitmap src) {
    int w = src.Width, h = src.Height;
    Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    using (Graphics gr = Graphics.FromImage(bmp)) gr.DrawImage(src, 0, 0, w, h);
    BitmapData data = bmp.LockBits(new Rectangle(0,0,w,h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int[] px = new int[w*h];
    Marshal.Copy(data.Scan0, px, 0, px.Length);
    bool[] vis = new bool[w*h];
    int[] q = new int[w*h];
    int qs = 0, qe = 0;
    for (int x = 0; x < w; x++) {
      TryEnq(px, vis, q, ref qe, x, 0, w, h);
      TryEnq(px, vis, q, ref qe, x, h-1, w, h);
    }
    for (int y = 0; y < h; y++) {
      TryEnq(px, vis, q, ref qe, 0, y, w, h);
      TryEnq(px, vis, q, ref qe, w-1, y, w, h);
    }
    int[] dx = new int[]{1,-1,0,0};
    int[] dy = new int[]{0,0,1,-1};
    while (qs < qe) {
      int i = q[qs++];
      int x = i % w, y = i / w;
      px[i] = 0;
      for (int k = 0; k < 4; k++) TryEnq(px, vis, q, ref qe, x+dx[k], y+dy[k], w, h);
    }
    int minX=w, minY=h, maxX=0, maxY=0;
    for (int i = 0; i < px.Length; i++) {
      if (((uint)px[i] >> 24) < 16) continue;
      int x = i % w, y = i / w;
      if (x < minX) minX = x; if (y < minY) minY = y;
      if (x > maxX) maxX = x; if (y > maxY) maxY = y;
    }
    Marshal.Copy(px, 0, data.Scan0, px.Length);
    bmp.UnlockBits(data);
    if (maxX <= minX) return bmp;
    int pad = 2;
    minX = Math.Max(0, minX-pad); minY = Math.Max(0, minY-pad);
    maxX = Math.Min(w-1, maxX+pad); maxY = Math.Min(h-1, maxY+pad);
    return bmp.Clone(Rectangle.FromLTRB(minX, minY, maxX+1, maxY+1), PixelFormat.Format32bppArgb);
  }
  static void TryEnq(int[] px, bool[] vis, int[] q, ref int qe, int x, int y, int w, int h) {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    int i = y*w + x;
    if (vis[i]) return;
    if (!IsBg(px[i])) return;
    vis[i]=true; q[qe++]=i;
  }
  public static Bitmap Fit(Bitmap src, int tw, int th) {
    Bitmap dst = new Bitmap(tw, th, PixelFormat.Format32bppArgb);
    using (Graphics g = Graphics.FromImage(dst)) {
      g.Clear(Color.Transparent);
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      float s = Math.Min((float)tw/src.Width, (float)th/src.Height);
      int nw = Math.Max(1, (int)Math.Round(src.Width*s));
      int nh = Math.Max(1, (int)Math.Round(src.Height*s));
      g.DrawImage(src, (tw-nw)/2, (th-nh)/2, nw, nh);
    }
    return dst;
  }
  public static Bitmap OverlayEyes(Bitmap baseImg, Bitmap face) {
    Bitmap dst = (Bitmap)baseImg.Clone();
    using (Graphics g = Graphics.FromImage(dst)) {
      g.InterpolationMode = InterpolationMode.NearestNeighbor;
      g.PixelOffsetMode = PixelOffsetMode.Half;
      g.SmoothingMode = SmoothingMode.None;
      DrawEye(g, face, 6, 13, 5, 4, 28.6f, 46.3f, 1.4f, 18f);
      DrawEye(g, face, 13, 13, 5, 4, 44.8f, 43.8f, 1.4f, -16f);
    }
    return dst;
  }
  static void DrawEye(Graphics g, Bitmap face, int sx, int sy, int sw, int sh, float cx, float cy, float scale, float angle) {
    using (Bitmap eye = new Bitmap(sw, sh, PixelFormat.Format32bppArgb)) {
      for (int y = 0; y < sh; y++) {
        for (int x = 0; x < sw; x++) {
          Color p = face.GetPixel(sx + x, sy + y);
          int rng = Math.Max(p.R, Math.Max(p.G, p.B)) - Math.Min(p.R, Math.Min(p.G, p.B));
          bool gray = rng <= 45 && p.A > 16;
          bool red = p.R > p.G + 40 && Math.Abs(p.G - p.B) <= 30 && p.A > 16;
          eye.SetPixel(x, y, (gray || red) ? Color.FromArgb(255, p) : Color.Transparent);
        }
      }
      float dw = sw * scale;
      float dh = sh * scale;
      var state = g.Save();
      g.TranslateTransform(cx, cy);
      g.RotateTransform(angle);
      g.DrawImage(eye, -dw/2f, -dh/2f, dw, dh);
      g.Restore(state);
    }
  }
}
"@

$src = "C:\Users\slipk\AppData\Roaming\Cursor\User\workspaceStorage\2ca6becaa78aed21dfb202c6bf905eec\images\Gemini_Generated_Image_kqw1zxkqw1zxkqw1-967d70aa-5d00-471f-8fae-b2439e0ff1ef.jpg"
$outDir = Join-Path $PSScriptRoot "..\assets\doom"
$orig = New-Object System.Drawing.Bitmap $src
$cut = [Mugshot]::KeyAndCrop($orig)
$cut.Save((Join-Path $outDir "mugshot-base.png"), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "cropped=$($cut.Width)x$($cut.Height)"
$fitted = [Mugshot]::Fit($cut, 75, 80)
foreach ($id in @("00","01","02")) {
  $face = New-Object System.Drawing.Bitmap (Join-Path $outDir "STFST$id.png")
  $framed = [Mugshot]::OverlayEyes($fitted, $face)
  $framed.Save((Join-Path $outDir "mugshot-$id.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $face.Dispose()
  $framed.Dispose()
  Write-Output "wrote mugshot-$id.png"
}
$orig.Dispose()
$cut.Dispose()
$fitted.Dispose()
Write-Output "done"
