// @ts-check

import _ from 'lodash';
import DatePicker from 'react-datepicker';
import { DateTime } from 'luxon';
import React from 'react';
import Select from 'react-select';

import normalizeAction from './utils/normalizeAction';

import BoardSankey from './components/board-sankey';
import DueComplete from './components/dueComplete';
import MostActiveCards from './components/mostActiveCards';
import MostActiveMembers from './components/mostActiveMembers';
import MostMentionedMembers from './components/mostMentionedMembers';
import NewBoardMembers from './components/newBoardMembers';
import RadarActivity from './components/radar';
import Summary from './components/summary';

window.Promise = window.TrelloPowerUp.Promise;

const ZERO_HOUR = {
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
};

const t = window.TrelloPowerUp.iframe();

class Board extends React.Component {
  constructor(props) {
    super(props);

    const idBoard = t.arg('idBoard');
    this.loadBoard();

    const since = DateTime.local().minus({ days: 14 }).set(ZERO_HOUR).toJSDate();
    const before = new Date();

    this.state = {
      idBoard,
      actions: null,
      since,
      before,
      token: null,
    };
  }

  componentDidMount() {
    return t.get('member', 'private', 'token').then((token) => {
      this.setState({ token });
      this.loadBoardActions(this.state.idBoard, token, this.state.since, this.state.before);
    });
  }

  setSince(since) {
    if (!since) {
      return;
    }
    const { before } = this.state;
    if (before < since) {
      return;
    }
    if (DateTime.fromJSDate(before).diff(DateTime.fromJSDate(since), 'days').days >= 32) {
      console.error('31 days is maximum range');
      return;
    }
    this.setState({ since });
    this.loadBoardActions(this.state.idBoard, this.state.token, since, this.state.before);
  }

  setBefore(before) {
    if (!before) {
      return;
    }
    const { since } = this.state;
    if (before < since) {
      return;
    }
    if (new Date() < before) {
      return;
    }
    if (DateTime.fromJSDate(before).diff(DateTime.fromJSDate(since), 'days').days >= 32) {
      console.error('31 days is maximum range');
      return;
    }
    this.setState({ before });
    this.loadBoardActions(this.state.idBoard, this.state.token, this.state.since, before);
  }

  loadBoard() {
    return Promise.all([
      t.board('id', 'name', 'members'),
      t.lists('id', 'name'),
      t.cards('id', 'name', 'due', 'dueComplete', 'dateLastActivity'),
    ]).then(([board, lists, cards]) => {
      board.cards = cards;
      board.lists = lists.map((l, i) => _.extend(l, { pos: i }));
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
        const inRange = _.filter(
          actions,
          (a) =>
            a.memberCreator != null &&
            new Date(a.date) > DateTime.local().minus({ days: 31 }).toJSDate()
        );

        if (inRange.length === reqData.limit) {
          // all in range, request another page worth
          this.loadBoardActions(
            idBoard,
            token,
            since,
            before,
            (pagedActions || []).concat(actions)
          );
          return;
        }

        const normalized = _.map((pagedActions || []).concat(inRange), (a) =>
          _.extend(a, {
            type: normalizeAction(a),
            doy: DateTime.fromJSDate(new Date(a.date)).set(ZERO_HOUR).toISO(),
          })
        );
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

  filteredActions(actions) {
    const { idTargetMember } = this.state;
    if (idTargetMember) {
      return _.filter(actions, ['idMemberCreator', idTargetMember]);
    }
    return actions || [];
  }

  render() {
    const { before, since, board, idTargetMember } = this.state;
    if (!this.state.actions || !board) {
      return <p>Loading activity on the board...</p>;
    }

    const actions = this.state.actions.normalized;
    const { byType, byCreator } = this.state.actions;
    return (
      <div className="App">
        <div className="range-selector">
          <label htmlFor="since-picker">From: </label>
          <DatePicker
            id="since-picker"
            selected={since}
            onChange={(date) => this.setSince(date)}
            selectsStart
            startDate={since}
            endDate={before}
            minDate={DateTime.fromJSDate(before).minus({ days: 31 }).toJSDate()}
            maxDate={DateTime.fromJSDate(before).minus({ days: 1 }).toJSDate()}
          />
          <label htmlFor="before-picker">To: </label>
          <DatePicker
            id="before-picker"
            selected={before}
            onChange={(date) => this.setBefore(date)}
            selectsEnd
            startDate={since}
            endDate={before}
            maxDate={new Date()}
            minDate={since}
          />
        </div>

        <div className="member-selector">
          <h3>View By Member</h3>
          <Select
            className="member-select"
            isClearable
            isSearchable
            options={board.members.map((m) => ({
              value: m.id,
              label: m.fullName,
            }))}
            onChange={(selectedMember) =>
              this.setState({ idTargetMember: (selectedMember || {}).value })
            }
          />
        </div>

        <Summary
          actions={this.filteredActions(actions || [])}
          actionsByCreator={idTargetMember ? _.pick(byCreator, [idTargetMember]) : byCreator}
          board={board}
          since={since}
          before={before}
        />

        <hr />

        {!idTargetMember && (
          <div>
            <MostActiveMembers
              actions={actions || []}
              actionsByCreator={byCreator}
              board={board}
              since={since}
              before={before}
            />
            <hr />
          </div>
        )}

        <RadarActivity
          cardCreateActions={this.filteredActions(
            (byType.createCard || []).concat(byType.emailCard || []).concat(byType.copyCard || [])
          )}
          archiveCardActions={this.filteredActions(byType['updateCard:closed'])}
          lists={board.lists}
        />

        <hr />

        <BoardSankey
          cardMoveActions={this.filteredActions(byType['updateCard:idList'])}
          lists={board.lists}
        />

        <hr />

        {!idTargetMember && (
          <div>
            <MostMentionedMembers
              commentCardActions={byType.commentCard || []}
              boardMembers={board.members}
            />
            <hr />

            <NewBoardMembers addMemberToBoardActions={byType.addMemberToBoard || []} />
            <hr />
          </div>
        )}

        <MostActiveCards
          actions={this.filteredActions(actions || [])}
          since={since}
          before={before}
        />

        <hr />

        <DueComplete
          dueCompleteActions={this.filteredActions(byType['updateCard:dueComplete'] || [])}
        />
      </div>
    );
  }
}

export default Board;
