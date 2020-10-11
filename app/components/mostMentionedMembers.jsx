import _ from 'lodash';
import React from 'react';

import NamedMember from './namedMember';
import Stat from './stat';

export default function ({ commentCardActions, boardMembers }) {
  const mentionExpression = /(@[a-z0-9_]{3,})/g;

  let totalMentions = 0;
  let mentions = {};
  _.forEach(commentCardActions, (a) => {
    let mention = mentionExpression.exec(a.data.text);
    while (mention) {
      totalMentions += 1;
      if (!mentions[mention[1]]) {
        mentions[mention[1]] = 1;
      } else {
        mentions[mention[1]] += 1;
      }
      mention = mentionExpression.exec(a.data.text);
    }
  });

  mentions = _.omit(mentions, ['@board', '@card']);

  const topMentions = _(mentions).toPairs().sortBy('1').value().reverse();

  const mentionData = topMentions
    .map(([username, count]) => ({
      username,
      count,
    }))
    .map((mention) =>
      _.extend(mention, {
        member: _.find(boardMembers, ['username', mention.username.substring(1)]),
      })
    )
    .filter((mention) => mention.member != null)
    .slice(0, 6);

  const pluralMembers = Object.keys(mentions).length !== 1;
  const pluralTimes = totalMentions !== 1;

  return (
    <div className="top-mentions">
      <h3>Most Mentioned Members</h3>
      <p>
        <Stat val={Object.keys(mentions).length} /> {pluralMembers ? 'members were' : 'member was'}{' '}
        mentioned <Stat val={totalMentions} /> {pluralTimes ? 'times' : 'time'}.
      </p>
      <div className="three-column">
        {mentionData.map((mention) => (
          <NamedMember
            member={mention.member}
            key={mention.member.id}
            horizontal
            stat={`Mentioned ${mention.count} time${mention.count === 1 ? '' : 's'}`}
          />
        ))}
      </div>
    </div>
  );
}
