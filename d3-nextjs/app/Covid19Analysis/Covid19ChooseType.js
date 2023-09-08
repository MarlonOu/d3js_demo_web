"use client";

import { useEffect, useState } from "react";

export default function Covid19ChooseType({ handleDataTypeChoose }) {
    const dataTypes = [
        ['confirmed', 'Confirmed'],
        ['death', 'Deaths'],
        ['recovered', 'Recovered'],
        ['active', 'Active']
    ];
    const [dataType, setDataType] = useState('confirmed');

    const generateOption = () => {
        let options = [];
        dataTypes.forEach((d, i) =>
            options.push(<option key={i} value={d[0]}>{d[1]}</option>)
        )
        return options
    };

    useEffect(() => {
        handleDataTypeChoose(dataType);
    }, [dataType])

    return (
        <>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">選擇資料類別</label>
            <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={dataType} onChange={(e) => { setDataType(e.target.value) }}>
                {generateOption()}
            </select>
        </>
    );
}
