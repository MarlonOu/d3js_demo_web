from fastapi import FastAPI, Depends, HTTPException, status, Response, APIRouter
# from sqlalchemy.orm import Session

from models.Movies import Movies
from database.database import engine, Base, get_db
from repositories.MovieRepository import MovieRepository
from schemas.MoviesSchema import MovieRequest, MovieResponse
import csv
import os
from pydantic import BaseModel
import time

# Base.metadata.create_all(bind=engine)

def readCsvData():
    data = []
    datafile = os.getcwd() + '/components/movies/MoviesOnStreamingPlatforms.csv'
    with open(datafile, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)
    return(data)

def film_year_data_process(movies):
    chart_datas = []
    years = []

    for movie in movies:
        year = movie['Year']
        if year not in years:
            years.append(year)
    years.sort()

    for i in range(len(years)):
        chart_datas.append({
            "title": [],
            "year": years[i],
            "amount": 0
        })

    for movie in movies:
        movie_name = movie['Title']
        year = movie['Year']
        for chart_data in chart_datas:
            if chart_data['year'] == year:
                chart_data['title'].append(movie_name)
                chart_data['amount'] += 1

    res = {
        "chartDatas": chart_datas
    }

    return res

def replenish_film_year_data_process(movies):
    chart_datas = []
    years = []

    for movie in movies:
        year = movie['Year']
        if year not in years:
            years.append(year)
    years.sort()

    for i in range(int(years[0]), int(years[-1])+1):
        chart_datas.append({
            "title": [],
            "year": str(i),
            "amount": 0
        })

    for movie in movies:
        movie_name = movie['Title']
        year = movie['Year']
        for chart_data in chart_datas:
            if chart_data['year'] == year:
                chart_data['title'].append(movie_name)
                chart_data['amount'] += 1

    res = {
        "chartDatas": chart_datas
    }

    return res

def platform_film_year_data_pie_process(movies):
    chart_datas = []
    platforms = ['Netflix', 'Hulu', 'Prime Video', 'Disney+']
    platform_movies_amount = {}


    for platform in platforms:
        platform_movies_amount[platform] = 0

    for movie in movies:
        for platform in platforms:
            if movie[platform] == '1':
                platform_movies_amount[platform] += 1

    for platform in platforms:
        chart_datas.append({
            "platformName": platform,
            "amount": platform_movies_amount[platform]
        })
        
    res = chart_datas
    
    return res

def platform_film_year_data_bar_process(movies, focusPlatform_name):
    print(focusPlatform_name)
    chart_datas = []
    years = []
    preset_platforms = ['Netflix', 'Hulu', 'Prime Video', 'Disney+']
    platforms = preset_platforms
    if focusPlatform_name != 'none movie' and focusPlatform_name in preset_platforms:
        platforms = [focusPlatform_name]

    for movie in movies:
        year = movie['Year']
        if year not in years:
            years.append(year)
    years.sort()

    for i in range(len(years)):
        for platform in platforms:
            chart_datas.append({
                "year": years[i],
                "platform": platform,
                "amount": 0,
                "movies": []
            })

    for movie in movies:
        for platform in platforms:
            if movie[platform] == '1':
                for chart_data in chart_datas:
                    if chart_data['year'] == movie['Year'] and chart_data['platform'] == platform:
                        chart_data['movies'].append(movie['Title'])

    for chart_data in chart_datas:
        for movie in chart_data['movies']:
            chart_data['amount'] += 1
        
    res = chart_datas
    
    return res
    

movies = APIRouter(prefix="/api/movies", tags=["addition"])

@movies.get("/flim-year-chart")
async def get_flim_year_chart_data():
    movies = readCsvData()
    res = film_year_data_process(movies)    

    return res

@movies.get("/replenish-flim-year-chart")
async def get_replenish_flim_year_chart_data():
    movies = readCsvData()
    res = replenish_film_year_data_process(movies)    

    return res

@movies.get("/platform-flim-year-pie-chart")
async def get_platform_film_year_pie_chart_data():
    movies = readCsvData()
    res = platform_film_year_data_pie_process(movies)    

    return res

@movies.get("/platform-flim-year-bar-chart/{focusPlatform_name}")
async def get_platform_film_year_bar_chart_data(focusPlatform_name):
    try:
        movies = readCsvData()
        res = platform_film_year_data_bar_process(movies, focusPlatform_name)    
        return res
    except Exception as e:
        print ({"error": str(e)})


class HelloRequest(BaseModel):
    hello: str


@movies.post("/nats-test")
async def nats_test(request: HelloRequest):
    try:   
        time.sleep(0.5)
        return request.hello
    except Exception as e:
        print ({"error": str(e)})