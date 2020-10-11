/* global google */

import _ from 'lodash';
import React from 'react';

import RelatedCards from './related-cards';
import Stat from './stat';

class OutFlows extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRow: null,
      selectedIdCards: null,
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

  loadEmbeddedCards() {
    const el = document.getElementById('embedded-outflow-cards');
    if (el) {
      el.innerHTML = '';
      const { selectedFlow } = this.state;
      selectedFlow.forEach((a) => {
        window.TrelloCards.create(a.data.card.id, el, { compact: true });
      });
    }
  }

  drawSankey() {
    const { archiveActions, moveOutActions } = this.props;
    const groupedOut = _.groupBy(moveOutActions, 'data.listAfter.id');
    const dataOut = _.map(groupedOut, (val) => [
      val[0].data.listBefore.name,
      val[0].data.listAfter.name,
      val.length,
      `${val.length} card${val.length !== 1 ? 's' : ''} moved from "${
        val[0].data.listBefore.name
      }" to "${val[0].data.listAfter.name}"`,
    ]);
    const cardsOut = _.map(groupedOut, (val) => val);
    if (archiveActions.length > 0) {
      dataOut.push([
        archiveActions[0].data.list.name,
        '[Archive]',
        archiveActions.length,
        `${archiveActions.length} card${archiveActions.length !== 1 ? 's' : ''} archived from "${
          archiveActions[0].data.list.name
        }"`,
      ]);
      cardsOut.push(archiveActions);
    }

    if (dataOut.length) {
      const gdataOut = new google.visualization.DataTable();
      gdataOut.addColumn('string', 'From');
      gdataOut.addColumn('string', 'To');
      gdataOut.addColumn('number', 'Count');
      gdataOut.addColumn({ type: 'string', role: 'tooltip' });
      gdataOut.addRows(dataOut);
      const chartOut = new google.visualization.Sankey(document.getElementById('list-out-sankey'));
      google.visualization.events.addListener(chartOut, 'select', () => {
        const selection = chartOut.getSelection();
        if (this.state.selectedRow === selection[0].row) {
          this.setState({ selectedRow: null, selectedIdCards: [] });
        } else {
          this.setState({
            selectedRow: selection[0].row,
            selectedIdCards: _.map(cardsOut[selection[0].row], 'data.card.id'),
          });
        }
      });
      chartOut.draw(gdataOut, {
        height: Math.max(100, dataOut.length * 36),
        sankey: {
          link: { interactivity: true },
          node: { interactivity: false },
        },
      });
    }
  }

  render() {
    const { archiveActions, moveOutActions, since, before } = this.props;
    const outs = archiveActions.length + moveOutActions.length !== 1;

    return (
      <div className="card-movement">
        <h3>Cards Moved Out</h3>
        <p>
          <Stat val={moveOutActions.length + archiveActions.length} /> card
          {outs ? 's' : ''} left this list between{' '}
          {since.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
          and{' '}
          {before.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          .
        </p>

        {archiveActions.length + moveOutActions.length > 0 && (
          <div className="clickable-sankey" id="list-out-sankey" />
        )}

        <RelatedCards idCards={this.state.selectedIdCards} compact />
      </div>
    );
  }
}

export default OutFlows;
