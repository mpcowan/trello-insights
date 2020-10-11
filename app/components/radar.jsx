import _ from 'lodash';
import React from 'react';
import Select from 'react-select';
import {
  Radar,
  RadarChart,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';

class RadarActivity extends React.Component {
  constructor(props) {
    super(props);
    this.state = { facet: { label: 'Created Cards', value: 'created' } };
  }

  render() {
    const { cardCreateActions, archiveCardActions, lists } = this.props;
    const { facet } = this.state;
    const byIdList = {};
    if (cardCreateActions.length === 0 && archiveCardActions.length === 0) {
      return (
        <div className="radar">
          <h3>Activity In Lists</h3>
          <p>No cards created or archived in the selected period.</p>
        </div>
      );
    }

    _.forEach(cardCreateActions, (createAction) => {
      const { list } = createAction.data;
      if (!byIdList[list.id]) {
        byIdList[list.id] = {
          id: list.id,
          name: list.name,
          created: 0,
          archived: 0,
        };
      }
      byIdList[list.id].created += 1;
      if (!byIdList[list.id].name) {
        const l = _.find(lists, ['id', list.id]);
        if (l) {
          byIdList[list.id].name = l.name;
        }
      }
    });
    _.forEach(archiveCardActions, (archiveAction) => {
      const { list } = archiveAction.data;
      if (!byIdList[list.id]) {
        byIdList[list.id] = {
          id: list.id,
          name: list.name,
          created: 0,
          archived: 0,
        };
      }
      byIdList[list.id].archived += 1;
      if (!byIdList[list.id].name) {
        const l = _.find(lists, ['id', list.id]);
        if (l) {
          byIdList[list.id].name = l.name;
        }
      }
    });
    // goal is to generally hit 6 lists minimum
    if (_.keys(byIdList).length < 6) {
      let i = 0;
      while (_.keys(byIdList).length < 6 && i < lists.length) {
        const list = lists[i];
        if (!byIdList[list.id]) {
          byIdList[list.id] = {
            id: list.id,
            name: list.name,
            created: 0,
            archived: 0,
          };
        }
        i += 1;
      }
    }
    const data = _.values(byIdList);
    const views = [
      { label: 'Created Cards', value: 'created' },
      { label: 'Archived Cards', value: 'archived' },
    ];

    return (
      <div className="radar">
        <h3>Activity In Lists</h3>
        <Select
          className="facet-selector"
          options={views}
          onChange={(s) => this.setState({ facet: s || views[0] })}
          value={facet || 'created'}
        />
        <ResponsiveContainer width="100%" height={480}>
          <RadarChart cx={300} cy={250} outerRadius={150} width={762} height={480} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Tooltip />
            <Radar
              name={facet.label}
              dataKey={facet.value}
              stroke="#0082A0"
              fill="#00AECC"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default RadarActivity;
