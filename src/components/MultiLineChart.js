import React, { useCallback } from "react";
import { gdpPerCap } from "./gdpPerCap";
import { scaleLinear, scaleOrdinal } from "@visx/scale";
import * as d3 from "d3";
import { LinePath, Line } from "@visx/shape";
import { curveLinear } from "@visx/curve";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { LegendOrdinal, LegendItem, LegendLabel } from "@visx/legend";
import { withTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import styled from "styled-components";

const tooltipStyles = {
  ...defaultStyles,
  background: `rgba(15, 14, 23, 0.5)`,
  border: "1px solid #a7a9be",
  color: "#a7a9be",
  fontSize: "14px",
  padding: "0.8rem",
};

const TooltipRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 2fr;
  grid-template-rows: 1fr;
`;

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

export const MultiLineChart = ({
  width,
  height,
  margin = { top: 30, bottom: 30, left: 40, right: 40 },
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipTop = 0,
  tooltipLeft = 0,
}) => {
  // Set dimensions
  const legendGlyphSize = 10;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // create accessor functions
  const x = (d) => d.year;
  const y = (d) => d.gdpPerCap;
  const color = (d) => d.country;

  // create scales
  const xScale = scaleLinear({
    range: [margin.left, innerWidth + margin.left],
    domain: d3.extent(gdpPerCap, x),
    clamp: true,
  });

  const yScale = scaleLinear({
    domain: d3.extent(gdpPerCap, y),
    range: [innerHeight + margin.top, margin.top],
    nice: true,
  });

  const colorScale = scaleOrdinal({
    domain: [...new Set(gdpPerCap.map(color))],
    range: ["#FFC589", "#84DEC4", "#A4ADE8", "#84DFE2", "#FFA48E", "#87BA71"],
  });

  // tooltip handler
  const handleTooltip = useCallback(
    (event) => {
      const { x } = localPoint(event) || { x: 0 };
      let x0 = xScale.invert(x);
      x0 = Math.round(x0);
      let d = gdpPerCap.filter((row) => row.year === x0);
      let max = d3.max(d, y);

      let order = d
        .sort((rowOne, rowTwo) => rowOne.gdpPerCap - rowTwo.gdpPerCap)
        .map((row) => row.country);

      d = d.sort((a, b) => order.indexOf(b.country) - order.indexOf(a.country));
      console.log(d);

      showTooltip({
        tooltipData: d,
        tooltipLeft: xScale(x0),
        tooltipTop: yScale(max),
      });
    },
    [showTooltip, yScale, xScale]
  );

  const group = Array.from(
    d3.group(gdpPerCap, (d) => d.country),
    ([key, value]) => ({ key, value })
  );

  return (
    <Graph>
      <LegendOrdinal scale={colorScale} labelFormat={(label) => `${label}`}>
        {(labels) => (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {labels.map((label, i) => (
              <LegendItem key={`legend-quantile-${i}`} margin='0 10px'>
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
      <svg width={width} height={height}>
        {group.map((data) => (
          <LinePath
            className={data.key}
            data={data.value}
            x={(d) => xScale(x(d))}
            y={(d) => yScale(y(d))}
            stroke={colorScale(data.key)}
            strokeWidth={2}
            curve={curveLinear}
          />
        ))}
        <AxisBottom
          scale={xScale}
          top={innerHeight + margin.top}
          tickFormat={d3.format("d")}
          tickStroke='#a7a9be'
          stroke='#a7a9be'
        />
        <AxisLeft
          scale={yScale}
          left={margin.left}
          numTicks={5}
          tickFormat={d3.format("~s")}
          tickStroke='#a7a9be'
          stroke='#a7a9be'
        />
        <rect
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill='transparent'
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={() => hideTooltip()}
        />
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: innerHeight + margin.top }}
              stroke='#a7a9be'
              opacity={0.5}
              strokeWidth={1}
              pointerEvents='none'
            />
            {tooltipData.map((row) => (
              <circle
                cx={xScale(x(row))}
                cy={yScale(y(row))}
                r={5}
                stroke='#FFFFFE'
                fill={colorScale(color(row))}
                strokeWidth={1}
                pointerEvents='none'
              />
            ))}
          </g>
        )}
      </svg>
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop - 12}
          left={tooltipLeft + 12}
          style={tooltipStyles}
        >
          <div style={{ textAlign: "center" }}>
            <strong>{Math.round(xScale.invert(tooltipLeft))}</strong>
          </div>
          {tooltipData.map((row) => (
            <TooltipRow
              style={{
                display: "grid",
                padding: "0.4rem",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  margin: "0 5px 0 0",
                  background: colorScale(color(row)),
                }}
              ></div>
              <div>{row.country}</div>
              <div style={{ textAlign: "right" }}>
                {" $"}
                {`${d3.format(".2~s")(row.gdpPerCap)}`}
              </div>
            </TooltipRow>
          ))}
        </TooltipWithBounds>
      )}
    </Graph>
  );
};

export default withTooltip(MultiLineChart);
