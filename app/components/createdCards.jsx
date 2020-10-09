import React from 'react';

import Stat from './stat';

class CreatedCards extends React.Component {
  componentDidMount() {
    window.TrelloCards.load(document.getElementById('embedded-created-cards'));
  }

  componentDidUpdate() {
    window.TrelloCards.load(document.getElementById('embedded-created-cards'));
  }

  render() {
    const { createCardActions } = this.props;
    const pluralize = createCardActions.length !== 1;

    return (
      <div className="completed-cards">
        <h3>New Cards</h3>

        <p>
          <Stat val={createCardActions.length} /> { pluralize ? 'cards' : 'card' } created.
        </p>

        <div className="horizontal-scroll" id="embedded-created-cards">
          {
            createCardActions.slice(0, 3).map((action) => {
              const cardName = action.data.card.name;
              const idCard = action.data.card.id;
              return (
                <div className="named-member" key={idCard}>
                  <blockquote className="trello-card-compact" key={idCard}>
                    <a href={`https://trello.com/c/${idCard}/`}>
                      {cardName}
                    </a>
                  </blockquote>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default CreatedCards;
