# Replace shadow* style prop blocks with Platform-aware boxShadow using the shadow utility
# This script does a regex replacement for the common pattern:
#   shadowColor: '...',
#   shadowOffset: { ... },
#   shadowOpacity: ...,
#   shadowRadius: ...,
# With:
#   ...shadows.md(),
# (keeping elevation where it exists)

$files = Get-ChildItem -Path ".\screens",".\components" -Filter "*.js" -Recurse

$pattern = @"
,?\s*shadowColor:\s*['"][^'"]*['"],\s*
\s*shadowOffset:\s*\{[^}]+\},\s*
\s*shadowOpacity:\s*[\d.]+,\s*
\s*shadowRadius:\s*[\d.]+
"@

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # Check if file has shadow props
    if ($content -match 'shadowColor') {
        Write-Host "Processing: $($file.Name)"

        # Add import if not present
        if ($content -notmatch "from.*utils/shadow") {
            $content = $content -replace "(import .+ from 'react-native';)", "`$1`nimport { shadows } from '../utils/shadow';"
        }

        # Remove shadow* blocks (keep elevation lines)
        $content = $content -replace ",?\s*shadowColor:\s*'[^']*'[,]?\s*`r?`n\s*shadowOffset:\s*\{[^}]+\}[,]?\s*`r?`n\s*shadowOpacity:\s*[\d.]+[,]?\s*`r?`n\s*shadowRadius:\s*[\d.]+", ""

        if ($content -ne $original) {
            Set-Content $file.FullName $content -NoNewline
            Write-Host "  Updated: $($file.Name)"
        }
    }
}

Write-Host "Done."
