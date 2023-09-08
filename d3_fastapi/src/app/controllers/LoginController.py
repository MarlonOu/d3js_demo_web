# from fastapi import APIRouter, Depends, Body
# from datetime import datetime, timedelta
# from typing import Optional
# from fastapi.security import OAuth2PasswordBearer

# login = APIRouter(prefix="/api/login", tags=["addition"])
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="123")


# @login.get("/")
# async def test(s: str = Depends(oauth2_scheme)):
#     return {"hello": s}

from fastapi import APIRouter, Depends, Body, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database.database import engine, Base, get_db
from repositories.LoginRepositories import LoginRepositories


login = APIRouter(prefix="/api", tags=["addition"])
loginFun = LoginRepositories()


@login.post("/login")
# 不同從API輸入取值的方式 postman form-data or x-xxx-form-urlencoded
# async def get_token(user_name: str = Form(...), password: str = Form(...)):

async def get_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    # 驗證登入資訊

    loginFun.db = db
    user_id = loginFun.get_user_id(form_data.username, form_data.password)
    if not user_id:
        return HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Incorrect username or password !"
            )
    else:
        data = {"user_id": user_id, "username": form_data.username}
        token = loginFun.create_jwt_token(data)
        if loginFun.update_user_token(user_id, token):
            return {"token": token}
        else:
            return HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Update token fail !"
            )


@login.get("/get-userid")
async def get_userid(
    token: str = Depends(loginFun.oauth2_scheme), db: Session = Depends(get_db)
):
    loginFun.db = db
    return loginFun.verify_jwt_token(token)

@login.post('/signup', status_code=status.HTTP_201_CREATED)
async def signup(
    name: str = Form(...),
    password: str = Form(...),
    age: int = Form(...),
    sex: str = Form(...),
    db: Session = Depends(get_db)
):
    loginFun.db = db
    user_data = {
        "name": name,
        "password": password,
        "age": age,
        "sex": sex
    }
    is_exist = loginFun.is_user_exist(user_data) # type: ignore
    if not is_exist:
        if loginFun.register_user(user_data): # type: ignore
            return 'register successfully'
        else:
            return HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to register user !"
            )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Duplicate username !"
    )


@login.put('/change-password')
async def change_password(
    token: str = Depends(loginFun.oauth2_scheme),
    old_password: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db)
):
    loginFun.db = db
    res = loginFun.change_password(old_password, new_password, token)
    return res
    
@login.put('/change-userdata')
async def change_userdata(
    token: str = Depends(loginFun.oauth2_scheme),
    name: str = Form(...),
    age: str = Form(...),
    sex: str = Form(...),
    db: Session = Depends(get_db)
):
    loginFun.db = db
    res = loginFun.change_userdata(name, int(age), sex, token)
    return res