with open("app/page.tsx", "r") as f:
    content = f.read()

if 'import { Button } from "@/components/ui/Button";' not in content:
    content = content.replace('import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";', 'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";\nimport { Button } from "@/components/ui/Button";')

with open("app/page.tsx", "w") as f:
    f.write(content)
print("Button import fixed.")
