from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
import uvicorn

# from models.Movies import Movies
# from database.database import engine, Base, get_db
# from repositories.MovieRepository import MovieRepository
# from schemas.MoviesSchema import MovieRequest, MovieResponse
# import controllers.MoviesController as Movies
# import controllers.LoginController as Login
# import controllers.UserController as User
# import controllers.KeyWarehouseController as KeyWarehouse
# import controllers.EccKeyController as ecc
import controllers.MovieController as Movie
import controllers.CovidController as covid19

# Base.metadata.create_all(bind=engine)

app = FastAPI()
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://nextjs",
    "http://nextjs:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(Movies.movies)
# app.include_router(Login.login)
# app.include_router(User.user)
# app.include_router(KeyWarehouse.keys)
# app.include_router(ecc.ecc)
app.include_router(Movie.movies)
app.include_router(covid19.covid19)

