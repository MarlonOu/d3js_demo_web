from fastapi import FastAPI, Depends, HTTPException, status, Response, APIRouter
from sqlalchemy.orm import Session

from models.User import User
from database.database import engine, Base, get_db
from repositories.UserRepository import UserRepository
from schemas.UserSchema import UserRequest, UserResponse

Base.metadata.create_all(bind=engine)

user = APIRouter(prefix="/api/user", tags=["addition"])


@user.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create(request: UserRequest, db: Session = Depends(get_db)):
    user = UserRepository.save(db, User(**request.dict()))
    return UserResponse.from_orm(user)  # type: ignore


@user.get("/", response_model=list)
def find_all(db: Session = Depends(get_db)):
    user = UserRepository.find_all(db)
    return [UserResponse.from_orm(u) for u in user]


@user.get("/{id}", response_model=UserResponse)
def find_by_id(id: int, db: Session = Depends(get_db)):
    user = UserRepository.find_by_id(db, id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="user not found"
        )
    return UserResponse.from_orm(user)


@user.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_by_id(id: int, db: Session = Depends(get_db)):
    if not UserRepository.exists_by_id(db, id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="user not found"
        )
    UserRepository.delete_by_id(db, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@user.put("/{id}", response_model=UserResponse)
def update(id: int, request: UserRequest, db: Session = Depends(get_db)):
    if not UserRepository.exists_by_id(db, id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="user not found"
        )
    user = UserRepository.save(db, User(id=id, **request.dict()))
    return UserResponse.from_orm(user)
