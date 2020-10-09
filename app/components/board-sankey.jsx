import _ from 'lodash';
import React from 'react';
import {
  Layer,
  Rectangle,
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from 'recharts';
import colorPalette from '../data/colors';

const SankeyNode = ({ x, y, width, height, index, payload, containerWidth }) => {
  const isOut = x + width + 6 > containerWidth;
  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.fill}
        fillOpacity="1"
      />
      <text
        textAnchor={isOut ? 'end' : 'start'}
        x={isOut ? x - 6 : x + width + 6}
        y={y + (height / 2) + 4}
        fontSize="12"
        stroke="#17394D"
      >
        {`${payload.name} - ${payload.value}`}
      </text>
    </Layer>
  );
};

export default function ({ cardMoveActions, lists }) {
  if (cardMoveActions.length === 0) {
    return (
      <div>
        <h3>Card Movement</h3>
        <p>No cards moved in the selected period.</p>
      </div>
    );
  }

  const beforeLists = {};
  const afterLists = {};
  const links = {};
  const colors = {};
  let iColor = 0;
  _.forEach(cardMoveActions, (cma) => {
    const { listBefore, listAfter } = cma.data;
    if (!colors[listBefore.id]) {
      colors[listBefore.id] = colorPalette[iColor];
      iColor += 1;
    }
    if (!beforeLists[listBefore.id]) {
      beforeLists[listBefore.id] = {
        fill: colors[listBefore.id],
        id: listBefore.id,
        name: listBefore.name,
        before: true,
        pos: _.get(_.find(lists, ['id', listBefore.id]), 'pos', 999),
      };
    }
    if (!colors[listAfter.id]) {
      colors[listAfter.id] = colorPalette[iColor];
      iColor += 1;
    }
    if (!afterLists[listAfter.id]) {
      afterLists[listAfter.id] = {
        fill: colors[listAfter.id],
        id: listAfter.id,
        name: listAfter.name,
        after: true,
      };
    }
    const key = listBefore.id.concat(listAfter.id);
    if (!links[key]) {
      links[key] = { source: listBefore.id, target: listAfter.id, value: 0 };
    }
    links[key].value += 1;
  });

  const orderedOrigins = _.sortBy(_.values(beforeLists), ['pos', 'name']);
  const nodes = orderedOrigins.concat(_.values(afterLists));

  const data = {
    nodes: nodes.map((n) => ({ name: n.name, fill: n.fill })),
    links: _.values(links).map((l) => ({
      source: _.findIndex(nodes, (n) => n.before && n.id === l.source),
      target: _.findIndex(nodes, (n) => n.after && n.id === l.target),
      value: l.value,
    })),
  };

  const targetHeight = Math.max(
    56,
    Math.max(_.keys(beforeLists).length, _.keys(afterLists).length) * 40,
  );

  return (
    <div>
      <h3>Card Movement</h3>
      <ResponsiveContainer width="100%" height={targetHeight}>
        <Sankey
          width={730}
          height={targetHeight}
          data={data}
          node={<SankeyNode containerWidth={730} />}
          nodePadding={12}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}
