files_to_fix = [
    "app/db.py",
    "app/main.py",
    "app/models/gis.py",
    "app/models/market.py",
    "app/models/user.py",
    "app/models/weather.py",
    "app/services/ai_market.py",
    "app/services/ai_weather.py",
    "app/services/gis_service.py",
    "app/utils/__init__.py"
]

placeholder = {
    "app/main.py": """from fastapi import FastAPI

app = FastAPI(title="Web Petani Wonosobo API")

@app.get("/")
def root():
    return {"message": "Backend minimal jalan 🚀"}
""",
    "default": "# placeholder file\n"
}

for path in files_to_fix:
    content = placeholder.get(path, placeholder["default"])
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("✅ Semua file sudah dioverwrite dengan placeholder bersih.")
# This script overwrites specified files with clean placeholder content to remove any hidden null bytes or unwanted characters.