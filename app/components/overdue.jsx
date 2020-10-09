import _ from 'lodash';
import moment from 'moment';
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
    const now = moment();
    const overdue = _.filter(this.props.cards, (card) => {
      if (!card.due) {
        return false;
      }
      if (card.dueComplete) {
        return false;
      }
      const dueMoment = moment(new Date(card.due));
      return dueMoment.isBefore(now);
    });

    return (
      <div className="overdue">
        <h3>Cards Past Due</h3>
        <p><Stat val={overdue.length} /> cards past due.</p>
        <div className="horizontal-scroll" id="embedded-overdue-cards">
          {
            overdue.map((card) => (
              <div key={card.id}>
                <blockquote className="trello-card" key={card.id}>
                  <a href={`https://trello.com/c/${card.id}/`}>
                    {card.name}
                  </a>
                </blockquote>
                <p>[ ] Mark Complete</p>
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

export default OverdueCards;
