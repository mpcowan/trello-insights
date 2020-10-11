// @ts-check

import _ from 'lodash';
import { DateTime } from 'luxon';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import React from 'react';
import Stat from './stat';

export default function ({ actions, actionsByCreator, board, before, since }) {
  const hist = _.groupBy(actions, 'doy');
  let i = DateTime.fromJSDate(since).startOf('day');
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
      doy: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      count: hist[doy].length,
    }));

  const membersPlural = actionsByCreator.length !== 1;
  const actionsPlural = actions.length !== 1;
  const rangeInDays = Math.round(DateTime.fromJSDate(before).diff(DateTime.fromJSDate(since), 'days').days);

  return (
    <div className="summary">
      <h3>Activity By Day</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart width={762} height={300} data={data}>
          <XAxis dataKey="doy" />
          <YAxis />
          <CartesianGrid stroke="#CDD2D4" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="count" stroke="#61BD4F" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <p>
        <Stat val={actionsByCreator.length} /> {membersPlural ? 'members' : 'member'} performed{' '}
        <Stat val={actions.length} /> {actionsPlural ? 'actions' : 'action'} on the{' '}
        <strong>{board.name}</strong> board over the last <Stat val={rangeInDays} /> days.
      </p>
    </div>
  );
}
