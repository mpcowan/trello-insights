import _ from 'lodash';
import moment from 'moment';
import React from 'react';

import NamedMember from './namedMember';
import Stat from './stat';

export default function ({ addMemberToBoardActions }) {
  const added = _.filter(addMemberToBoardActions, (a) => a.idMemberCreator !== a.member.id);
  const joined = _.filter(addMemberToBoardActions, (a) => a.idMemberCreator === a.member.id);
  const newMembers = _(addMemberToBoardActions)
    .map((a) => _.extend(a.member, { date: a.date }))
    .uniqBy('id')
    .value();

  return (
    <div className="addMemberToBoard">
      <h3>Newest Board Members</h3>
      <p>
        <Stat val={added.length} /> members were added to this board while <Stat val={joined.length} /> joined it themselves.
      </p>
      <div className="three-column">
        {
          newMembers.map((m) => (
            <NamedMember key={m.id} member={m} horizontal stat={moment(m.date).format('lll')} />
          ))
        }
      </div>
    </div>
  );
}
