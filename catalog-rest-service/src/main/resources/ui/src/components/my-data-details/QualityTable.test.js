import { getAllByTestId, getByTestId, render } from '@testing-library/react';
import React from 'react';
import QualityTable from './QualityTable';

describe('Test QualityTable Component', () => {
  it('Renders the proper header sent to the component', () => {
    const { container } = render(
      <QualityTable
        header="Quality"
        tableDataDetails={[
          { key: 'Freshness', value: '4h 2m' },
          { key: 'SLA', value: '2.5 hr / 3 hr' },
          { key: 'Availablity', value: '4/5 database' },
          { key: 'Integrity tests', value: '11/21 with issues' },
        ]}
      />
    );
    const header = getByTestId(container, 'quality-table-header');

    expect(header.textContent).toBe('Quality');
  });

  it('Renders the proper table data sent to the component', () => {
    const { container } = render(
      <QualityTable
        header="Quality"
        tableDataDetails={[
          { key: 'Freshness', value: '4h 2m' },
          { key: 'SLA', value: '2.5 hr / 3 hr' },
          { key: 'Availablity', value: '4/5 database' },
          { key: 'Integrity tests', value: '11/21 with issues' },
        ]}
      />
    );
    const tableKeys = getAllByTestId(container, 'quality-table-data-key');

    expect(tableKeys.length).toBe(3);

    // expect(tableKeys.map((tableKey) => tableKey.textContent)).toStrictEqual([
    //   'Freshness',
    //   'SLA',
    //   'Availablity',
    //   'Integrity tests',
    // ]);
    const tableValues = getAllByTestId(container, 'quality-table-data-value');

    expect(tableValues.length).toBe(3);
    // expect(
    //   tableValues.map((tableValue) => tableValue.textContent)
    // ).toStrictEqual([
    //   '4h 2m',
    //   '2.5 hr / 3 hr',
    //   '4/5 database',
    //   '11/21 with issues',
    // ]);
  });
});
