$dirs = Get-ChildItem -Recurse -Filter "*.html" ar\
$results = @{}

foreach ($file in $dirs) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Check Desktop Header
    $desktop = "UNKNOWN"
    if ($content -match '(?s)<header class="site-header">.*?</header>') {
        $header = $matches[0]
        if ($header -match 'دلي كالك هبز') { $desktop = "DLI_CALC_HUBS_APPROVED" }
        elseif ($header -match 'ديلي كالك.*?هَبز') { $desktop = "DAILI_CALC_HUBS_TRANSLITERATION" }
        elseif ($header -match 'DailyCalc.*?Hubs') { $desktop = "DAILY_CALC_HUBS_ENGLISH" }
        else { $desktop = "NO_BRAND_FOUND" }
        
        # Structure
        if ($header -match 'class="brand-logo-area"') { $desktop += " (brand-logo-area)" }
        elseif ($header -match 'class="logo-area"') { $desktop += " (legacy logo-area)" }
    }

    # Check Mobile Drawer Header
    $mobile = "UNKNOWN"
    if ($content -match '(?s)<div class="mobile-nav-drawer">.*?</div>\s*<div class="mobile-nav-body">') {
        $drawer = $matches[0]
        if ($drawer -match 'دلي كالك هبز') { $mobile = "DLI_CALC_HUBS_APPROVED" }
        elseif ($drawer -match 'ديلي كالك.*?هَبز') { $mobile = "DAILI_CALC_HUBS_TRANSLITERATION" }
        elseif ($drawer -match 'DailyCalc.*?Hubs') { $mobile = "DAILY_CALC_HUBS_ENGLISH" }
        else { $mobile = "NO_BRAND_FOUND" }
    } elseif ($content -match '(?s)<div class="mobile-nav-drawer">.*?<div class="mobile-nav-body">') {
        $drawer = $matches[0]
        if ($drawer -match 'DailyCalc') { $mobile = "DAILY_CALC_HUBS_ENGLISH" }
    }

    $key = "Desktop: $desktop | Mobile: $mobile"
    if (-not $results.ContainsKey($key)) {
        $results[$key] = @()
    }
    $results[$key] += $file.FullName.Replace("C:\Users\HP\.gemini\antigravity\scratch\DailyCalcHubs_Live\", "")
}

foreach ($key in $results.Keys) {
    Write-Host "PATTERN: $key"
    Write-Host "Count: $($results[$key].Count)"
    Write-Host "Example 1: $($results[$key][0])"
    if ($results[$key].Count -gt 1) { Write-Host "Example 2: $($results[$key][1])" }
    Write-Host "------------------------"
}
