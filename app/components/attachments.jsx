import _ from 'lodash';
import React from 'react';
import {
  CartesianGrid,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Stat from './stat';

export default function ({ cards }) {
  const attachments = _.chain(cards)
    .map((card) => card.attachments || [])
    .flatten()
    .value();

  const images = _.filter(attachments, (a) => a.previews.length > 0);
  const links = _.filter(attachments, (a) => a.previews.length === 0);
  const domains = _.chain(links)
    .map((link) => {
      let origin = '';
      try {
        const parsed = new URL(link.url);
        origin = parsed.host;
      } catch (err) {
        console.error(`Error parsing url: ${link.url}`);
      }
      return _.extend(link, { origin });
    })
    .groupBy('origin')
    .toPairs()
    .sortBy('1')
    .value()
    .reverse()
    .map(([domain, all]) => ({ domain, count: all.length }));

  const pluralize = attachments.length !== 1;

  return (
    <div>
      <h3>Attachments</h3>
      <p>
        There { pluralize ? 'are' : 'is' } <Stat val={attachments.length} /> attachment{ pluralize ? 's' : '' }.
      </p>

      { images.length > 0 &&
        <div>
          <h4>Images</h4>
          <div className="horizontal-scroll">
            {
              images.map((image) => (
                <div
                  key={image.id}
                  style={{
                    margin: '6px',
                    backgroundColor: '#D6DADC',
                    borderRadius: '4px',
                    position: 'relative',
                  }}
                >
                  <a
                    href={image.url}
                    target="_blank"
                    title={image.name}
                    rel="noopener noreferrer"
                    width={200}
                    height={133}
                  >
                    <img
                      alt={image.name}
                      src={
                        _.get(
                          _.chain(image.previews)
                          .filter((p) => p.scaled && p.height > 100)
                          .first()
                          .value(),
                          'url',
                          image.previews.reverse()[0].url
                        )
                      }
                      width={200}
                      height={133}
                      style={{ objectFit: 'scale-down' }}
                    />
                  </a>
                </div>
              ))
            }
          </div>

          <p />
        </div>
      }

      { links.length > 0 &&
        <div>
          <h4>Links</h4>
          <p>There are {links.length} attached links across {domains.length} sites.</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              width={762}
              height={200}
              data={domains}
              margin={{ top: 20, right: 30, left: 12, bottom: 112 }}
            >
              <XAxis dataKey="domain" interval={0} tick={{ angle: -40 }} textAnchor="end" />
              <YAxis />
              <CartesianGrid stroke="#CDD2D4" strokeDasharray="5 5" />
              <Tooltip />
              <Bar dataKey="count" stackId="a" fill="#61BD4F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      }
    </div>
  );
};
