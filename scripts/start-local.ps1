# Starts a local static file server for RentACar and opens it in the default browser.
# No build step is needed - this just serves the repo root as-is (matches GitHub Pages behavior).
param(
    [int]$Port = 8000
)

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "Serving $repoRoot on http://localhost:$Port (Ctrl+C to stop)" -ForegroundColor Cyan
Start-Process "http://localhost:$Port"
python -m http.server $Port
