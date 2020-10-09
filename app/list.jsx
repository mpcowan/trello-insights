/* global google */

import _ from 'lodash';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import React from 'react';

import normalizeAction from './utils/normalizeAction';

import Assigned from './components/assigned';
import Attachments from './components/attachments';
import CardAge from './components/card-age';
import InFlows from './components/inFlows';
import ListStats from './components/list-stats';
import ListSummary from './components/list-summary';
import MostActiveMembers from './components/mostActiveMembers';
import OutFlows from './components/outFlows';
import OverdueCards from './components/overdue';

window.Promise = window.TrelloPowerUp.Promise;

const ZERO_HOUR = {
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
};

const t = window.TrelloPowerUp.iframe();
google.charts.load('current', { packages: ['sankey'] });

class List extends React.Component {
  constructor(props) {
    super(props);

    const idBoard = t.arg('idBoard');
    const idList = t.arg('idList');
    this.loadBoard();
    this.loadList();

    const since = moment().subtract(2, 'weeks').set(ZERO_HOUR);
    const before = moment();

    google.charts.setOnLoadCallback(this.loadedGoogleCharts.bind(this));

    this.state = {
      idBoard,
      idList,
      actions: null,
      since,
      before,
      token: null,
      gcharts: false,
      tab: 'overview',
    };
  }

  componentDidMount() {
    return t.get('member', 'private', 'token')
      .then((token) => {
        this.setState({ token });
        this.loadBoardActions(this.state.idBoard, token, this.state.since, this.state.before);
      });
  }

  setSince(since) {
    if (!since || !since.isValid()) {
      return;
    }
    const { before } = this.state;
    if (since.isAfter(before)) {
      return;
    }
    if (before.diff(since, 'days') > 93) {
      console.error('93 days is maximum range');
      return;
    }
    this.setState({ since });
    this.loadBoardActions(this.state.idBoard, this.state.token, since, this.state.before);
  }

  setBefore(before) {
    if (!before || !before.isValid()) {
      return;
    }
    const { since } = this.state;
    if (since.isAfter(before)) {
      return;
    }
    if (before.isAfter(moment())) {
      return;
    }
    if (before.diff(since, 'days') > 93) {
      console.error('93 days is maximum range');
      return;
    }
    this.setState({ before });
    this.loadBoardActions(this.state.idBoard, this.state.token, this.state.since, before);
  }

  loadedGoogleCharts() {
    this.setState({ gcharts: true });
  }

  loadList() {
    return t.list('all')
      .then((list) => {
        this.setState({ list });
      });
  }

  loadBoard() {
    return t.board('id', 'name', 'members')
      .then((board) => {
        this.setState({ board });
      });
  }

  loadBoardActions(idBoard, token, since, before, pagedActions) {
    const reqData = {
      filter: 'all',
      limit: 1000,
      before: before.toISOString(),
      since: since.toISOString(),
      key: '7737388dfc54ea015104894e3a0a56f9',
      token,
    };

    if (pagedActions) {
      reqData.before = _.last(pagedActions).date;
    }
    const qs = Object.keys(reqData)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(reqData[k])}`)
      .join('&');

    fetch(`https://api.trello.com/1/boards/${idBoard}/actions?${qs}`)
      .then((resp) => resp.json())
      .then((actions) => {
        const inRange = _.filter(actions, (a) =>
          a.memberCreator != null && moment(new Date(a.date)).isAfter(since));

        if (inRange.length === reqData.limit) {
          // all in range, request another page worth
          this.loadBoardActions(idBoard, token, since, before, (pagedActions || []).concat(actions));
          return;
        }

        const normalized = _.map((pagedActions || []).concat(inRange), (a) =>
          _.extend(a, {
            type: normalizeAction(a),
            doy: moment(new Date(a.date)).set(ZERO_HOUR).toISOString(),
          })).filter((a) => {
            const targetList = _.get(a, 'data.list.id') === this.state.idList ||
              _.get(a, 'data.old.idList') === this.state.idList ||
              _.get(a, 'data.listBefore.id') === this.state.idList ||
              _.get(a, 'data.listAfter.id') === this.state.idList;
            return targetList;
          });

        const byType = _.groupBy(normalized, 'type');
        const byCreator = _(normalized)
          .groupBy('idMemberCreator')
          .toPairs()
          .sortBy('1')
          .value()
          .reverse();

        this.setState({
          actions: {
            normalized,
            byType,
            byCreator,
          },
        });
      });
  }

  render() {
    const { board, gcharts, idList, list } = this.state;
    if (!this.state.actions || !board || !list || !gcharts) {
      return (
        <p>Loading activity on the list...</p>
      );
    }

    const actions = this.state.actions.normalized;
    const { byType, byCreator } = this.state.actions;
    if (this.state.tab === 'overview') {
      return (
        <div className="App">
          <div className="range-selector">
            <button
              disabled
              onClick={() => this.setState({ tab: 'overview' })}
            >
            Overview
            </button>
            <button
              onClick={() => this.setState({ tab: 'activity' })}
            >
            Activity
            </button>
          </div>

          <hr />

          <h2>Overview</h2>

          <ListStats list={list} />

          <hr />

          <CardAge list={list} />

          <hr />

          <Assigned
            cards={list.cards}
            members={board.members}
          />

          <hr />

          <OverdueCards cards={list.cards} />

          <hr />

          <Attachments cards={list.cards} />
        </div>
      );
    } else if (this.state.tab === 'activity') {
      return (
        <div className="App">
          <div className="range-selector">
            <button
              onClick={() => this.setState({ tab: 'overview' })}
            >
            Overview
            </button>
            <button
              disabled
              onClick={() => this.setState({ tab: 'activity' })}
            >
            Activity
            </button>
          </div>

          <hr />

          <div className="range-selector">
            <label htmlFor="since-picker">From: </label>
            <DatePicker
              id="since-picker"
              selected={this.state.since}
              selectsStart
              startDate={this.state.since}
              endDate={this.state.before}
              minDate={this.state.before.clone().subtract(93, 'days')}
              maxDate={this.state.before.clone().subtract(1, 'day')}
              onChange={(since) => this.setSince(since)}
            />
            <label htmlFor="before-picker">To: </label>
            <DatePicker
              id="before-picker"
              selected={this.state.before}
              selectsEnd
              startDate={this.state.since}
              endDate={this.state.before}
              minDate={this.state.since.clone().add(1, 'day')}
              maxDate={moment()}
              onChange={(before) => this.setBefore(before)}
            />
          </div>

          <ListSummary
            actions={actions || []}
            idList={this.state.idList}
            since={this.state.since}
            before={this.state.before}
          />

          <hr />

          <MostActiveMembers
            actions={actions || []}
            actionsByCreator={byCreator}
            board={board}
            since={this.state.since}
            before={this.state.before}
          />

          <hr />

          <InFlows
            moveInActions={_.filter(byType['updateCard:idList'], ['data.listAfter.id', idList])}
            createCardActions={_.filter(byType.createCard, ['data.list.id', idList])}
            since={this.state.since}
            before={this.state.before}
          />

          <hr />

          <OutFlows
            moveOutActions={_.filter(byType['updateCard:idList'], ['data.listBefore.id', idList])}
            archiveActions={_.filter(byType['updateCard:closed'], ['data.list.id', idList])}
            since={this.state.since}
            before={this.state.before}
          />
        </div>
      );
    }

    return (
      <div />
    );
  }
}

export default List;
