from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from app.middleware import RBACMiddleware
from app import main
from app.config import settings

class RBACMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Hanya proteksi route /admin
        protected_routes = ["/admin"]
 
        # Jika path diawali dengan /admin maka wajib auth
        if any(request.url.path.startswith(route) for route in protected_routes):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Invalid Token")

            token = auth_header.split(" ")[1]
            role =payload.get("role")
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                request.state.user = payload
            except JWTError:
                raise HTTPException(status_code=401, detail="Invalid or expired token")
            if role != "admin":
                raise HTTPException(status_code=403, detail="Access forbidden: Admins only")

        # selain /admin bisa lanjut tanpa token
        response = await call_next(request)
        return response
