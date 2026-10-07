$dirs = Get-ChildItem -Recurse -Filter "*.html" | Where-Object { $_.FullName -notmatch "\\ar\\" }
$legacy = 0
$new_span = 0
$new_div = 0
$other = 0

foreach ($file in $dirs) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # 1. Legacy EN (logo-area)
    if ($content -match '(?s)<a[^>]*class="logo-area"[^>]*>.*?<span>DailyCalcHubs</span>') {
        $legacy++
    }
    # 2. New EN span
    elseif ($content -match '(?s)class="brand-logo-area".*?<span class="logo-title">DailyCalc') {
        $new_span++
    }
    # 3. New EN div
    elseif ($content -match '(?s)class="brand-logo-area".*?<div class="logo-title"[^>]*>DailyCalc') {
        $new_div++
    } else {
        $other++
        Write-Host "UNMATCHED EN: $($file.FullName)"
    }
}
Write-Host "Legacy EN: $legacy"
Write-Host "New EN span: $new_span"
Write-Host "New EN div: $new_div"
Write-Host "Other: $other"
