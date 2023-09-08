from fastapi import FastAPI, Depends, HTTPException, status, Response, APIRouter
from sqlalchemy.orm import Session

from models.KeyWarehouse import KeyWarehouse
from database.database import engine, Base, get_db
from repositories.KeyWarehouseRepository import KeyWarehouseRepository
from schemas.KeyWarehouseSchema import KeyWarehouseRequest, KeyWarehouseResponse
from models.KeyWarehouse import KeyWarehouse
from repositories.LoginRepositories import LoginRepositories

Base.metadata.create_all(bind=engine)

keys = APIRouter(prefix="/api/keys", tags=["addition"])
loginFunc = LoginRepositories()


@keys.post(
    "/", response_model=KeyWarehouseResponse, status_code=status.HTTP_201_CREATED
)
def create(
    request: KeyWarehouseRequest,
    db: Session = Depends(get_db),
    token: str = Depends(loginFunc.oauth2_scheme),
):
    loginFunc.db = db
    verify_res = loginFunc.verify_jwt_token(token)
    if "hello" in verify_res:
        request = request.dict()  # type: ignore
        request["user_id"] = verify_res["hello"]  # type: ignore
        key_data = KeyWarehouseRepository.save(db, KeyWarehouse(**request))
        return KeyWarehouseResponse.from_orm(key_data)  # type: ignore
    return verify_res


@keys.get("/", response_model=list)
def find_all(
    db: Session = Depends(get_db), token: str = Depends(loginFunc.oauth2_scheme)
):
    loginFunc.db = db
    verify_res = loginFunc.verify_jwt_token(token)
    if "hello" in verify_res:
        user_id = verify_res["hello"]  # type: ignore
        key_data = db.query(KeyWarehouse).filter(KeyWarehouse.user_id == user_id).all()  # type: ignore
        return [KeyWarehouseResponse.from_orm(i) for i in key_data]  # type: ignore
    return [verify_res]


@keys.get("/{id}", response_model=KeyWarehouseResponse)
def find_by_id(id: int, db: Session = Depends(get_db)):
    key_data = KeyWarehouseRepository.find_by_id(db, id)
    if not key_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="keys not found"
        )
    return KeyWarehouseResponse.from_orm(key_data)


@keys.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_by_id(id: int, db: Session = Depends(get_db)):
    if not KeyWarehouseRepository.exists_by_id(db, id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="keys not found"
        )
    KeyWarehouseRepository.delete_by_id(db, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@keys.put("/{id}", response_model=KeyWarehouseResponse)
def update(id: int, request: KeyWarehouseRequest, db: Session = Depends(get_db)):
    if not KeyWarehouseRepository.exists_by_id(db, id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="keys not found"
        )
    key_data = KeyWarehouseRepository.save(db, KeyWarehouse(id=id, **request.dict()))
    return KeyWarehouseResponse.from_orm(key_data)
