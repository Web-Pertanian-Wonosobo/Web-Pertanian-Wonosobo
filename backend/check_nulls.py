import os

base_dir = "."

for root, _, files in os.walk(base_dir):
    for f in files:
        if f.endswith(".py"):
            path = os.path.join(root, f)
            with open(path, "rb") as file:
                content = file.read() 
                if b"\x00" in content:
                    print(f"[!] Null byte found in: {path}")
