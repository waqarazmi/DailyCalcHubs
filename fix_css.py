import re

with open('theme.css', 'rb') as f:
    content = f.read().decode('utf-8')

# Target 1: .nav-link-item { ... }
content = re.sub(r'(\.nav-link-item\s*\{[^}]+)(\n\})', r'\1\n    white-space: nowrap !important;\2', content, count=1)

# Target 2: .nav-dropdown-btn { ... }
content = re.sub(r'(\.nav-dropdown-btn\s*\{[^}]+)(\n\})', r'\1\n    white-space: nowrap !important;\2', content, count=1)

# Target 3: .lang-switch-btn { ... }
content = re.sub(r'(\.lang-switch-btn\s*\{[^}]+)(\n\})', r'\1\n    white-space: nowrap !important;\2', content, count=1)

with open('theme.css', 'wb') as f:
    f.write(content.encode('utf-8'))