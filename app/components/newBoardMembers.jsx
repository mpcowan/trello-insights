// @ts-check

import _ from 'lodash';
import React from 'react';

import NamedMember from './namedMember';
import Stat from './stat';

export default function ({ addMemberToBoardActions }) {
  const added = _.filter(addMemberToBoardActions, (a) => a.idMemberCreator !== a.member.id);
  const joined = _.filter(addMemberToBoardActions, (a) => a.idMemberCreator === a.member.id);
  const newMembers = _(addMemberToBoardActions)
    .map((a) => _.extend(a.member, { date: new Date(a.date) }))
    .uniqBy('id')
    .value();

  return (
    <div className="addMemberToBoard">
      <h3>Newest Board Members</h3>
      <p>
        <Stat val={added.length} /> members were added to this board while{' '}
        <Stat val={joined.length} /> joined it themselves.
      </p>
      <div className="three-column">
        {newMembers.map((m) => (
          <NamedMember
            key={m.id}
            member={m}
            horizontal
            stat={m.date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}
          />
        ))}
      </div>
    </div>
  );
}
