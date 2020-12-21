import React, { useCallback } from "react";
import * as d3 from "d3";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { scaleLinear } from "@visx/scale";
import { AreaClosed, Line, Bar, LinePath } from "@visx/shape";
import { curveLinear } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";
import { withTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { PatternLines } from "@visx/pattern";

import styled from "styled-components";

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
  background: "#0f0e17",
  border: "1px solid #a7a9be",
  color: "#a7a9be",
  fontSize: "14px",
  textAlign: "center",
};

const LineChart = ({
  data,
  width,
  height,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipTop = 0,
  tooltipLeft = 0,
  margin = { top: 30, left: 40, right: 40, bottom: 30 },
}) => {
  const x = (d) => d.date;
  const y = (d) => d.value;
  const bisectX = d3.bisector((d) => d.date).right;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Set scales
  const xScale = scaleLinear({
    range: [margin.left, innerWidth + margin.left],
    domain: d3.extent(data, x),
    clamp: true,
  });

  const yScale = scaleLinear({
    range: [innerHeight + margin.top, margin.top],
    domain: [0, d3.max(data, y)],
    nice: true,
  });

  // tooltip handler
  const handleTooltip = useCallback(
    (event) => {
      const { x } = localPoint(event) || { x: 0 };
      let x0 = xScale.invert(x);
      x0 = Math.round(x0);
      const index = bisectX(data, x0, 0);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;

      if (d1 && xScale(d1)) {
        d =
          x0.valueOf() - xScale(d0).valueOf() > x(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: xScale(x0),
        tooltipTop: yScale(y(d)),
      });
    },
    [showTooltip, yScale, xScale, bisectX, data]
  );

  return (
    <Graph>
      <svg width={width} height={height}>
        <LinearGradient id='area-gradient' from={"#e53170"} to={"#0f0e17"} />
        <PatternLines
          id='bar-pattern'
          height={20}
          width={20}
          stroke='#a7a9be'
          strokeWidth={1}
          orientation={["diagonal"]}
        />
        <Bar
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill={`url(#bar-pattern)`}
          opacity={0.1}
        />
        <AreaClosed
          data={data}
          x={(d) => xScale(x(d))}
          y={(d) => yScale(y(d))}
          yScale={yScale}
          strokeWidth={1}
          fill="url('#area-gradient')"
          curve={curveLinear}
        />
        <LinePath
          data={data}
          x={(d) => xScale(x(d))}
          y={(d) => yScale(y(d))}
          strokeWidth={2}
          stroke='#e53170'
          curve={curveLinear}
        />
        <Bar
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
        <AxisLeft
          scale={yScale}
          left={margin.left}
          numTicks={5}
          tickFormat={d3.format("~s")}
          tickStroke='#a7a9be'
          stroke='#a7a9be'
        />
        <AxisBottom
          scale={xScale}
          top={innerHeight + margin.top}
          tickFormat={d3.format("d")}
          tickStroke='#a7a9be'
          stroke='#a7a9be'
        />
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: yScale(y(tooltipData)) }}
              to={{ x: tooltipLeft, y: innerHeight + margin.top }}
              stroke='#a7a9be'
              opacity={0.5}
              strokeWidth={1}
              pointerEvents='none'
            />
            <Line
              to={{ x: margin.left, y: yScale(y(tooltipData)) }}
              from={{ x: tooltipLeft, y: yScale(y(tooltipData)) }}
              stroke='#a7a9be'
              opacity={0.5}
              strokeWidth={1}
              pointerEvents='none'
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 1}
              r={5}
              fill='#e53170'
              stroke='#a7a9be'
              strokeWidth={2}
              pointerEvents='none'
            />
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
          <strong>{`${x(tooltipData)}`}</strong>
          <br />
          {" $"}
          {`${d3.format(".2~s")(y(tooltipData))}`}
        </TooltipWithBounds>
      )}
    </Graph>
  );
};

export default withTooltip(LineChart);
