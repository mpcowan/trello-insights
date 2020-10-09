import React from 'react';

export default function ({ member, hideName, horizontal, stat }) {
  const combinedNames = `${member.fullName} (@${member.username})`;

  if (member.avatarHash) {
    if (!horizontal) {
      return (
        <div className="named-member">
          <img
            className="member-avatar large"
            src={`https://trello-avatars.s3.amazonaws.com/${member.avatarHash}/170.png`}
            alt={combinedNames}
            title={combinedNames}
          />
          { !hideName &&
            <span>{ `@${member.username}` }</span>
          }
        </div>
      );
    }
    return (
      <div className="named-member horizontal">
        <img
          className="member-avatar large"
          src={`https://trello-avatars.s3.amazonaws.com/${member.avatarHash}/170.png`}
          alt={combinedNames}
          title={combinedNames}
        />
        <div>
          <h4>{member.fullName}</h4>
          <p className="u-quiet">{`@${member.username}`}</p>
          <p className="emphasis">{stat}</p>
        </div>
      </div>
    );
  }

  if (horizontal) {
    return (
      <div className="named-member horizontal">
        <span className="member-initials" title={combinedNames}>{member.initials}</span>
        <div>
          <h4>{member.fullName}</h4>
          <p className="u-quiet">{`@${member.username}`}</p>
          <p className="emphasis">{stat}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="named-member">
      <span className="member-initials" title={combinedNames}>{member.initials}</span>
      { !hideName &&
        <span>{ `@${member.username}` }</span>
      }
    </div>
  );
};
