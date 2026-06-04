import os
import re

for root, _, files in os.walk('app'):
    for f in files:
        if f.endswith('page.tsx') or f.endswith('CourseSalesView.tsx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r') as file:
                content = file.read()

            # Skip if loading is already defined
            if 'const loading =' in content or 'const [loading' in content or 'let loading =' in content:
                continue

            # Skip if we didn't inject our TableSkeleton here
            if 'TableSkeleton' not in content:
                continue

            # Ensure useState and useEffect are imported if we are using them
            if 'import { useState' not in content and 'import React, { useState' not in content:
                # Let's just use React.useState and React.useEffect to be safe
                loading_state = "\n  const [loading, setLoading] = React.useState(true);\n  React.useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);\n"
            else:
                loading_state = "\n  const [loading, setLoading] = useState(true);\n  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);\n"

            # Find the main component function
            # usually `export default function Page()` or `export function View()`
            match = re.search(r'export (default )?function [a-zA-Z0-9_]+\s*\([^)]*\)\s*\{', content)
            if match:
                insert_pos = match.end()
                content = content[:insert_pos] + loading_state + content[insert_pos:]
                
                with open(filepath, 'w') as file:
                    file.write(content)
                print(f"Added loading state to {filepath}")
