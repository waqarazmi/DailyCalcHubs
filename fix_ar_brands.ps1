$dirs = Get-ChildItem -Recurse -Filter "*.html" ar\

foreach ($file in $dirs) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $original = $content
    
    # 1. MOBILE DRAWER FIX
    $drawerPattern = '(?s)(<div class="mobile-nav-drawer">.*?</div>\s*<div class="mobile-nav-body">)'
    if ($content -match $drawerPattern) {
        $drawer = $matches[1]
        $newDrawer = $drawer -replace '>DailyCalc<span([^>]*)>Hubs</span></span>', '>دلي كالك <span$1>هبز</span></span>'
        $newDrawer = $newDrawer -replace '>DailyCalcHubs</span>', '>دلي كالك <span style="color:#0284c7;">هبز</span></span>'
        $content = $content.Replace($drawer, $newDrawer)
    }

    # 2. DESKTOP HEADER FIXES
    
    # PATTERN B: Rogue Arabic
    $content = [regex]::Replace($content, '(?s)<div class="logo-title"[^>]*>ديلي كالك <span[^>]*>هَبز</span></div>', '<span class="logo-title">دلي كالك <span>هبز</span></span>')
    $content = [regex]::Replace($content, '(?s)<div class="logo-title"[^>]*>DailyCalc<span([^>]*)>Hubs</span></div>', '<span class="logo-title">دلي كالك <span$1>هبز</span></span>')

    # PATTERN A: Modern EN
    $content = [regex]::Replace($content, '(?s)<span class="logo-title">DailyCalc<span([^>]*)>Hubs</span></span>', '<span class="logo-title">دلي كالك <span$1>هبز</span></span>')

    # PATTERN C: Legacy Header
    if ($content -match '(?s)<a [^>]*class="logo-area"[^>]*>.*?</a>') {
        $matchesC = [regex]::Matches($content, '(?s)<a [^>]*class="logo-area"[^>]*>.*?</a>')
        foreach ($match in $matchesC) {
            $legacyHeader = $match.Value
            $icon = "fa-calculator"
            if ($legacyHeader -match 'class="fas ([^"]+)"') {
                $icon = $matches[1]
            }
            $subtitle = "أدوات سعودية لغدٍ أذكى"
            if ($legacyHeader -match '(?s)<span style="display: block;[^>]*>([^<]+)</span>') {
                $subtitle = $matches[1].Trim()
            }
            $newHeader = "<a href=`"/ar/`" class=`"brand-logo-area`">`n          <div class=`"logo-icon-box`">`n            <i class=`"fas $icon`"></i>`n          </div>`n          <div class=`"logo-text-group`">`n            <span class=`"logo-title`">دلي كالك <span>هبز</span></span>`n            <span class=`"logo-subtitle`">$subtitle</span>`n          </div>`n        </a>"
            $content = $content.Replace($legacyHeader, $newHeader)
        }
    }

    # PATTERN D: Minimal
    if ($content -match '(?s)<a [^>]*class="brand-logo"[^>]*>.*?</a>') {
        $matchesD = [regex]::Matches($content, '(?s)<a [^>]*class="brand-logo"[^>]*>.*?</a>')
        foreach ($match in $matchesD) {
            $minimalHeader = $match.Value
            $newHeader = "<a href=`"/ar/`" class=`"brand-logo-area`">`n          <div class=`"logo-icon-box`">`n            <i class=`"fas fa-calculator`"></i>`n          </div>`n          <div class=`"logo-text-group`">`n            <span class=`"logo-title`">دلي كالك <span>هبز</span></span>`n            <span class=`"logo-subtitle`">أدوات سعودية لغدٍ أذكى</span>`n          </div>`n        </a>"
            $content = $content.Replace($minimalHeader, $newHeader)
        }
    }

    if ($original -ne $content) {
        [System.IO.File]::WriteAllBytes($file.FullName, [System.Text.Encoding]::UTF8.GetBytes($content))
    }
}
