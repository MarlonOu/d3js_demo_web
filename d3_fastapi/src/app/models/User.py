from sqlalchemy import Column, Integer, String
import sys
from database.database import Base


class User(Base):
    __tablename__ = "user"

    id: int = Column(Integer, primary_key=True, index=True)  # type: ignore
    name: str = Column(String(100), nullable=False)  # type: ignore
    password: str = Column(String(255), nullable=False)  # type: ignore
    token: str = Column(String(255), nullable=True)  # type: ignore
    age: int = Column(Integer, nullable=False)  # type: ignore
    sex: str = Column(String(10), nullable=False)  # type: ignore
