import React from 'react';

export default function ({ member }) {
  const combinedNames = `${member.fullName} (@${member.username})`;
  if (member.avatar || member.avatarUrl) {
    return (
      <div className="member">
        <img
          className="member-avatar"
          src={member.avatar || `${member.avatarUrl}/170.png`}
          alt={combinedNames}
          title={combinedNames}
        />
      </div>
    );
  }
  return (
    <div className="member">
      <span className="member-initials" title={combinedNames}>
        {member.initials}
      </span>
    </div>
  );
}
