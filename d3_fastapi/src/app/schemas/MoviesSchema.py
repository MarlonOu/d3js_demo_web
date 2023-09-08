from pydantic import BaseModel, Field


class MovieBase(BaseModel):
    title: str
    director: str
    duration_in_minutes: int = Field(ge=0)
    rating: int = Field(ge=1, le=5)


class MovieRequest(MovieBase):
    pass


class MovieResponse(MovieBase):
    id: int

    class Config:
        orm_mode = True
