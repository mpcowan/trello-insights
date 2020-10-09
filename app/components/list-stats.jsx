import React from 'react';
import Stat from './stat';

export default function ({ list }) {
  return (
    <div>
      <p>There are <Stat val={list.cards.length} /> cards currently in this list.</p>
    </div>
  );
}
