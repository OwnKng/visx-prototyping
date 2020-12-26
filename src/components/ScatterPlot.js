import React, { useEffect, useCallback, useRef, useMemo } from "react";
import { scaleLinear, scaleLog, scaleOrdinal } from "@visx/scale";
import {
  LegendOrdinal,
  LegendItem,
  LegendLabel,
  LegendSize,
} from "@visx/legend";
import { Group } from "@visx/group";
import * as d3 from "d3";
import { Circle } from "@visx/shape";
import { Axis, AxisLeft, AxisBottom } from "@visx/axis";
import { GridColumns } from "@visx/grid";
import { TooltipWithBounds, withTooltip, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { voronoi } from "@visx/voronoi";
import styled from "styled-components";
import { fundamentals } from "./EconFundamentals";
import { Text } from "@visx/text";

const Graph = styled.div`
  background: #0f0e17;
  color: #a7a9be;

  svg {
    text {
      fill: #a7a9be;
      font-size: 14px;
    }
  }
`;

const tooltipStyles = {
  ...defaultStyles,
  background: `rgba(15, 14, 23, 0.5)`,
  border: "1px solid #a7a9be",
  color: "#a7a9be",
  fontSize: "14px",
  padding: "0.8rem",
};

export const ScatterPlot = ({
  width,
  height,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipOpen,
  tooltipTop = 0,
  tooltipLeft = 0,
  margin = { top: 30, left: 60, right: 40, bottom: 40 },
}) => {
  const data = fundamentals;
  // set the dimensions of the plot
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const legendGlyphSize = 10;

  const svgRef = useRef(null);
  let tooltipTimeout;

  // accessors
  const x = (d) => d.gdpPerCap;
  const y = (d) => d.lifeExpectancy;
  const fill = (d) => d.region;
  const radius = (d) => d.population;

  // scales
  const xScale = scaleLog({
    range: [margin.left, innerWidth + margin.left],
    domain: d3.extent(data, x),
  });

  const yScale = scaleLinear({
    range: [innerHeight + margin.top, margin.top],
    domain: d3.extent(data, y),
    nice: true,
  });

  const fillScale = scaleOrdinal({
    domain: [...new Set(data.map(fill))],
    range: ["#ff8906", "#f25f4c", "#e53170", "#7f5af0", "#2cb67d"],
  });

  const rScale = scaleLinear({
    range: [3, 30],
    domain: d3.extent(data, radius),
  });

  // Event handlers for tooltips
  const voronoiLayout = useMemo(
    () =>
      voronoi({
        x: (d) => xScale(x(d)) ?? 0,
        y: (d) => yScale(y(d)) ?? 0,
        width,
        height,
      })(data),
    [data, width, height, xScale, yScale]
  );

  const handleMouseMove = useCallback(
    (event) => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      if (!svgRef.current) return;

      // find the nearest polygon to the current mouse position
      const point = localPoint(svgRef.current, event);
      if (!point) return;
      const neighborRadius = 100;
      const closest = voronoiLayout.find(point.x, point.y, neighborRadius);
      if (closest) {
        showTooltip({
          tooltipLeft: xScale(x(closest.data)),
          tooltipTop: yScale(y(closest.data)),
          tooltipData: closest.data,
        });
      }
    },
    [xScale, yScale, showTooltip, voronoiLayout, tooltipTimeout]
  );

  const handleMouseLeave = useCallback(() => {
    tooltipTimeout = window.setTimeout(() => {
      hideTooltip();
    }, 300);
  }, [hideTooltip]);

  // Sort the data so that the largest populations are plotted first
  useEffect(() => {
    data.sort((a, b) => b.population - a.population);
  }, [data]);

  return (
    <Graph>
      <LegendOrdinal scale={fillScale} labelFormat={(label) => `${label}`}>
        {(labels) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              right: "10%",
              top: "60%",
              border: "1px solid white",
              borderRadius: "5px",
              padding: "0.5rem",
            }}
          >
            <div>Region</div>
            {labels.map((label, i) => (
              <LegendItem key={i} margin='0 10px'>
                <svg width={legendGlyphSize} height={legendGlyphSize}>
                  <rect
                    fill={label.value}
                    width={legendGlyphSize}
                    height={legendGlyphSize}
                    rx={5}
                  />
                </svg>
                <LegendLabel
                  style={{ color: "#a7a9be", margin: `0 0 0 10px` }}
                  align='left'
                >
                  {label.text}
                </LegendLabel>
              </LegendItem>
            ))}
          </div>
        )}
      </LegendOrdinal>
      <LegendSize scale={rScale}>
        {(labels) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              right: "30%",
              top: "60%",
              border: "1px solid white",
              borderRadius: "5px",
              padding: "0.5rem",
            }}
          >
            <div>Population</div>
            {labels.map((label) => {
              const size = rScale(label.datum) ?? 0;
              return (
                <LegendItem key={`legend-${label.text}-${label.index}`}>
                  <svg width={size} height={size} style={{ margin: "5px 1px" }}>
                    <circle
                      fill='transparent'
                      stroke='white'
                      r={size / 3}
                      cx={size / 3}
                      cy={size / 3}
                    />
                  </svg>
                  <LegendLabel align='left' margin='0 4px'>
                    {d3.format(",.2r")(Math.ceil(label.text))}
                  </LegendLabel>
                </LegendItem>
              );
            })}
          </div>
        )}
      </LegendSize>
      <svg width={width} height={height} ref={svgRef}>
        <rect
          width={width}
          height={height}
          fill={"transparent"}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseLeave}
        />
        <AxisLeft
          scale={yScale}
          left={margin.left}
          tickStroke='#a7a9be'
          stroke='#a7a9be'
          label='Life expectancy'
        />
        <Axis
          orientation='top'
          scale={xScale}
          top={margin.top}
          tickFormat={d3.format("~s")}
          numTicks={2}
          tickStroke='transparent'
          stroke='transparent'
        />
        <AxisBottom
          scale={xScale}
          top={innerHeight + margin.top}
          tickFormat={d3.format("$~s")}
          numTicks={2}
          tickStroke='#a7a9be'
          stroke='#a7a9be'
          label='GDP per cap'
        />
        <GridColumns
          top={margin.top}
          scale={xScale}
          height={innerHeight}
          strokeDasharray='1,3'
          stroke='#fffffe'
          strokeOpacity={0.5}
          pointerEvents='none'
          numTicks={2}
        />
        <Group pointerEvents='none'>
          {data.map((point, i) => (
            <Circle
              key={i}
              cx={xScale(x(point))}
              cy={yScale(y(point))}
              r={rScale(radius(point))}
              fill={fillScale(fill(point))}
              fillOpacity={0.8}
              stroke={
                tooltipData === point ? "#fffffe" : fillScale(fill(point))
              }
            />
          ))}
        </Group>
        <Text
          x={width * 0.75}
          width={width}
          textAnchor='middle'
          y={yScale(51)}
          style={{ fontSize: "1.2rem" }}
        >
          Rich &rarr;
        </Text>
        <Text
          x={width / 2}
          width={width}
          textAnchor='middle'
          y={yScale(51)}
          style={{ fontSize: "3rem" }}
        >
          INCOME
        </Text>
        <Text
          x={width * 0.25}
          width={width}
          textAnchor='middle'
          y={yScale(51)}
          style={{ fontSize: "1.2rem" }}
        >
          &larr; Poor
        </Text>
        <Text
          x={xScale(270)}
          width={height}
          textAnchor='middle'
          angle={270}
          y={height * 0.25}
          style={{ fontSize: "1.2rem" }}
        >
          Healthy &rarr;
        </Text>
        <Text
          x={xScale(270)}
          width={height}
          angle={270}
          textAnchor='middle'
          y={height / 2}
          style={{ fontSize: "3rem" }}
        >
          HEALTH
        </Text>
        <Text
          x={xScale(270)}
          width={height}
          textAnchor='middle'
          angle={270}
          y={height * 0.75}
          style={{ fontSize: "1.2rem" }}
        >
          &larr; Sick
        </Text>
      </svg>
      {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
        <TooltipWithBounds
          left={tooltipLeft + 10}
          top={tooltipTop + 10}
          style={tooltipStyles}
        >
          <div
            style={{
              color: fillScale(fill(tooltipData)),
              padding: "0 0 0.5rem 0",
            }}
          >
            <strong>{tooltipData.country}</strong>
          </div>
          <div>
            <strong>GDP per cap:</strong>
            {" $"}
            {`${d3.format(".2~s")(x(tooltipData))}`}
          </div>
          <div>
            <strong>Life Expectancy</strong> {Math.round(y(tooltipData))}
          </div>
          <div>
            <strong>Population</strong> {`${Math.round(radius(tooltipData))}m`}
          </div>
        </TooltipWithBounds>
      )}
    </Graph>
  );
};

export default withTooltip(ScatterPlot);
