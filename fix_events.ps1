$ErrorActionPreference = 'Stop'

function Update-Events {
    param([string]$filepath)
    $content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)

    $content = [regex]::Replace($content, "document\.getElementById\('birthDate'\)\.value = targetYear \+ '-' \+ m \+ '-' \+ d;\s*calculateDetailedAge\(\);", "document.getElementById('birthDate').value = targetYear + '-' + m + '-' + d;`r`n      document.getElementById('birthDate').dispatchEvent(new Event('change'));`r`n      calculateDetailedAge();")

    $content = [regex]::Replace($content, "document\.getElementById\('targetDate'\)\.value = todayStr;\s*calculateDetailedAge\(\);", "document.getElementById('targetDate').value = todayStr;`r`n      document.getElementById('targetDate').dispatchEvent(new Event('change'));`r`n      calculateDetailedAge();")

    $content = [regex]::Replace($content, "document\.getElementById\('targetDate'\)\.dispatchEvent\(new Event\('change'\)\);`r`n      calculateDetailedAge\(\);\s*}\);", "document.getElementById('targetDate').dispatchEvent(new Event('change'));`r`n      initMobileDateSync();`r`n      calculateDetailedAge();`r`n    });")

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
    [System.IO.File]::WriteAllBytes($filepath, $bytes)
}

Update-Events "everyday-smart-calculator/age-calculator/index.html"
Update-Events "ar/everyday-smart-calculator/age-calculator/index.html"
