from fastapi import HTTPException, status, Form, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import JWSError, jwt

from fastapi.security import OAuth2PasswordBearer
from database.database import engine, Base, get_db
from repositories.UserRepository import UserRepository
from schemas.UserSchema import UserResponse, UserRequest
from models.User import User

class LoginRepositories:
    def __init__(self):
        self.SECRET_KEY = "ed970259a19edfedf1010199c7002d183bd15bcaec612481b29bac1cb83d8137"
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        self.oauth2_scheme = OAuth2PasswordBearer(tokenUrl="123")
        self.db: Session 

    def get_user_id(self, user_name: str, password: str):
        user = UserRepository.find_all(self.db)
        for u in user:
            if UserResponse.from_orm(u).name == user_name:
                if UserResponse.from_orm(u).password == password:
                    return UserResponse.from_orm(u).id
        return 0


    def update_user_token(self, id: int, token: str):
        if not UserRepository.exists_by_id(self.db, id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="user not found"
            )
        try:
            UserRepository.save(self.db, User(id=id, token=token))
            return True
        except:
            return False


    def create_jwt_token(self, data: dict, expire_delta: Optional[timedelta] = None):
        # token有效時間
        expire = (
            datetime.utcnow() + expire_delta
            if expire_delta
            else datetime.utcnow() + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        # exp是規範寫法
        data.update({"exp": expire})
        # jwt加密
        token = jwt.encode(claims=data, key=self.SECRET_KEY, algorithm=self.ALGORITHM)

        return token


    def verify_jwt_token(self, token: str):
        # 定義一個異常返回
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="verify fail",
            # OAuth2規範 要加入下列key value
            headers={"WWW-Authenticate": "Bearer"},
        )

        # 驗證token
        try:
            payload = jwt.decode(token=token, key=self.SECRET_KEY, algorithms=[self.ALGORITHM])
            # print(f"paload: {payload}")
            user_id = payload.get("user_id")
            # print(f"user_id: {user_id}")
            if not user_id:
                raise credentials_exception
        except JWSError as e:
            print(f"verify error: {e}")
            raise credentials_exception
        if not self.verify_user_token(user_id, token):
            return f"user token verify fail !"
        else:
            return {"hello": user_id}


    def verify_user_token(self, user_id: int, token: str):
        # 驗證user
        user = UserRepository.find_by_id(self.db, user_id)
        if UserResponse.from_orm(user).token == token:
            return True
        return False
    
    def is_user_exist(self, user_data: UserRequest):
        # 驗證user是否已註冊
        is_exist = 0
        users = UserRepository.find_all(self.db)
        for u in users:
            if UserResponse.from_orm(u).name == user_data['name']: # type: ignore
                is_exist = 1
        return is_exist

    
    def register_user(self, user_data: UserRequest):
        try:
            user = UserRepository.save(self.db, User(**user_data))
            user = UserResponse.from_orm(user)
        except:
            return False
        return True
        # data = {"user_id": user.id, "username": user.name}
        # token = self.create_jwt_token(data)
        # if self.update_user_token(user.id, token):
        #     return {"token": token}
        # else:
        #     return "update token fail"
    
    def change_password(self, old_password: str, new_password: str, token: str):
        try:
            user_id = self.verify_jwt_token(token)['hello'] # type: ignore
        except:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='token decrypt fail !'
            )
        user = UserRepository.find_by_id(self.db, user_id) # type: ignore
        if user.password == old_password:
            user.password = new_password
            user = UserRepository.save(self.db, user)
            raise HTTPException(
                status_code=status.HTTP_201_CREATED, detail='Password changed successfully'
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="old password input error !"
            )
        
    def change_userdata(self, user_name: str, user_age: int, user_sex: str, token: str):
        try:
            user_id = self.verify_jwt_token(token)['hello'] # type: ignore
        except:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='token decrypt fail !'
            )
        user = UserRepository.find_by_id(self.db, user_id) # type: ignore
        user.name, user.age, user.sex = user_name, user_age, user_sex
        user = UserRepository.save(self.db, user)
        raise HTTPException(
            status_code=status.HTTP_201_CREATED, detail='User Data changed successfully'
        )
        