from pydantic import BaseModel, Field


class KeyWarehouseBase(BaseModel):
    key_method: str
    private_key: str
    public_key: str = None  # type: ignore


class KeyWarehouseRequest(KeyWarehouseBase):
    pass


class KeyWarehouseResponse(KeyWarehouseBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
