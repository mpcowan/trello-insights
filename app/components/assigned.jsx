import _ from 'lodash';
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

import Stat from './stat';

const CustomTooltip = (props) => {
  if (props.active) {
    const { payload, label } = props;
    const { count, member } = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p><Stat val={member.username} /> is on <Stat val={count} /> card{ count !== 1 ? 's' : ''}</p>
      </div>
    );
  }

  return null;
};

class Assigned extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.state = { activeIndex: null };
  }

  componentDidUpdate() {
    this.loadEmbeddedCards();
  }

  loadEmbeddedCards() {
    const el = document.getElementById('embedded-assigned-cards');
    if (el) {
      el.innerHTML = '';
      const { activeItem } = this.state;
      activeItem.idCards.forEach((idCard) => {
        window.TrelloCards.create(idCard, el, { compact: true });
      });
    }
  }

  handleClick(data, index) {
    if (this.state.activeIndex === index) {
      return this.setState({ activeIndex: null, activeItem: data });
    }
  	this.setState({ activeIndex: index, activeItem: data });
  }

  render() {
    const { cards, members } = this.props;
    const assignees = {};
    _.forEach(cards, (card) => {
      _.forEach(card.members, (member) => {
        if (assignees[member.id]) {
          assignees[member.id] += 1;
        } else {
          assignees[member.id] = 1;
        }
      });
    });

    const topAssignees = _(assignees)
      .toPairs()
      .sortBy('1')
      .value()
      .reverse();

    const assigneeData = topAssignees.map(([idMember, count]) => ({
      id: idMember,
      member: _.find(members, ['id', idMember]),
      serialized: JSON.stringify(_.find(members, ['id', idMember])),
      idCards: _.chain(cards)
        .filter((c) => _.find(c.members, ['id', idMember]))
        .map((c) => c.id)
        .value(),
      count,
    }));

    const { activeIndex } = this.state;
    const activeItem = assigneeData[activeIndex];

    const pluralMembers = assigneeData.length !== 1;

    const avatarSize = Math.min(32, Math.floor(670 / assigneeData.length) - 2);
    const CustomXAxisLabel = (props) => {
      const member = JSON.parse(props.payload.value);
      return (
        <g transform={`translate(${props.x - (avatarSize / 2)},${props.y + 4})`}>
          <image
            xlinkHref={member.avatar}
            x={0}
            y={0}
            height={`${avatarSize}px`}
            width={`${avatarSize}px`}
            textAnchor="middle"
            fill="#d6dadc"
          />
        </g>
      )
    };

    return (
      <div className="top-mentions">
        <h3>Card Members</h3>
        <p>
          <Stat val={assigneeData.length} /> {pluralMembers ? 'members are' : 'member is'} assigned to cards in this list.
        </p>

        { assigneeData.length > 0 &&
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              width={762}
              height={250}
              data={assigneeData}
              margin={{ top: 10, right: 30, left: 0, bottom: 24 }}
            >
              <XAxis dataKey="serialized" interval={0} tick={<CustomXAxisLabel />} />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" onClick={this.handleClick}>
                {
                  assigneeData.map((entry, index) => (
                    <Cell
                      cursor="pointer"
                      fill={index === activeIndex ? '#BB8129' : '#E99E40'}
                      key={`cell-${index}`}
                    />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        }

        { activeItem != null &&
          <div className="horizontal-scroll" id="embedded-assigned-cards" />
        }

      </div>
    );
  }
}

export default Assigned;
