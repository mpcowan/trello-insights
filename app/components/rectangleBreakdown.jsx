import { BarChart, Bar } from 'recharts';
import React from 'react';

export default function ({ data }) {
  return (
    <BarChart
      width={200}
      height={40}
      data={data}
      layout="vertical"
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <Bar dataKey="first" fill="#CF513D" />
      <Bar dataKey="second" fill="#E99E40" />
      <Bar dataKey="third" fill="#E6C60D" />
      <Bar dataKey="fourth" fill="#5AAC44" />
      <Bar dataKey="fifth" fill="#026AA7" />
      <Bar dataKey="sixth" fill="#A86CC1" />
    </BarChart>
  );
}
