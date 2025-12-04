from fastapi import FastAPI, HTTPException
from app.schemas.market_schema import MarketPriceCreate
import logging

# Test endpoint untuk debugging schema validation
app = FastAPI()

@app.post("/test")
def test_schema(data: MarketPriceCreate):
    try:
        logging.info(f"Received data: {data}")
        return {"status": "success", "data": data.dict()}
    except Exception as e:
        logging.error(f"Error: {e}")
        raise HTTPException(status_code=422, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)