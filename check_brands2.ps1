$dirs = Get-ChildItem -Recurse -Filter "*.html" ar\
$en_count = 0
$ar_count = 0

foreach ($file in $dirs) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    # Check the header
    if ($content -match '(?s)<header class="site-header">.*?<div class="logo-title">([^<]*)<span[^>]*>([^<]*)</span></div>') {
        $text1 = $matches[1]
        $text2 = $matches[2]
        if ($text1 -match "ديلي كالك") {
            $ar_count++
            Write-Host "AR BRAND: $($file.FullName)"
        } elseif ($text1 -match "DailyCalc") {
            $en_count++
        }
    } elseif ($content -match '(?s)<header class="site-header">.*?<span class="logo-title">([^<]*)<span[^>]*>([^<]*)</span></span>') {
        $text1 = $matches[1]
        $text2 = $matches[2]
        if ($text1 -match "ديلي كالك") {
            $ar_count++
            Write-Host "AR BRAND: $($file.FullName)"
        } elseif ($text1 -match "DailyCalc") {
            $en_count++
        }
    }
}
Write-Host "EN count: $en_count"
Write-Host "AR count: $ar_count"
