import React from "react";
import {
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { mergeTimeseriesByKey } from "@/utils/index.js";
import { getDateFormats } from "@/utils/dates";

const formatDatetime = datetime => {
  const { MMM } = getDateFormats(new Date(datetime));
  return MMM;
};
const labelFormatter = datetime => {
  const { YYYY, MMMM } = getDateFormats(new Date(datetime));
  return `${YYYY} ${MMMM}`;
};

const COLORS = [
  "#8884d8",
  "#e0752d",
  "rgb(52, 171, 107)",
  "rgba(38, 43, 51)",
  "rgb(52, 118, 153)"
];

const HistoricalBalanceChart = ({ data }) => {
  const timeseries = Object.keys(data).map(name => {
    if (!data[name]) return [];
    return data[name].items.map(({ datetime, balance }) => ({
      datetime,
      [name]: balance
    }));
  });
  const normalizedData = mergeTimeseriesByKey({
    timeseries,
    key: "datetime"
  });

  return (
    <LineChart
      width={400}
      height={400}
      data={normalizedData}
      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
    >
      <XAxis dataKey="datetime" tickFormatter={formatDatetime} />
      <CartesianGrid vertical={false} strokeDasharray="4 10" stroke="#ebeef5" />
      <Legend verticalAlign="bottom" height={36} />
      {Object.keys(data).map(name => (
        <YAxis yAxisId={name} hide key={name} />
      ))}
      <Tooltip
        labelFormatter={labelFormatter}
        formatter={value => new Intl.NumberFormat().format(value)}
      />
      {Object.keys(data).map((name, index) => {
        return (
          <Line
            type="linear"
            dot={false}
            stroke={COLORS[index]}
            dataKey={name}
            yAxisId={name}
            name={name}
            key={index}
          />
        );
      })}
    </LineChart>
  );
};

export default HistoricalBalanceChart;
