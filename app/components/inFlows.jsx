/* global google */

import _ from 'lodash';
import React from 'react';

import RelatedCards from './related-cards';
import Stat from './stat';

class InFlows extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIdCards: [],
      selectedRow: null,
    };
  }

  componentDidMount() {
    this.drawSankey();
  }

  componentWillReceiveProps() {
    this.setState({ selectedIdCards: [], selectedRow: null });
  }

  componentDidUpdate() {
    this.drawSankey();
  }

  drawSankey() {
    const { createCardActions, moveInActions } = this.props;
    const groupedIn = _.groupBy(moveInActions, 'data.listBefore.id');
    const dataIn = _.map(groupedIn, (val) => [
      val[0].data.listBefore.name,
      val[0].data.listAfter.name,
      val.length,
      `${val.length} card${val.length !== 1 ? 's' : ''} moved from "${
        val[0].data.listBefore.name
      }" to "${val[0].data.listAfter.name}"`,
    ]);
    const cardsIn = _.map(groupedIn, (val) => val);
    if (createCardActions.length > 0) {
      dataIn.push([
        '[Created]',
        createCardActions[0].data.list.name,
        createCardActions.length,
        `${createCardActions.length} card${createCardActions.length !== 1 ? 's' : ''} created in "${
          createCardActions[0].data.list.name
        }"`,
      ]);
      cardsIn.push(createCardActions);
    }

    if (dataIn.length) {
      const gdataIn = new google.visualization.DataTable();
      gdataIn.addColumn('string', 'From');
      gdataIn.addColumn('string', 'To');
      gdataIn.addColumn('number', 'Count');
      gdataIn.addColumn({ type: 'string', role: 'tooltip' });
      gdataIn.addRows(dataIn);
      const chartIn = new google.visualization.Sankey(document.getElementById('list-in-sankey'));
      google.visualization.events.addListener(chartIn, 'select', () => {
        const selection = chartIn.getSelection();
        if (this.state.selectedRow === selection[0].row) {
          this.setState({ selectedRow: null, selectedIdCards: [] });
        } else {
          this.setState({
            selectedRow: selection[0].row,
            selectedIdCards: _.map(cardsIn[selection[0].row], 'data.card.id'),
          });
        }
      });
      chartIn.draw(gdataIn, {
        height: Math.max(100, dataIn.length * 36),
        sankey: {
          link: { interactivity: true },
          node: { interactivity: false },
        },
      });
    }
  }

  render() {
    const { createCardActions, moveInActions, since, before } = this.props;
    const ins = createCardActions.length + moveInActions.length !== 1;

    return (
      <div className="card-movement">
        <h3>Cards Moved In</h3>
        <p>
          <Stat val={moveInActions.length + createCardActions.length} /> card
          {ins ? 's' : ''} entered this list between{' '}
          {since.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
          and{' '}
          {before.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          .
        </p>

        {createCardActions.length + moveInActions.length > 0 && (
          <div className="clickable-sankey" id="list-in-sankey" />
        )}

        <RelatedCards idCards={this.state.selectedIdCards} compact />
      </div>
    );
  }
}

export default InFlows;
