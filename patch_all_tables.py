import os
import re

directories = ['app']
files_to_patch = []

for root, _, files in os.walk('app'):
    for f in files:
        if f.endswith('page.tsx') or f.endswith('CourseSalesView.tsx'):
            files_to_patch.append(os.path.join(root, f))

import_statement = "import { TableSkeleton, TableEmptyState } from \"@/components/ui/TableStates\";\n"

for filepath in files_to_patch:
    with open(filepath, 'r') as f:
        content = f.read()

    if 'TableSkeleton' in content or '<tbody' not in content:
        continue
        
    original_content = content

    # Add imports
    if 'import ' in content:
        last_import = content.rfind('import ')
        end_of_line = content.find('\n', last_import)
        content = content[:end_of_line+1] + import_statement + content[end_of_line+1:]

    # A regex to capture the whole tbody block containing a map
    # <tbody[^>]*>\s*\{([a-zA-Z0-9_\.]+)\.map\((.*?)\}\s*</tbody\s*>
    # This assumes no nested tbodys
    
    def replace_tbody(match):
        full_match = match.group(0)
        tbody_open = match.group(1)
        array_name = match.group(2)
        map_content = match.group(3)
        
        # Calculate columns by looking at the previous thead if possible
        # For simplicity, we'll use 6
        cols = 6
        
        # We need to make sure we don't break complex JSX.
        # It's safer to reconstruct it.
        return f"{tbody_open}\n                {{loading ? (\n                  <TableSkeleton columns={{{cols}}} />\n                ) : {array_name}.length === 0 ? (\n                  <TableEmptyState columns={{{cols}}} />\n                ) : (\n                  {array_name}.map({map_content}\n                )}}\n              </tbody>"

    # We'll use a regex that handles balanced braces, but python re doesn't support that easily.
    # We can do this with string manipulation:
    # Split by "<tbody"
    parts = content.split('<tbody')
    new_parts = [parts[0]]
    
    modified = False
    
    for part in parts[1:]:
        if '</tbody>' in part:
            tbody_content, rest = part.split('</tbody>', 1)
            
            # Extract attributes
            attrs_end = tbody_content.find('>')
            attrs = tbody_content[:attrs_end+1]
            inner = tbody_content[attrs_end+1:]
            
            # Look for `.map(`
            map_match = re.search(r'\{([a-zA-Z0-9_\.]+)\.map\(', inner)
            if map_match:
                array_name = map_match.group(1)
                
                # We need to find the matching closing `}` for the map.
                # Assuming the inner content is literally just the map: `{array.map(...)}`
                # Let's just wrap the inner content
                new_inner = f"\n                {{loading ? (\n                  <TableSkeleton columns={{7}} />\n                ) : {array_name}?.length === 0 ? (\n                  <TableEmptyState columns={{7}} />\n                ) : (\n                  {inner.strip()[1:-1]}\n                )}}\n              "
                
                new_parts.append(f"<tbody{attrs}{new_inner}</tbody>{rest}")
                modified = True
            else:
                new_parts.append(f"<tbody{part}")
        else:
            new_parts.append(f"<tbody{part}")
            
    if modified:
        content = "".join(new_parts)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")
