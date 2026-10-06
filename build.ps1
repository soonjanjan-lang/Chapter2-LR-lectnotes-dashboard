# Assembles index.html from src/shell.html and every src/sections/*.html partial
# (in filename order). Run from the project folder:
#   powershell -ExecutionPolicy Bypass -File .\build.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object System.Text.UTF8Encoding($false)

$shell = [System.IO.File]::ReadAllText((Join-Path $root 'src\shell.html'), $utf8)
$parts = Get-ChildItem (Join-Path $root 'src\sections') -Filter '*.html' | Sort-Object Name
$sb = New-Object System.Text.StringBuilder
foreach ($p in $parts) {
  [void]$sb.AppendLine("<!-- ===== $($p.Name) ===== -->")
  [void]$sb.AppendLine([System.IO.File]::ReadAllText($p.FullName, $utf8))
}
if ($shell.IndexOf('{{SECTIONS}}') -lt 0) { throw 'src/shell.html is missing the {{SECTIONS}} placeholder' }
$html = $shell.Replace('{{SECTIONS}}', $sb.ToString())
[System.IO.File]::WriteAllText((Join-Path $root 'index.html'), $html, $utf8)

$kb = [Math]::Round(($utf8.GetByteCount($html)) / 1KB, 1)
Write-Output ("Built index.html from {0} section files ({1} KB)" -f $parts.Count, $kb)
