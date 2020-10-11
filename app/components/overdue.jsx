// @ts-check

import React from 'react';
import Stat from './stat';

class OverdueCards extends React.Component {
  componentDidMount() {
    window.TrelloCards.load(document.getElementById('embedded-overdue-cards'));
  }

  componentDidUpdate() {
    window.TrelloCards.load(document.getElementById('embedded-overdue-cards'));
  }

  render() {
    const now = Date.now();
    const overdue = (this.props.cards || []).filter((card) => {
      if (!card.due) {
        return false;
      }
      if (card.dueComplete) {
        return false;
      }
      return new Date(card.due).getTime() < now;
    });

    return (
      <div className="overdue">
        <h3>Cards Past Due</h3>
        <p>
          <Stat val={overdue.length} /> cards past due.
        </p>
        <div className="horizontal-scroll" id="embedded-overdue-cards">
          {overdue.map((card) => (
            <div key={card.id}>
              <blockquote className="trello-card" key={card.id}>
                <a href={`https://trello.com/c/${card.id}/`}>{card.name}</a>
              </blockquote>
              <p>[ ] Mark Complete</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default OverdueCards;
