'use client'

import { useEffect, useState } from "react"

export default function FilmYearSearch({searchInfo, handleMovieTitle, yearSelect}) {
    const [movieTitle, setMovieTitle] = useState('')
    const inputNormalCss = "block w-9/12 h-10 p-4 pl-10 text-sm text-gray-900 rounded-lg focus:ring-gray-700 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white outline-none"
    const inputWrongCss = "block w-9/12 h-10 p-4 pl-10 text-sm text-red-500 rounded-lg focus:ring-gray-700 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-red-400 outline-none"
    const inputDivNormalClass = "block w-full h-10 rounded-lg dark:bg-gray-700"
    const inputDivWrongClass = "block w-full h-10 rounded-lg dark:bg-gray-700 animate-wiggle"
    const [inputClass, setInputClass] = useState(inputNormalCss)
    const [inputDivClass, setInputDivClass] = useState(inputDivNormalClass)

    const handleClick = async (e) => {
        e.preventDefault();
        handleMovieTitle(movieTitle)
    }

    useEffect(() => {
        if(searchInfo == movieTitle && movieTitle != ''){
            setInputClass(inputWrongCss)
            setInputDivClass(inputDivWrongClass)
        }else{
            setInputClass(inputNormalCss)
            setInputDivClass(inputDivNormalClass)
        }
    }, [movieTitle, searchInfo])

    useEffect(() =>{
        setMovieTitle('')
    }, [yearSelect])

    return (
        <>
            <form onSubmit={handleClick}>
                <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <div className={inputDivClass}>
                        <input type="search" id="search" className={inputClass} placeholder="Search" value={movieTitle} onChange={(e) => {setMovieTitle(e.target.value)}} />
                        <button type="submit" className="text-white text-xs absolute h-7 right-2.5 bottom-1.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                    </div>
                </div>
            </form>
        </>
    )
}