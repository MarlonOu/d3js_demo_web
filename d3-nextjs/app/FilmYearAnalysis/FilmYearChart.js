"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import * as d3 from "d3";

export default function FilmYearChart({ bodyWidth, data, searchMovieTitleData, handleSearchNotFound }) {
    const [margin, setMargin] = useState({ top: 50, left: 40, bottom: 40, right: 50 });
    const [focusBarColor, setFocusBarColor] = useState('#00FFFF')
    const router = useRouter()

    const createSvg = () => {
        const width =
            parseInt(d3.select(".filmYearChart").style("width")) - margin.left - margin.right,
            height = width * 0.5 - margin.top - margin.bottom;

        d3.select(".filmYearChart svg").remove();

        d3.select(".filmYearChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

    };

    const reSizeSvg = () => {
        const width =
            parseInt(d3.select(".filmYearChart").style("width")) - margin.left - margin.right,
            height = width * 0.5 - margin.top - margin.bottom;

        d3.select(".filmYearChart svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

    };

    const drawChart = () => {

        const width =
            parseInt(d3.select(".filmYearChart").style("width")) - margin.left - margin.right,
            height = width * 0.5 - margin.top - margin.bottom;

        const svg = d3.select(".filmYearChart svg g");

        const xData = data.map((i) => i.year);

        const xScale = d3.scaleBand()
            .domain(xData)
            .range([0, width])
            .padding(.5)

        const xAxis = d3.axisBottom(xScale)
            .tickFormat((d) => d + '年')
            .tickValues(xScale.domain().filter((e, i) => i % (width > 720 ? 5 : 10) == 0));

        svg
            .selectAll('.x-axis')
            .data([null])
            .join("g")
            .classed('x-axis', true)
            .attr("transform", `translate(0, ${height})`)
            .transition().duration(1000)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end")
            .style('font-size', '13px')
            .attr('fill', 'white')             

        const yData = data.map((i) => Number(i.amount))

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(yData)])
            .range([height, 0])
            .nice()

        const yAxis = d3.axisLeft(yScale)
            .ticks(width > 720 ? 10 : 5)

        svg
            .selectAll('.y-axis')
            .data([null])
            .join("g")
            .classed('y-axis', true)
            .transition()
            .duration(500)
            .call(yAxis)
            .selectAll('text')
            .style('font-size', '13px')
            .attr('fill', 'white')
        svg
           .select('.y-axis') 
            .append('text')
            .attr('class', 'yAxis-label')
            .text('部/年')
            .attr('x', 0)
            .attr('y', -15)

        const color = d3.scaleOrdinal()
            .domain(xData)
            .range(d3.schemePastel1)

        const bar = svg
            .selectAll('rect')
            .data(data, d => d.year)
            .join(
                enter => enter.append('rect')
                    .attr('x', d => xScale(d.year))
                    .attr('y', height)
                    .attr('width', xScale.bandwidth())
                    .attr('fill', d => color(d.year))
                    .attr('cursor', 'pointer')
                    .transition().duration(500)
                    .attr('y', d => yScale(d.amount))
                    .attr('height', d => {
                        return height - yScale(d.amount)
                    }),

                update => update
                    .transition(1000)
                    .attr('x', d => xScale(d.year))
                    .attr('y', d => yScale(d.amount))
                    .attr('width', xScale.bandwidth())
                    .attr('height', d => {
                        return height - yScale(d.amount)
                    })
                    .attr('fill', d => color(d.year)),

                exit => exit
                    .transition(1000)
                    .attr('y', height)
                    .attr('height', 0)
                    .remove()
            )

        d3.select(".filmYearChart .tooltip").remove();
        const tooltip = d3.select('.filmYearChart')
            .append('div')
            .attr('class', 'tooltip')
            .classed('bg-gray-100/75', true)
            .style('position', 'absolute')
            .style('display', 'none')

        d3.select(".filmYearChart .tooltipClick").remove();
        const tooltipClick = d3.select('.filmYearChart')
            .append('div')
            .attr('class', 'tooltipClick')
            .classed('bg-gray-100/75', true)
            .style('position', 'absolute')
            .style('display', 'none')
            .style('width', '250px')
            .style('height', '0px')

        function handleMouseOver(e, d) {
            const pt = d3.pointer(e, svg.node())

            d3.select(this)
                .transition()
                .duration(100)
                .attr('stroke', '#4D1F00')
                .style('stroke-width', '2px')
                .style('opacity', 0.5)

            tooltip.style('display', 'block')
                .style('left', pt[0] + 60 + 'px')
                .style('top', pt[1] + 'px')
                .text(`
                    ${e.target.__data__.year}年,
                    ${e.target.__data__.amount}部
                `)

            svg.append('line')
                .attr('class', 'dashed-Y')
                .attr('x1', 0)
                .attr('y1', yScale(e.target.__data__.amount))
                .attr('x2', xScale(e.target.__data__.year))
                .attr('y2', yScale(e.target.__data__.amount))
                .style('stroke', 'white')
                .style('stroke-width', '2px')
                .style('stroke-dasharray', '5')
        }

        function handleMouseMove(e, d) {
            const pt = d3.pointer(e, svg.node())

            tooltip.style('display', 'block')
                .style('left', pt[0] + 60 + 'px')
                .style('top', pt[1] + 'px')
                .text(`
                    ${e.target.__data__.year}年,
                    ${e.target.__data__.amount}部
                `)
        }

        function handleMouseLeave(e, d) {

            if (d3.select(this).classed('focusBar') == false) {
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style('stroke-width', '0px')
                    .style('opacity', 1)
            } else {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('stroke', focusBarColor)
                    .style('stroke-width', '4px')
                    .style('opacity', 0.5)
            }

            tooltip.style('display', 'none')
            svg.select('.dashed-Y').remove()
        }

        function handleMouseClick(e, d) {
            const pt = d3.pointer(e, svg.node())

            tooltipClick.selectAll('div').remove()
            tooltipClick.selectAll('p').remove()
            tooltipClick.style('height', '0px')

            //先清掉一次全局focusBar
            d3.select('.focusBar')
                .classed('focusBar', false)
                .transition()
                .duration(50)
                .style('stroke-width', '0px')
                .style('opacity', 1)

            d3.select(this)
                .classed('focusBar', true)
                .transition()
                .duration(100)
                .attr('stroke', focusBarColor)
                .style('stroke-width', '4px')
                .style('opacity', 0.5)

            tooltipClick
                .style('display', 'block')
                .style('left', () => {
                    if (pt[0] > (width * 2 / 3))
                        return pt[0] - 230 + 'px'
                    else
                        return pt[0] + 60 + 'px'
                })
                .style('top', () => {
                    if (pt[1] + 125 > height)
                        return pt[1] - (pt[1] + 100 - height) + 'px'
                    else
                        return pt[1] + 'px'
                })
                .transition(50)
                .style('height', '125px')

            tooltipClick
                .append('p')
                .classed('bg-gray-400/60 sticky top-0 font-bold', true)
                .transition(100)
                .text(`
                    ${e.target.__data__.year}年,
                    ${e.target.__data__.amount}部
                `)
            // .style('color', 'white')
            // .style('-webkit-text-stroke-width', '1px')
            // .style('-webkit-text-stroke-color', 'black')


            tooltipClick
                .append('div')
                .style('display', 'none')
                .classed('overflow-y-scroll overscroll-y-none', true)//滑到底body不會跟著滑
                .style('width', '250px')
                .style('height', '100px')
                .append('ul')
                .classed('list-decimal list-inside', true)
                .selectAll('li')
                .data(e.target.__data__.title)
                .join('li')
                .text(d => d)

            tooltipClick
                .select('div')
                .transition()
                .delay(200)
                .style('display', 'block')

        }

        function handleRemoveMouseClick(e, d) {
            if (tooltipClick.style('display') == 'block') {
                const pt = d3.pointer(e)

                let tooltipClickLT = []
                let tooltipClickRB = []

                tooltipClickLT.push(parseInt(tooltipClick.style('left').split('px')[0]))
                tooltipClickLT.push(parseInt(tooltipClick.style('top').split('px')[0]))

                tooltipClickRB.push((tooltipClickLT[0] + parseInt(tooltipClick.style('width').split('px')[0])))
                tooltipClickRB.push((tooltipClickLT[1] + parseInt(tooltipClick.style('height').split('px')[0])))

                if (pt[0] <= tooltipClickLT[0] || pt[0] >= tooltipClickRB[0] || pt[1] <= tooltipClickLT[1] || pt[1] >= tooltipClickRB[1]) {
                    tooltipClick
                        .transition(50)
                        .selectAll('div').remove()

                    tooltipClick
                        .transition(50)
                        .delay(200)
                        .style('height', '0px')
                        .selectAll('p').remove()

                    tooltipClick
                        .transition(50)
                        .delay(400)
                        .style('display', 'none')

                    d3.select('.focusBar')
                        .classed('focusBar', false)
                        .transition()
                        .duration(50)
                        .style('stroke-width', '0px')
                        .style('opacity', 1)

                }

                router.push('../', { scroll: false })
            }
        }

        bar.on('mouseover', handleMouseOver)
            .on('mousemove', handleMouseMove)
            .on('mouseleave', handleMouseLeave)
            .on('click', handleMouseClick)

        d3.select('.filmYearChart').on('mousedown', handleRemoveMouseClick)

        if (searchMovieTitleData) {
            const searchMovieTitle = searchMovieTitleData[0]
            if (searchMovieTitle) {
                data.map((i) => {
                    if (i.title.includes(searchMovieTitle)) {
                        tooltipClick.selectAll('div').remove()
                        tooltipClick.selectAll('p').remove()
                        tooltipClick.style('height', '0px')

                        const pt = [xScale(i.year), yScale(i.amount)]

                        //先清掉一次全局focusBar
                        d3.select('.focusBar')
                            .classed('focusBar', false)
                            .transition()
                            .duration(50)
                            .style('stroke-width', '0px')
                            .style('opacity', 1)

                        d3.select(bar._groups[0][data.indexOf(i)])
                            .classed('focusBar', true)
                            .transition()
                            .duration(50)
                            .attr('stroke', focusBarColor)
                            .style('stroke-width', '4px')
                            .style('opacity', 0.5)

                        tooltipClick
                            .style('display', 'block')
                            .style('left', () => {
                                if (pt[0] > (width * 2 / 3))
                                    return pt[0] - 230 + 'px'
                                else
                                    return pt[0] + 60 + 'px'
                            })
                            .style('top', () => {
                                if (pt[1] + 125 > height)
                                    return pt[1] - (pt[1] + 100 - height) + 'px'
                                else
                                    return pt[1] + 'px'
                            })
                            .transition(50)
                            .style('height', '125px')

                        tooltipClick
                            .append('p')
                            .classed('bg-gray-400/60 sticky top-0 font-bold', true)
                            .transition(100)
                            .text(`
                                ${i.year}年,
                                ${i.amount}部
                            `)
                        // .style('color', 'white')
                        // .style('-webkit-text-stroke-width', '1px')
                        // .style('-webkit-text-stroke-color', 'black')

                        tooltipClick
                            .append('div')
                            .attr('display', 'none')
                            .classed('overflow-y-scroll overscroll-y-none', true)//滑到底body不會跟著滑
                            .attr('id', 'movieList')
                            .style('width', '250px')
                            .style('height', '100px')
                            .append('ul')
                            .classed('list-decimal list-inside', true)
                            .selectAll('li')
                            .data(i.title)
                            .join('li')
                            .text(d => d)

                        const searchMovieLiIndex = i.title.indexOf(searchMovieTitle)

                        d3.select(tooltipClick.selectAll('li')._groups[0][searchMovieLiIndex])
                            .attr('id', 'searchMovie')
                            .classed('border-2 border-red-300 text-amber-900', true)

                        // document.getElementById('searchMovie').scrollTo(0, 300);
                        let searchMovieHeight = 0;
                        if (searchMovieLiIndex > 0) {
                            i.title.filter((value, index) => {
                                if (index < searchMovieLiIndex) {
                                    let li = tooltipClick.selectAll('li')._groups[0][index]
                                    searchMovieHeight += parseInt(d3.select(li).style('height').split('px')[0])
                                }
                            })
                        }

                        // 操作scroll
                        // d3.select("#movieList").node().scrollTo(0, searchMovieHeight);

                        const scrollable = d3.select("#movieList");
                        d3.transition().duration(1000).ease(d3.easeCubicOut)
                            .tween("uniquetweenname", scrollTopTween(searchMovieHeight));

                        function scrollTopTween(scrollTop) {
                            return function () {
                                const scrollStart = scrollTop >= 320 ? scrollTop - 320 : 0
                                const i = d3.interpolateNumber(scrollStart, scrollTop);
                                return function (t) {
                                    scrollable.node().scrollTo(this.scrollTop, i(t))
                                };
                            };
                        }

                        tooltipClick
                            .select('div')
                            .transition()
                            .delay(200)
                            .attr('display', 'block')
                    }
                })
            }
            if (tooltipClick.style('display') == 'none') {
                handleSearchNotFound(searchMovieTitle)
            }
        }
    }

    useEffect(() => {
        createSvg()
    }, [])

    useEffect(() => {
        drawChart()
    }, [data, searchMovieTitleData])

    useEffect(() => {
        reSizeSvg()
        drawChart()
    }, [bodyWidth])

    return (
        <div className="filmYearChart relative"></div>
    );
}

