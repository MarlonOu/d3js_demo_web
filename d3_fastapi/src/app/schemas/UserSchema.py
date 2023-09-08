from pydantic import BaseModel, Field


class UserBase(BaseModel):
    name: str
    password: str
    token: str = None  # type: ignore
    age: int
    sex: str


class UserRequest(UserBase):
    pass


class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True
