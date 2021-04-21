import React, { useEffect } from 'react'
import * as d3 from 'd3'

import { adjustColor } from '../utils/utils'

const BarChart = ({ dataArray: data, keys, width, height, top, right, bottom, left, fill1, fill2, axisColor }) => {
  useEffect(() => draw())

  const draw = async () => {
    const innerWidth = width - left - right

    const color = d3.scaleOrdinal()
      .range([fill1, fill2])

    // Create SVG
    const svg = d3
      .select('.barChartContainer')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${left},${top})`)

    // Create Legend
    const legend = svg => {
      const g = svg
          .attr("transform", `translate(${width / 2}, ${height - bottom})`)
          .attr("text-anchor", "end")
          .attr("font-size", 10)
        .selectAll("g")
        .data(color.domain().slice())
        .join("g")
          .attr("transform", (d, i) => `translate(${i / 2 === 0 ? -(innerWidth / 2) : (innerWidth / 2) - 50}, 0)`);
    
      g.append("rect")
          .attr("x", -20)
          .attr("width", 20)
          .attr("height", 10)
          .attr("fill", color);
    
      g.append("text")
          .attr("x", -25)
          .attr("y", 5)
          .attr("dy", "0.35em")
          .text(d => d);
    }

    // Create tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .style('padding', '10px')
      .style('background', axisColor)
      .style('border-radius', '4px')
      .style('color', '#fff')
      .text('a simple tooltip');

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.date))
      .rangeRound([0, innerWidth])
      .padding(0.1)

    const x1 = d3.scaleBand()
      .domain(keys)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05)

    const y0 = d3.scaleLinear()
      .domain([
        0,
        d3.max(data, d => d[keys[0]])
      ])
      .nice()
      .rangeRound([
        height - bottom - (top * 3),
        top
      ])

    const y1 = d3.scaleLinear()
      .domain([
        0,
        d3.max(data, d => d[keys[1]])
      ])
      .nice()
      .rangeRound([
        height - bottom - (top * 3),
        top
      ])

    // Add the bars
    svg
      .selectAll('g')
      .data(data)
      .join('g')
        .attr('transform', (d) => `translate(${x0(d.date)}, 0)`)
      .selectAll('rect')
      .data(d => keys.map(key => ({key, value: d[key]})))
      .join('rect')
        .attr('x', d => x1(d.key))
        .attr('y', d => d.key === keys[0] ? y0(d.value) : y1(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => d.key === keys[0] ? y0(0) - y0(d.value) : y1(0) - y1(d.value))
        .attr('fill', d => color(d.key))
        .attr('cursor', 'pointer')
        // Listen on hover events on the bars to show or hide the tooltip
        .on('mouseover', function(e, d) {
          d3.select(this).transition().attr('fill', adjustColor(color(d.key), -40))
          tooltip.text(`${d.key}: ${d.value} HNY`).style('visibility', 'visible')
        })
        .on('mousemove', e => {
          tooltip.style('top', e.pageY - 10 + 'px').style('left', e.pageX + 10 + 'px')
        })
        .on('mouseout', function(e, d) {
          d3.select(this).transition().attr('fill', color(d.key))
          tooltip.html('').style('visibility', 'hidden')
        })

    // Append the X axis to the SVG
    svg.append('g')
      .attr("transform", `translate(0, ${height - bottom - (top * 3)})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
    // Append the left Y axis to the SVG
    svg.append('g').call(d3.axisLeft(y0)).select('.domain').remove()
    // Append the right Y axis to the SVG
    svg.append('g')
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(y1))
      .select('.domain').remove()
    // Append the Legend object to the SVG
    svg.append('g').call(legend)

    // Change all axis, ticks and text color to the axisColor prop
    svg.selectAll('.domain').attr('color', axisColor)
    svg.selectAll('line').attr('stroke', axisColor)
    svg.selectAll('text').attr('fill', axisColor)
  }

  return <div className="barChartContainer" />
}

export default BarChart
