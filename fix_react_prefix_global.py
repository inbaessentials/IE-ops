import os

for root, _, files in os.walk('app'):
    for f in files:
        if f.endswith('page.tsx') or f.endswith('CourseSalesView.tsx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r') as file:
                content = file.read()

            if "React.useState" in content or "React.useEffect" in content:
                content = content.replace("React.useState", "useState")
                content = content.replace("React.useEffect", "useEffect")
                
                with open(filepath, 'w') as file:
                    file.write(content)
                print(f"Removed React prefix in {filepath}")
