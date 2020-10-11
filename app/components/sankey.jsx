/* global google */

import _ from 'lodash';
import React from 'react';
import Stat from './stat';

class ListSankey extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedInFlow: null,
      selectedOutFlow: null,
    };
  }

  componentDidMount() {
    this.drawSankey();
  }

  componentDidUpdate() {
    this.drawSankey();
    this.loadEmbeddedCards();
  }

  loadEmbeddedCards() {
    let el = document.getElementById('embedded-inflow-cards');
    if (el) {
      el.innerHTML = '';
      const { selectedInFlow } = this.state;
      selectedInFlow.forEach((a) => {
        window.TrelloCards.create(a.data.card.id, el, { compact: true });
      });
    }

    el = document.getElementById('embedded-outflow-cards');
    if (el) {
      el.innerHTML = '';
      const { selectedOutFlow } = this.state;
      selectedOutFlow.forEach((a) => {
        window.TrelloCards.create(a.data.card.id, el, { compact: true });
      });
    }
  }

  drawSankey() {
    const { moveInActions, moveOutActions } = this.props;
    const groupedIn = _.groupBy(moveInActions, 'data.listBefore.id');
    const groupedOut = _.groupBy(moveOutActions, 'data.listAfter.id');
    const dataIn = _.map(groupedIn, (val) => [
      val[0].data.listBefore.name,
      val[0].data.listAfter.name,
      val.length,
      `${val[0].data.listBefore.name} -> ${val[0].data.listAfter.name}`,
    ]);
    const cardsIn = _.map(groupedIn, (val) => val);
    const dataOut = _.map(groupedOut, (val) => [
      val[0].data.listBefore.name,
      val[0].data.listAfter.name,
      val.length,
      `${val[0].data.listBefore.name} -> ${val[0].data.listAfter.name}`,
    ]);
    const cardsOut = _.map(groupedOut, (val) => val);

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
        console.log(selection[0]);
        this.setState({ selectedInFlow: cardsIn[selection[0].row] });
      });
      chartIn.draw(gdataIn, {
        sankey: {
          link: { interactivity: true },
          node: { interactivity: false },
        },
      });
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
        console.log(selection[0]);
        this.setState({ selectedOutFlow: cardsOut[selection[0].row] });
      });
      chartOut.draw(gdataOut, {
        sankey: {
          link: { interactivity: true },
          node: { interactivity: false },
        },
      });
    }
  }

  render() {
    const { moveInActions, moveOutActions } = this.props;
    const ins = moveInActions.length !== 1;
    const outs = moveOutActions.length !== 1;

    return (
      <div className="card-movement">
        <h3>Cards Moved In</h3>
        <p>
          <Stat val={moveInActions.length} /> card{ins ? 's' : ''} moved into this list during the
          period.
        </p>

        {moveInActions.length > 0 && <div className="clickable-sankey" id="list-in-sankey" />}

        {this.state.selectedInFlow && (
          <div className="horizontal-scroll" id="embedded-inflow-cards" />
        )}

        <hr />

        <h3>Cards Moved Out</h3>
        <p>
          <Stat val={moveOutActions.length} /> card{outs ? 's' : ''} moved out of this list during
          the period.
        </p>

        {moveOutActions.length > 0 && <div className="clickable-sankey" id="list-out-sankey" />}

        {this.state.selectedOutFlow && (
          <div className="horizontal-scroll" id="embedded-outflow-cards" />
        )}
      </div>
    );
  }
}

export default ListSankey;
