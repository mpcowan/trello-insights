import _ from 'lodash';
import moment from 'moment';
import React from 'react';

import NamedMember from './namedMember';
import Stat from './stat';

class DueComplete extends React.Component {
  componentDidMount() {
    window.TrelloCards.load(document.getElementById('embedded-completed-cards'));
  }

  componentDidUpdate() {
    window.TrelloCards.load(document.getElementById('embedded-completed-cards'));
  }

  render() {
    // group actions by the card they impacted
    const uniqCompleted = _(this.props.dueCompleteActions)
      .filter(['data.old.dueComplete', false])
      .uniqBy('data.card.id')
      .value();

    const pluralize = this.props.dueCompleteActions.length !== 1;

    return (
      <div className="completed-cards">
        <h3>Cards Marked Done</h3>

        <p>
          <Stat val={uniqCompleted.length} /> due { pluralize ? 'dates' : 'date' } marked completed.
        </p>

        <div id="embedded-completed-cards">
          {
            uniqCompleted.slice(0, 3).map((action) => {
              const cardName = action.data.card.name;
              const idCard = action.data.card.id;
              return (
                <div className="two-column" key={idCard}>
                  <blockquote className="trello-card" key={idCard}>
                    <a href={`https://trello.com/c/${idCard}/`}>
                      {cardName}
                    </a>
                  </blockquote>
                  <NamedMember
                    member={action.memberCreator}
                    horizontal
                    stat={moment(action.date).format('lll')}
                  />
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default DueComplete;