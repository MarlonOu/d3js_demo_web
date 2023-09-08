from fastapi import FastAPI, Depends, HTTPException, status, Response, APIRouter
from sqlalchemy.orm import Session

from models.Movies import Movies
from database.database import engine, Base, get_db
from repositories.MovieRepository import MovieRepository
from schemas.MoviesSchema import MovieRequest, MovieResponse

Base.metadata.create_all(bind=engine)

movies = APIRouter(prefix="/api/movies", tags=["addition"])


@movies.post("/", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
def create(request: MovieRequest, db: Session = Depends(get_db)):
    movie = MovieRepository.save(db, Movies(**request.dict()))
    return MovieResponse.from_orm(movie)  # type: ignore


@movies.get("/", response_model=list)
def find_all(db: Session = Depends(get_db)):
    movies = MovieRepository.find_all(db)
    return [MovieResponse.from_orm(movie) for movie in movies]


@movies.get("/{id}", response_model=MovieResponse)
def find_by_id(id: int, db: Session = Depends(get_db)):
    movie = MovieRepository.find_by_id(db, id)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="movie not found"
        )
    return MovieResponse.from_orm(movie)


@movies.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_by_id(id: int, db: Session = Depends(get_db)):
    if not MovieRepository.exists_by_id(db, id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="movie not found"
        )
    MovieRepository.delete_by_id(db, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@movies.put("/{id}", response_model=MovieResponse)
def update(id: int, request: MovieRequest, db: Session = Depends(get_db)):
    if not MovieRepository.exists_by_id(db, id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="movie not found"
        )
    movie = MovieRepository.save(db, Movies(id=id, **request.dict()))
    return MovieResponse.from_orm(movie)
