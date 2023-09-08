from fastapi import APIRouter, Depends, Body, HTTPException, status, Form
from sqlalchemy.orm import Session
from database.database import engine, Base, get_db
from repositories.LoginRepositories import LoginRepositories
from components.ecc.ECC_KEY import ECC

ecc = APIRouter(prefix="/api/ecc", tags=["addition"])
Ecc = ECC()
loginFunc = LoginRepositories()

@ecc.get("/generate")
async def key_generate(
    db: Session = Depends(get_db), token: str = Depends(loginFunc.oauth2_scheme)
):
    loginFunc.db = db
    verify_res = loginFunc.verify_jwt_token(token)
    if "hello" in verify_res:
        private_key, public_key = Ecc.make_keypair()  # type: ignore
        private_key = hex(private_key)
        public_key = "(0x{:x}, 0x{:x})".format(*public_key)  # type: ignore
        return {"private_key": private_key, "public_key": public_key}
    return verify_res
