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
    $headerPattern = '(?s)(<header class="site-header">.*?</header>)'
    if ($content -match $headerPattern) {
        $header = $matches[1]
        $newHeader = $header
        
        # PATTERN B & A: Strip inline styles from Hubs span, standardize structure
        $newHeader = [regex]::Replace($newHeader, '(?s)<div class="logo-title"[^>]*>ديلي كالك <span[^>]*>هَبز</span></div>', '<span class="logo-title">دلي كالك <span>هبز</span></span>')
        $newHeader = [regex]::Replace($newHeader, '(?s)<div class="logo-title"[^>]*>DailyCalc<span[^>]*>Hubs</span></div>', '<span class="logo-title">دلي كالك <span>هبز</span></span>')
        $newHeader = [regex]::Replace($newHeader, '(?s)<span class="logo-title">DailyCalc<span[^>]*>Hubs</span></span>', '<span class="logo-title">دلي كالك <span>هبز</span></span>')

        # PATTERN C: Legacy Header
        if ($newHeader -match '(?s)<a [^>]*class="logo-area"[^>]*>.*?</a>') {
            $matchesC = [regex]::Matches($newHeader, '(?s)<a [^>]*class="logo-area"[^>]*>.*?</a>')
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
                $newBlock = "<a href=`"/ar/`" class=`"brand-logo-area`">`n          <div class=`"logo-icon-box`">`n            <i class=`"fas $icon`"></i>`n          </div>`n          <div class=`"logo-text-group`">`n            <span class=`"logo-title`">دلي كالك <span>هبز</span></span>`n            <span class=`"logo-subtitle`">$subtitle</span>`n          </div>`n        </a>"
                $newHeader = $newHeader.Replace($legacyHeader, $newBlock)
            }
        }

        # PATTERN D: Minimal
        if ($newHeader -match '(?s)<a [^>]*class="brand-logo"[^>]*>.*?</a>') {
            $matchesD = [regex]::Matches($newHeader, '(?s)<a [^>]*class="brand-logo"[^>]*>.*?</a>')
            foreach ($match in $matchesD) {
                $minimalHeader = $match.Value
                $newBlock = "<a href=`"/ar/`" class=`"brand-logo-area`">`n          <div class=`"logo-icon-box`">`n            <i class=`"fas fa-calculator`"></i>`n          </div>`n          <div class=`"logo-text-group`">`n            <span class=`"logo-title`">دلي كالك <span>هبز</span></span>`n            <span class=`"logo-subtitle`">أدوات سعودية لغدٍ أذكى</span>`n          </div>`n        </a>"
                $newHeader = $newHeader.Replace($minimalHeader, $newBlock)
            }
        }

        $content = $content.Replace($header, $newHeader)
    }

    if ($original -ne $content) {
        [System.IO.File]::WriteAllBytes($file.FullName, [System.Text.Encoding]::UTF8.GetBytes($content))
    }
}
