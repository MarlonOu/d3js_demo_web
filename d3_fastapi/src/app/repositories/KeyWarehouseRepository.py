from sqlalchemy.orm import Session

from models.KeyWarehouse import KeyWarehouse


class KeyWarehouseRepository:
    @staticmethod
    def find_all(db: Session) -> list:
        return db.query(KeyWarehouse).all()

    @staticmethod
    def save(db: Session, key_data: KeyWarehouse) -> KeyWarehouse:
        if key_data.id:
            db.merge(key_data)
        else:
            db.add(key_data)
        db.commit()
        return key_data

    @staticmethod
    def find_by_id(db: Session, id: int) -> KeyWarehouse:
        return db.query(KeyWarehouse).filter(KeyWarehouse.id == id).first()  # type: ignore

    @staticmethod
    def exists_by_id(db: Session, id: int) -> bool:
        return db.query(KeyWarehouse).filter(KeyWarehouse.id == id).first() is not None  # type: ignore

    @staticmethod
    def delete_by_id(db: Session, id: int) -> None:
        key_data = db.query(KeyWarehouse).filter(KeyWarehouse.id == id).first()  # type: ignore
        if key_data is not None:
            db.delete(key_data)
            db.commit()
