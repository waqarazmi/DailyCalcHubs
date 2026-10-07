$dirs = Get-ChildItem -Recurse -Filter "*.html" ar\
$success = 0
$fail = 0

foreach ($file in $dirs) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    $desktopOk = $content -match '<span class="logo-title">دلي كالك <span>هبز</span></span>'
    $mobileOk = $content -match 'دلي كالك <span.*?>هبز</span></span>'
    
    if ($desktopOk -and $mobileOk) {
        $success++
    } else {
        $fail++
        Write-Host "FAIL: $($file.FullName)"
    }
}
Write-Host "Success: $success"
Write-Host "Fail: $fail"
