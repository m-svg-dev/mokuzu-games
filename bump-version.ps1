param(
  [Parameter(Mandatory)][string]$Version
)

function ReplaceInFile($path, $pattern, $replacement) {
  $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
  $updated = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, $replacement)
  [System.IO.File]::WriteAllText($path, $updated, [System.Text.Encoding]::UTF8)
}

ReplaceInFile "script.js"    "const CURRENT_VERSION = '[^']*'"  "const CURRENT_VERSION = '$Version'"
ReplaceInFile "index.html"   'v=[\d.]+'                          "v=$Version"
ReplaceInFile "index.html"   'バージョン [\d.]+'                 "バージョン $Version"
[System.IO.File]::WriteAllText("version.json", "{`"version`":`"$Version`"}`n", [System.Text.Encoding]::UTF8)

Write-Host "✅ バージョンを $Version に更新しました" -ForegroundColor Green
Write-Host "   script.js   CURRENT_VERSION = '$Version'"
Write-Host "   index.html  ?v=$Version / バージョン $Version"
Write-Host "   version.json  version: $Version"
