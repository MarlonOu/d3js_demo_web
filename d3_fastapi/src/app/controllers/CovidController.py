from fastapi import FastAPI, Depends, HTTPException, status, Response, APIRouter
# from sqlalchemy.orm import Session

from database.database import engine, Base, get_db
import csv
import os
from pydantic import BaseModel
import time
import ast
from datetime import datetime

# Base.metadata.create_all(bind=engine)
countrys = ['Australia', 'China', 'Germany', 'India', 'Japan', 'Malaysia', 'Mexico', 'Russia', 'Taiwan*', 'Ukraine', 'United Kingdom']
data_type_invert = {
    'Confirmed': 'confirmed',
    'Deaths': 'death',
    'Recovered': 'recovered',
    'Active': 'active'
}

def readCsvData(file_name):
    data = []
    datafile = os.getcwd() + f'/components/covid19/{file_name}'
    with open(datafile, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)
    return(data)

def covid19_data_process(covid19_datas, data_type):
    datas = []

    for data in covid19_datas:
        if data['Country/Region'] in countrys:
            datas.append({
                "date": data['Date'],
                "country": data['Country/Region'],
                data_type_invert[data_type]: int(data[data_type])
            })

    res = {
        "chartDatas": datas
    }

    return res
    
covid19 = APIRouter(prefix="/api/covid19", tags=["covid-19"])

@covid19.get("/confirmed")
async def get_confirmed_data():
    try:
        covid19_datas = readCsvData('full_grouped.csv')
        res = covid19_data_process(covid19_datas, 'Confirmed')    
        return res
    except Exception as e:
        print ({"error": str(e)})

@covid19.get('/death')
async def get_death_data():
    try:
        covid19_datas = readCsvData('full_grouped.csv')
        res = covid19_data_process(covid19_datas, 'Deaths')
        return res
    except Exception as e:
        print({'error': str(e) })

@covid19.get('/recovered')
async def get_death_data():
    try:
        covid19_datas = readCsvData('full_grouped.csv')
        res = covid19_data_process(covid19_datas, 'Recovered')
        return res
    except Exception as e:
        print({'error': str(e) })

@covid19.get('/active')
async def get_death_data():
    try:
        covid19_datas = readCsvData('full_grouped.csv')
        res = covid19_data_process(covid19_datas, 'Active')
        return res
    except Exception as e:
        print({'error': str(e) })
