import { FormatedTableData } from 'Models';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';
import { PAGE_SIZE } from '../../constants/constants';
import { pluralize } from '../../utils/CommonUtils';
import ErrorPlaceHolder from '../common/error-with-placeholder/ErrorPlaceHolder';
import TableDataCard from '../common/table-data-card/TableDataCard';
import PageContainer from '../containers/PageContainer';
import Onboarding from '../onboarding/Onboarding';
import Pagination from '../Pagination';
type SearchedDataProp = {
  children?: ReactNode;
  data: Array<FormatedTableData>;
  currentPage: number;
  paginate: (value: number) => void;
  totalValue: number;
  fetchLeftPanel?: () => ReactNode;
  showResultCount?: boolean;
  searchText?: string;
  showOnboardingTemplate?: boolean;
};
const SearchedData: React.FC<SearchedDataProp> = ({
  children,
  data,
  currentPage,
  paginate,
  showResultCount = false,
  showOnboardingTemplate = false,
  searchText,
  totalValue,
  fetchLeftPanel,
}) => {
  return (
    <>
      {totalValue > 0 || showOnboardingTemplate ? (
        <PageContainer leftPanelContent={fetchLeftPanel && fetchLeftPanel()}>
          <div className="container-fluid" data-testid="fluid-container">
            {children}
            {showResultCount && searchText ? (
              <div className="tw-mb-1">{pluralize(totalValue, 'result')}</div>
            ) : null}
            {data.length > 0 ? (
              <div className="tw-grid tw-grid-rows-1 tw-grid-cols-1">
                {data.map((table, index) => (
                  <div className="tw-mb-3" key={index}>
                    <TableDataCard
                      description={table.description}
                      fullyQualifiedName={table.fullyQualifiedName}
                      name={table.name}
                      owner={table.tableEntity.owner?.name}
                      service={table.service || '--'}
                      tableType={table.tableType}
                      tags={table.tags}
                      tier={table.tier?.split('.')[1]}
                      usage={table.weeklyStats}
                    />
                  </div>
                ))}

                {totalValue > 0 && data.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    paginate={paginate}
                    sizePerPage={PAGE_SIZE}
                    totalNumberOfValues={totalValue}
                  />
                )}
              </div>
            ) : (
              <Onboarding />
            )}
          </div>
        </PageContainer>
      ) : (
        <ErrorPlaceHolder />
      )}
    </>
  );
};

SearchedData.propTypes = {
  children: PropTypes.element,
  data: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  paginate: PropTypes.func.isRequired,
  showResultCount: PropTypes.bool,
  showOnboardingTemplate: PropTypes.bool,
  searchText: PropTypes.string,
  totalValue: PropTypes.number.isRequired,
  fetchLeftPanel: PropTypes.func,
};

export default SearchedData;
