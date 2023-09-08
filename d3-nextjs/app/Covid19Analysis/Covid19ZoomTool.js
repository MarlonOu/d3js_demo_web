"use client";

import { useEffect, useState } from "react";
import * as d3 from 'd3'
import { TiArrowMove, TiArrowMoveOutline } from "react-icons/ti";

export default function Covid19ZoomTool() {
    const [zoomIcon, setZoomIcon] = useState(false);

    const handleClick = () => {
        if (zoomIcon){
            setZoomIcon(false);
            d3.select('.heatmap-zoom')
                .attr('display', 'none');
        }else{
            setZoomIcon(true);
            d3.select('.heatmap-zoom')
                .attr('display', 'block');
        }
    }

    return (
        <>
            <button onClick={() => handleClick()} >
                <h1>{zoomIcon? <TiArrowMoveOutline /> : <TiArrowMove />}</h1>
            </button>
        </>
    );
}
