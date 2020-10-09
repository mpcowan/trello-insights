import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import RelatedCards from './related-cards';

const atMidnight = (m) => m.hour(0).minute(0).second(0);
const ago = (num, type) => atMidnight(now().subtract(num, type)).day(0);
const now = () => moment();

class CardAge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIndex: null,
      selectedIdCards: null,
    };
  }

  render() {
    const { list } = this.props;

    const buckets = [
      { name: 'Today', ts: atMidnight(now()) },
      { name: 'Yesterday', ts: atMidnight(now().subtract(1, 'day')) },
      { name: 'This Week', ts: atMidnight(now().day(0)) },
      { name: 'Last Week', ts: atMidnight(now().subtract(1, 'week').day(0)) },
      { name: ago(2, 'weeks').format('MMM Do'), ts: ago(2, 'weeks') },
      { name: ago(3, 'weeks').format('MMM Do'), ts: ago(3, 'weeks') },
      { name: ago(4, 'weeks').format('MMM Do'), ts: ago(4, 'weeks') },
      { name: ago(5, 'weeks').format('MMM Do'), ts: ago(5, 'weeks') },
      { name: ago(6, 'weeks').format('MMM Do'), ts: ago(6, 'weeks') },
      { name: '3 Months', ts: now().subtract(3, 'months') },
      { name: '1 Year', ts: now().subtract(1, 'year') },
      { name: '>1 Year', ts: now().subtract(100, 'years') },
    ];

    // if yesterday is before the start of this week remove the this week bucket
    if (buckets[1].ts.isSameOrBefore(buckets[2].ts)) {
      buckets.splice(2, 1);
    }

    let counted = [];
    const data = _.map(buckets, (bucket) => {
      const cards = _.chain(list.cards)
        .filter((c) =>
          moment(new Date(c.dateLastActivity)).isAfter(bucket.ts))
        .map((c) => c.id)
        .without(...counted)
        .value();

      counted = counted.concat(cards);

      const inBucket = cards.length;
      return _.extend(bucket, {
        cards: inBucket,
        idCards: cards,
      });
    });

    if (_.last(data).cards === 0) {
      data.splice(-1, 1);
      if (_.last(data).cards === 0) {
        data.splice(-1, 1);
      }
    }

    const { activeIndex, selectedIdCards } = this.state;

    const barClick = (val, index) => {
      if (activeIndex === index) {
        this.setState({ activeIndex: null, selectedIdCards: [] });
      } else {
        this.setState({ activeIndex: index, selectedIdCards: val.idCards });
      }
    };

    return (
      <div>
        <h3>Card Freshness</h3>
        <p>Time since cards in this list were last edited.</p>
        <ResponsiveContainer width="100%" height={480}>
          <BarChart
            width={762}
            height={480}
            data={data}
            layout="vertical"
            margin={{ top: 16, right: 0, left: 0, bottom: 16 }}
          >
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" interval={0} width={80} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Bar
              dataKey="cards"
              onClick={barClick}>
              {
                data.map((entry, index) => (
                  <Cell
                    cursor="pointer"
                    fill={index === activeIndex ? '#00AECC' : '#0082A0'}
                    key={`cell-${index}`}
                  />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <RelatedCards idCards={selectedIdCards} />
      </div>
    );
  }
}

export default CardAge;
