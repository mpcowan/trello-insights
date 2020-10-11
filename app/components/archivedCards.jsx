import React from 'react';

import Stat from './stat';

class ArchivedCards extends React.Component {
  componentDidMount() {
    window.TrelloCards.load(document.getElementById('embedded-archived-cards'));
  }

  componentDidUpdate() {
    window.TrelloCards.load(document.getElementById('embedded-archived-cards'));
  }

  render() {
    const { archiveActions } = this.props;
    const pluralize = archiveActions.length !== 1;

    return (
      <div className="completed-cards">
        <h3>Archived Cards</h3>

        <p>
          <Stat val={archiveActions.length} /> {pluralize ? 'cards' : 'card'} archived.
        </p>

        <div className="horizontal-scroll" id="embedded-archived-cards">
          {archiveActions.slice(0, 3).map((action) => {
            const cardName = action.data.card.name;
            const idCard = action.data.card.id;
            return (
              <div className="named-member" key={idCard}>
                <blockquote className="trello-card-compact" key={idCard}>
                  <a href={`https://trello.com/c/${idCard}/`}>{cardName}</a>
                </blockquote>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ArchivedCards;
