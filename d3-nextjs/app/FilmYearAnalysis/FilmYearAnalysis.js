"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import FilmYearChart from "./FilmYearChart";
import FilmYearSearch from "./FilmYearSearch";
import * as d3 from 'd3'

export default function FilmYearAnalysis({ bodyWidth }) {
    const [filmYearChart, setFilmYearChart] = useState(<Loading />)
    const [yearSelect, setYearSelect] = useState('~1990');
    const [movieTitle, setMovieTile] = useState('');
    const [searchInfo, setSearchInfo] = useState('');

    const year1 = '~1990',
        year2 = '1991~'

    const getData = async (url) => {
        return (
            await fetch(url, {
                method: 'GET'
            })
                .then((res) => res.json())
                .then((data) => {
                    return data
                })
        )
    }

    function GenerateFilmYearChart() {
        getData(`http://${process.env.DB_HOST}/api/movies/flim-year-chart`)
            .then((res) => {
                let tempData = []
                if (yearSelect == year1) {
                    res.chartDatas.map((i) => {
                        if (i.year <= 1990)
                            tempData.push(i)
                    });
                } else if (yearSelect == year2) {
                    res.chartDatas.map((i) => {
                        if (i.year >= 1991)
                            tempData.push(i)
                    });
                }
                setFilmYearChart(<FilmYearChart bodyWidth={bodyWidth} data={tempData} searchMovieTitleData={movieTitle} handleSearchNotFound={handleSearchNotFound} />)
            });
    }

    const handleMovieTitle = (movieTitle) => {
        setMovieTile([movieTitle, Date.now()])
    }

    const handleSearchNotFound = (searchInfo) => {
        setSearchInfo(searchInfo)
        setMovieTile('')
    }

    useEffect(() => {
        setMovieTile('')
        setSearchInfo('')
        GenerateFilmYearChart()
    }, [yearSelect, bodyWidth]);

    useEffect(() => {
        GenerateFilmYearChart()
    }, [movieTitle]);

    return (
        <div className="chart1 flex justify-evenly p-4 bg-gray-500">
            <div className="grid grid-cols-1 gap-4 w-full justify-center">
                <div className="flex justify-center filmYeartChartTitle">
                    <p className="text-2xl font-medium text-gray-200">串流平台-電影年份統計-1</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">選擇電影出版年份區間</label>
                        <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={yearSelect} onChange={(e) => { setYearSelect(e.target.value) }}>
                            <option value={year1}>{year1}</option>
                            <option value={year2}>{year2}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">搜尋電影</label>
                        <FilmYearSearch searchInfo={searchInfo} handleMovieTitle={handleMovieTitle} yearSelect={yearSelect} />
                    </div>
                </div>

                {filmYearChart}

            </div>
        </div>
    );
}
