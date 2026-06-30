from fastapi import FastAPI

app = FastAPI(title="Palette API")


@app.get("/")
def root():
    return {"status": "ok", "service": "palette-api"}
