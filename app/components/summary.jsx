import _ from 'lodash';
import moment from 'moment';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import React from 'react';
import Stat from './stat';

window.moment = moment;

const ZERO_HOUR = {
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
};

export default function ({ actions, actionsByCreator, board, before, since }) {
  const hist = _.groupBy(actions, 'doy');
  let i = since.clone().set(ZERO_HOUR);
  while (before.isAfter(i)) {
    const iso = i.toISOString();
    if (hist[iso] == null) {
      hist[iso] = [];
    }
    i = i.add(1, 'day');
  }
  const data = _.keys(hist)
    .sort()
    .map((doy) => ({
      doy: moment(new Date(doy)).format('MMM D'),
      count: hist[doy].length,
    }));

  const membersPlural = actionsByCreator.length !== 1;
  const actionsPlural = actions.length !== 1;
  const rangeInDays = before.diff(since, 'days');

  return (
    <div className="summary">
      <h3>Activity By Day</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart width={762} height={300} data={data}>
          <XAxis dataKey="doy" />
          <YAxis />
          <CartesianGrid stroke="#CDD2D4" strokeDasharray="5 5" />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#61BD4F"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <p>
        <Stat val={actionsByCreator.length} /> { membersPlural ? 'members' : 'member' } performed <Stat val={actions.length} /> { actionsPlural ? 'actions' : 'action' } on the <strong>{ board.name }</strong> board over the last <Stat val={rangeInDays} /> days.
      </p>
    </div>
  );
};
