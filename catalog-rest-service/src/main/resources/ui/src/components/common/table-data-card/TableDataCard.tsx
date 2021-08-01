import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { getDatasetDetailsPath } from '../../../constants/constants';
import { getBadgeName, getUsagePercentile } from '../../../utils/TableUtils';
import TableDataCardBody from './TableDataCardBody';

type Props = {
  name: string;
  owner?: string;
  description?: string;
  tableType?: string;
  tier?: string;
  usage?: number;
  service?: string;
  fullyQualifiedName: string;
  tags?: string[];
};

const TableDataCard: FunctionComponent<Props> = ({
  name,
  owner = '--',
  description,
  tableType,
  tier = 'No Tier',
  usage,
  service,
  fullyQualifiedName,
  tags,
}: Props) => {
  const percentile = getUsagePercentile(usage || 0);
  const badgeName = getBadgeName(tableType);
  const OtherDetails = [
    { key: 'Owner', value: owner },
    { key: 'Service', value: service },
    { key: 'Usage', value: percentile },
    { key: 'Tier', value: tier },
  ];

  return (
    <div className="tw-bg-white tw-p-3 tw-border tw-border-gray-200 tw-rounded-md">
      <div>
        <h6 className="tw-flex tw-items-center tw-m-0 tw-heading">
          <Link to={getDatasetDetailsPath(fullyQualifiedName)}>
            <button className="tw-text-grey-body tw-font-medium">
              {name + ' '}
            </button>
          </Link>
          <span
            className={
              'tw-ml-2 tw-text-xs tw-uppercase tw-tracking-widest tw-rounded tw-px-2 tw-py-1 badge-' +
              badgeName
            }
            data-testid="badge">
            {badgeName}
          </span>
        </h6>
      </div>
      <div className="tw-pt-2">
        <TableDataCardBody
          description={description || 'No description'}
          extraInfo={OtherDetails}
          tags={[...new Set(tags)]}
        />
      </div>
    </div>
  );
};

export default TableDataCard;
