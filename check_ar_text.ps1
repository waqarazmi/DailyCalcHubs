$dirs = Get-ChildItem -Recurse -Filter "*.html" ar\
$en_dailycalc = 0
$ar_deli_calc = 0
$ar_daily_calc = 0

foreach ($file in $dirs) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match 'دلي كالك هبز') {
        $ar_deli_calc++
        Write-Host "FOUND دلي كالك هبز in $($file.FullName)"
    }
    if ($content -match 'ديلي كالك') {
        $ar_daily_calc++
    }
    if ($content -match 'DailyCalc') {
        $en_dailycalc++
    }
}
Write-Host "دلي كالك هبز count: $ar_deli_calc"
Write-Host "ديلي كالك count: $ar_daily_calc"
Write-Host "DailyCalc count: $en_dailycalc"
