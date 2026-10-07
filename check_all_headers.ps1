$dirs = Get-ChildItem -Recurse -Filter "*.html" ar\
$legacy_en = 0
$new_en = 0
$new_ar = 0
$other = 0

foreach ($file in $dirs) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # 1. Legacy EN (logo-area)
    if ($content -match '(?s)<a[^>]*class="logo-area"[^>]*>.*?<span>DailyCalcHubs</span>') {
        $legacy_en++
    }
    # 2. New EN (brand-logo-area)
    elseif ($content -match '(?s)class="brand-logo-area".*?class="logo-title">DailyCalc') {
        $new_en++
    }
    # 3. New AR (brand-logo-area with ديلي كالك)
    elseif ($content -match '(?s)class="brand-logo-area".*?class="logo-title">ديلي كالك') {
        $new_ar++
    } else {
        $other++
        Write-Host "UNMATCHED: $($file.FullName)"
    }
}
Write-Host "Legacy EN: $legacy_en"
Write-Host "New EN: $new_en"
Write-Host "New AR: $new_ar"
Write-Host "Other: $other"
