import _ from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import { Line, LineChart, XAxis } from 'recharts';

class MostActiveCards extends React.Component {
  componentDidMount() {
    window.TrelloCards.load(document.getElementById('embedded-top-cards'));
  }

  componentDidUpdate() {
    window.TrelloCards.load(document.getElementById('embedded-top-cards'));
  }

  render() {
    // group actions by the card they impacted
    const byCard = _(this.props.actions)
      .filter((a) => a.data && a.data.card && a.data.card.id)
      .groupBy('data.card.id')
      .toPairs()
      .sortBy('1')
      .value()
      .reverse();

    return (
      <div className="top-cards">
        <h3>Most Active Cards</h3>

        <div id="embedded-top-cards">
          {byCard.slice(0, 5).map(([idCard, cardActions]) => {
            const cardName = cardActions[0].data.card.name;

            const hist = _.groupBy(cardActions, 'doy');
            let i = DateTime.fromJSDate(this.props.since).startOf('day');
            while (i < DateTime.fromJSDate(this.props.before)) {
              const iso = i.toISOString();
              if (hist[iso] == null) {
                hist[iso] = [];
              }
              i = i.plus({ days: 1 });
            }
            const data = _.keys(hist)
              .sort()
              .map((doy) => ({
                doy: new Date(doy).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                }),
                count: hist[doy].length,
              }));

            return (
              <div className="two-column" key={idCard}>
                <blockquote className="trello-card" key={idCard}>
                  <a href={`https://trello.com/c/${idCard}/`}>{cardName}</a>
                </blockquote>
                <div>
                  <LineChart width={360} height={100} data={data}>
                    <XAxis dataKey="doy" />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#61BD4F"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default MostActiveCards;
