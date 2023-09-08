"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import * as d3 from "d3";
import AllFilmYearAnalysis from './AllFilmYearAnalysis/AllFilmYearAnalysis'
import FilmYearAnalysis from './FilmYearAnalysis/FilmYearAnalysis'
import FilmPlatformAnalysis from "./FilmPlatformAnalysis/FilmPlatformAnalysis";
import Covid19Analysis from "./Covid19Analysis/Covid19Analysis";
// import dynamic from "next/dynamic";

// const AAA = dynamic(() => import('./ChartConponents/FilmYearChart'), { ssr: false})

export default function Home() {
  const [bodyWidth, setBodyWidth] = useState()

  const handleWidthChange = () => {
    setBodyWidth(d3.select('div').style('width'))
  }

  useEffect(() => {
    d3.select(window).on('resize', handleWidthChange)
  }, [])

  return (
    <>
      {/* <div className="grid grid-cols-8 gap-4 w-full bg-blue-200/80">
        <div className="col-span-full bg-blue-500">1</div>
        <div className="col-start-3 col-span-4 bg-red-500">2</div>
        <div className="col-start-2 col-span-2 bg-purple-500">3</div>
        <div className="col-span-2 bg-green-500">4</div>
        <div className="col-span-2 bg-orange-500">
          <button className="btn-primary">pp</button>
        </div>
      </div> */}
      <div className="grid grid-cols-1 gap-4 w-full bg-blue-200/80">

        <FilmYearAnalysis bodyWidth={bodyWidth} />
        <AllFilmYearAnalysis bodyWidth={bodyWidth} />
        <FilmPlatformAnalysis bodyWidth={bodyWidth} />
        <Covid19Analysis bodyWidth={bodyWidth} />

      </div>
    </>
  );
}
