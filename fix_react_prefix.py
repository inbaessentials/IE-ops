import os

filepath = 'app/inventory/page.tsx'
with open(filepath, 'r') as file:
    content = file.read()

# Replace React.useState with useState
content = content.replace("React.useState(true)", "useState(true)")
content = content.replace("React.useEffect(()", "useEffect(()")

with open(filepath, 'w') as file:
    file.write(content)

print(f"Removed React prefix in {filepath}")
