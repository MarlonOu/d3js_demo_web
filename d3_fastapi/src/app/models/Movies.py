from sqlalchemy import Column, Integer, String
import sys

from database.database import Base


class Movies(Base):
    __tablename__ = "Movies"

    id: int = Column(Integer, primary_key=True, index=True)  # type: ignore
    title: str = Column(String(100), nullable=False)  # type: ignore
    director: str = Column(String(255), nullable=False)  # type: ignore
    duration_in_minutes: int = Column(Integer, nullable=False)  # type: ignore
    rating: int = Column(Integer, nullable=False)  # type: ignore
