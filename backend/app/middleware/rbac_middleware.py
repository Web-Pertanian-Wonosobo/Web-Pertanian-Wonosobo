from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from app.config import settings

class RBACMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Proteksi routes admin panel
        protected_routes = [
            "/admin",
            "/dashboard", 
            "/kelola_harga",
            "/kelola_user",
        ]

        # Jika akses protected routes, wajib auth + role admin
        if any(request.url.path.startswith(route) for route in protected_routes):
            auth_header = request.headers.get("Authorization")
            
            # Cek header Authorization
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Authorization header required")
            
            # Extract token
            try:
                token = auth_header.split(" ")[1]
                if not token:
                    raise HTTPException(status_code=401, detail="Token missing")
            except IndexError:
                raise HTTPException(status_code=401, detail="Invalid authorization header format")
            
            try:
                # Decode token dengan secret key
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

                # Cek role user - HARUS admin
                user_role = payload.get("role")
                if user_role != "admin":
                    raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
                
                # Add user info to request state
                request.state.user = payload
                
            except JWTError:
                raise HTTPException(status_code=401, detail="Invalid or expired token")

        # Lanjut ke endpoint
        response = await call_next(request)
        return response