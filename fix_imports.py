import os

files_to_patch = []
for root, _, files in os.walk('app'):
    for f in files:
        if f.endswith('page.tsx') or f.endswith('CourseSalesView.tsx'):
            files_to_patch.append(os.path.join(root, f))

target = 'import { TableSkeleton, TableEmptyState } from "@/components/ui/TableStates";\n'

for filepath in files_to_patch:
    with open(filepath, 'r') as f:
        content = f.read()

    if target in content:
        # Remove the target line from wherever it is
        content = content.replace(target, '')
        # Remove it if it has no trailing newline too
        content = content.replace('import { TableSkeleton, TableEmptyState } from "@/components/ui/TableStates";', '')
        
        # Add it right after 'use client';
        # or at the top of the file
        if '"use client";' in content:
            content = content.replace('"use client";', '"use client";\n' + target)
        elif "'use client';" in content:
            content = content.replace("'use client';", "'use client';\n" + target)
        else:
            content = target + content
            
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed imports in {filepath}")
