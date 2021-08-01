import React, { FunctionComponent } from 'react';

type Props = {
  header: string;
  tableDataDetails?: Array<Record<string, string>>;
};

const QualityTable: FunctionComponent<Props> = ({ header }: Props) => {
  return (
    <div
      className="tw-flex tw-flex-col tw-relative"
      data-testid="quality-table-container">
      <div className="tw-flex tw-items-center tw-border-b tw-py-1 tw-px-3">
        <h6
          className="tw-flex tw-flex-1 tw-leading-8 tw-m-0 tw-font-medium"
          data-testid="quality-table-header">
          {header}
        </h6>
      </div>
      <div className="tw-flex tw-flex-col tw-px-3 tw-pt-2">
        <div className="tw-grid tw-grid-cols-3 tw-gap-x-4 tw-gap-y-2">
          <div className="tw-text-sm" data-testid="quality-table-data-key">
            Freshness:
          </div>
          <div className="tw-col-span-2">
            <span
              className="quatily-tile tw-mr-2"
              data-testid="quality-table-data-value">
              &nbsp;
            </span>{' '}
            June 21, 2020 05:00 AM
          </div>
          <div className="tw-text-sm" data-testid="quality-table-data-key">
            Completeness:
          </div>
          <div className="tw-col-span-2">
            <span
              className="quatily-tile tw-mr-2"
              data-testid="quality-table-data-value">
              &nbsp;
            </span>{' '}
            June 21, 2020 05:30 AM
          </div>
          <div className="tw-text-sm" data-testid="quality-table-data-key">
            Duplicates:
          </div>
          <div className="tw-col-span-2">
            <span
              className="quatily-tile tw-mr-2"
              data-testid="quality-table-data-value">
              &nbsp;
            </span>{' '}
            June 21, 2020 05:45 AM
          </div>
        </div>
        {/* {tableDataDetails.map((tableData, index) => {
          return (
            <div key={index} className="tw-flex">
              <div className="tw-flex-1" data-testid="quality-table-data-key">
                {tableData.key}
              </div>
              <div className="tw-flex-1" data-testid="quality-table-data-value">
                {tableData.value}
              </div>
            </div>
          );
        })} */}
      </div>
    </div>
  );
};

export default QualityTable;
