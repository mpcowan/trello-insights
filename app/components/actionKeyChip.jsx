import React from 'react';

export default function ({ hex, name }) {
  return (
    <div>
      <span className="color-chip" style={{ backgroundColor: hex }} />
      <span>{name}</span>
    </div>
  );
}
