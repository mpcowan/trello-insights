import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import {
  Cell,
  Pie,
  PieChart,
} from 'recharts';

import ActionKeyChip from './actionKeyChip';
import NamedMember from './namedMember';

window.moment = moment;

const ZERO_HOUR = {
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
};

export default function ({ actions, actionsByCreator, before, since }) {
  const hist = _.groupBy(actions, 'doy');
  let i = since.clone().set(ZERO_HOUR);
  while (before.isAfter(i)) {
    const iso = i.toISOString();
    if (hist[iso] == null) {
      hist[iso] = [];
    }
    i = i.add(1, 'day');
  }

  const friendlyActions = {
    addAttachmentToCard: 'Added Attachment',
    createCard: 'Created Card',
    'updateCard:pos': 'Reordered Card',
    'updateCard:idList': 'Moved Card',
    'updateCard:closed': 'Archived Card',
    'updateCard:name': 'Renamed Card',
    'updateCard:desc': 'Edited Card Description',
    'updateCard:due': 'Updated Due Date',
    commentCard: 'Commented on Card',
  };

  const topActions = _(actions)
    .groupBy('type')
    .toPairs()
    .sortBy('1')
    .value()
    .reverse()
    .slice(0, 4)
    .map((action) => action[0]);

  const topMemberData = actionsByCreator.slice(0, 4).map(([idMemberCreator, memberActions]) =>
    ({
      member: memberActions[0].memberCreator,
      name: `@${memberActions[0].memberCreator.username}`,
      count: memberActions.length,
      grouped: _(memberActions)
        .countBy('type')
        .pick(topActions)
        .toPairs()
        .value(),
    }));

  const colors = ['#CF513D', '#E99E40', '#5AAC44', '#026AA7', '#A86CC1'];

  return (
    <div>
      <h3>Most Active Members</h3>
      <div className="spread-out">
        {
          topActions.concat(['other']).map((v, i) => <ActionKeyChip key={i} hex={colors[i]} name={friendlyActions[v] || v} />)
        }
      </div>

      <div className="spread-out">
        {
          topMemberData.map((memberData) => {
            const memberCreator = memberData.member;
            const data = _.map(memberData.grouped, ([key, val]) => ({ name: key, value: val }));
            data.push({ name: 'Other', value: memberData.count - _.sumBy(data, 'value') });

            return (
              <div className="member-stat" key={`member-stat-${memberCreator.id}`}>
                <div className="pie-wrapper">
                  <div className="member-stat">
                    <NamedMember member={memberCreator} hideName />
                  </div>

                  <div className="absolute">
                    <PieChart
                      width={168}
                      height={168}
                    >
                      <Pie
                        innerRadius={32}
                        outerRadius={48}
                        data={data}
                        dataKey="value"
                        fill="#CF513D"
                        label
                      >
                        { data.map((entry, idx) => <Cell fill={colors[idx]} key={entry.name} />) }
                      </Pie>
                    </PieChart>
                  </div>
                </div>
                <h4><strong>{memberCreator.fullName}</strong></h4>
                <p>{`${memberData.count} action${memberData.count !== 1 ? 's' : ''}`}</p>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};
