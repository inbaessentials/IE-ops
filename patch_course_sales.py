import re

filepath = 'app/orders/CourseSalesView.tsx'
with open(filepath, 'r') as file:
    content = file.read()

loading_state = "\n  const [loading, setLoading] = useState(true);\n  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);\n"

functions_to_patch = ['function GymRevenueView() {', 'function ClinicBillingView() {']

for func in functions_to_patch:
    if loading_state not in content and func in content:
        parts = content.split(func)
        if len(parts) == 2:
            if 'const [loading' not in parts[1][:200] and 'const loading' not in parts[1][:200]:
                content = parts[0] + func + loading_state + parts[1]

with open(filepath, 'w') as file:
    file.write(content)

print(f"Patched sub-components in {filepath}")
