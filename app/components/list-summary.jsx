// @ts-check

import _ from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import {
  CartesianGrid,
  Legend,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const ZERO_HOUR = {
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
};

export default function ({ actions, idList, before, since }) {
  const hist = _.groupBy(actions, 'doy');
  let i = DateTime.fromJSDate(since).set(ZERO_HOUR);
  while (i < DateTime.fromJSDate(before)) {
    const iso = i.toISO();
    if (hist[iso] == null) {
      hist[iso] = [];
    }
    i = i.plus({ days: 1 });
  }
  const data = _.keys(hist)
    .sort()
    .map((doy) => ({
      doy: new Date(doy).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      'Created In': _.filter(hist[doy], (a) => {
        return a.type === 'createCard' && a.data.list.id === idList;
      }).length,
      'Moved Into': _.filter(hist[doy], (a) => {
        return (
          a.type === 'updateCard:idList' &&
          a.data.old.idList !== idList &&
          a.data.card.idList === idList
        );
      }).length,
      'Moved Out': _.filter(hist[doy], (a) => {
        return a.type === 'updateCard:idList' && a.data.old.idList === idList;
      }).length,
      'Moved Within': _.filter(hist[doy], (a) => {
        return a.type === 'updateCard:pos' && a.data.list.id === idList;
      }).length,
      'Archived From': _.filter(hist[doy], (a) => {
        return a.type === 'updateCard:closed' && a.data.list.id === idList;
      }).length,
    }));

  return (
    <div className="summary">
      <h3>Activity By Day</h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          width={762}
          height={300}
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="doy" />
          <YAxis />
          <CartesianGrid stroke="#CDD2D4" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Moved Into" stackId="a" fill="#61BD4F" />
          <Bar dataKey="Moved Out" stackId="a" fill="#026AA7" />
          <Bar dataKey="Moved Within" stackId="a" fill="#A86CC1" />
          <Bar dataKey="Created In" stackId="a" fill="#E99E40" />
          <Bar dataKey="Archived From" stackId="a" fill="#CF513D" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
