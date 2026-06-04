import os
import re

directories = ["app", "components"]

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Patch: {var.length === 0 ? (
    # To:    {!loading && var.length === 0 ? (
    # Note: we only want to match outer brackets that start a JSX expression.
    # E.g. `{filteredExpenses.length === 0 ? (`
    # But wait, sometimes there is space: `{ filteredExpenses.length === 0 ? (`
    # We use regex: r'\{\s*([a-zA-Z0-9_?.]+length)\s*===\s*0\s*\?\s*\('
    
    pattern_zero = r'\{\s*([a-zA-Z0-9_?.]+length)\s*===\s*0\s*\?\s*\('
    content = re.sub(pattern_zero, r'{(!loading && \1 === 0) ? (', content)

    # Patch: {var.length > 0 ? (
    # To:    {(loading || var.length > 0) ? (
    pattern_gt_zero = r'\{\s*([a-zA-Z0-9_?.]+length)\s*>\s*0\s*\?\s*\('
    content = re.sub(pattern_gt_zero, r'{(loading || \1 > 0) ? (', content)

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched outer checks in {filepath}")

for root, _, files in os.walk("."):
    for file in files:
        if file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            # Only patch files in app or components directories
            if "app/" in filepath or "components/" in filepath:
                patch_file(filepath)
