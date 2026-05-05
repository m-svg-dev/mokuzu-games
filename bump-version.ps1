param(
  [Parameter(Mandatory)][string]$Version,
  [switch]$Push
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

git add script.js index.html version.json
git commit -m "Bump version to $Version"

if ($Push) {
  git push
  Write-Host "pushed!" -ForegroundColor Cyan
}

Write-Host "v$Version" -ForegroundColor Green
