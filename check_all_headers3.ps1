$dirs = Get-ChildItem -Recurse -Filter "*.html"
$en_total = 0
$ar_total = 0

$en_legacy = 0
$en_new_clean = 0
$en_new_div = 0

$ar_legacy = 0
$ar_new_clean = 0
$ar_new_ar_brand = 0
$ar_new_div = 0

foreach ($file in $dirs) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $is_ar = $file.FullName -match "\\ar\\"
    
    if ($is_ar) { $ar_total++ } else { $en_total++ }
    
    # 1. Legacy
    if ($content -match '(?s)<a[^>]*class="logo-area"') {
        if ($is_ar) { $ar_legacy++ } else { $en_legacy++ }
    }
    # 2. New with AR Brand (ديلي كالك)
    elseif ($content -match '(?s)class="brand-logo-area".*?class="logo-title"[^>]*>ديلي كالك') {
        $ar_new_ar_brand++
    }
    # 3. New with EN Brand and DIV
    elseif ($content -match '(?s)class="brand-logo-area".*?<div class="logo-title"') {
        if ($is_ar) { $ar_new_div++ } else { $en_new_div++ }
    }
    # 4. New with EN Brand and SPAN (Clean Reference)
    elseif ($content -match '(?s)class="brand-logo-area".*?<span class="logo-title">') {
        if ($is_ar) { $ar_new_clean++ } else { $en_new_clean++ }
    }
}
Write-Host "EN Total: $en_total"
Write-Host "  Legacy: $en_legacy"
Write-Host "  New Clean: $en_new_clean"
Write-Host "  New Div: $en_new_div"

Write-Host "AR Total: $ar_total"
Write-Host "  Legacy: $ar_legacy"
Write-Host "  New Clean: $ar_new_clean"
Write-Host "  New AR Brand: $ar_new_ar_brand"
Write-Host "  New Div: $ar_new_div"
