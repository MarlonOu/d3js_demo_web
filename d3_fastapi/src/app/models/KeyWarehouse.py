from sqlalchemy import Column, Integer, String
import sys
from database.database import Base


class KeyWarehouse(Base):
    __tablename__ = "key_warehouse"

    id: int = Column(Integer, primary_key=True, index=True)  # type: ignore
    user_id: int = Column(Integer, nullable=False)  # type: ignore
    key_method: str = Column(String(100), nullable=False)  # type: ignore
    private_key: str = Column(String(255), nullable=False)  # type: ignore
    public_key: str = Column(String(255), nullable=True)  # type: ignore
