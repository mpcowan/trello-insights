import React from 'react';

export default function ({ member }) {
  const combinedNames = `${member.fullName} (@${member.username})`;
  if (member.avatarHash) {
    return (
      <div className="member">
        <img
          className="member-avatar"
          src={`https://trello-avatars.s3.amazonaws.com/${member.avatarHash}/50.png`}
          alt={combinedNames}
          title={combinedNames}
        />
      </div>
    );
  }
  return (
    <div className="member">
      <span className="member-initials" title={combinedNames}>{member.initials}</span>
    </div>
  );
};
