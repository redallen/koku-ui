import { AzureQuery, getQuery } from 'api/azureQuery';
import { AzureReport, AzureReportType } from 'api/azureReports';
import { DetailsDataToolbar } from 'components/details/detailsDataToolbar';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { azureReportsActions, azureReportsSelectors } from 'store/azureReports';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { isEqual } from 'utils/equal';

interface DetailsToolbarOwnProps {
  isExportDisabled: boolean;
  groupBy: string;
  onExportClicked();
  onFilterAdded(filterType: string, filterValue: string);
  onFilterRemoved(filterType: string, filterValue?: string);
  pagination?: React.ReactNode;
  query?: AzureQuery;
  queryString?: string;
  report?: AzureReport;
}

interface DetailsToolbarStateProps {
  report?: AzureReport;
  reportFetchStatus?: FetchStatus;
}

interface DetailsToolbarDispatchProps {
  fetchReport?: typeof azureReportsActions.fetchReport;
}

type DetailsToolbarProps = DetailsToolbarOwnProps &
  DetailsToolbarStateProps &
  DetailsToolbarDispatchProps &
  InjectedTranslateProps;

const reportType = AzureReportType.tag;

export class DetailsToolbarBase extends React.Component<DetailsToolbarProps> {
  public componentDidMount() {
    const { fetchReport, queryString } = this.props;
    fetchReport(reportType, queryString);
  }

  public componentDidUpdate(prevProps: DetailsToolbarProps, prevState) {
    const { fetchReport, query, queryString } = this.props;
    if (query && !isEqual(query, prevProps.query)) {
      fetchReport(reportType, queryString);
    }
  }

  private getCategoryOptions = () => {
    const { t } = this.props;

    return [
      {
        label: t('filter_by.values.subscription_guid'),
        value: 'subscription_guid',
      },
      { label: t('filter_by.values.service_name'), value: 'service_name' },
      {
        label: t('filter_by.values.resource_location'),
        value: 'resource_location',
      },
      { label: t('filter_by.values.tag'), value: 'tag' },
    ];
  };

  public render() {
    const {
      groupBy,
      isExportDisabled,
      onExportClicked,
      onFilterAdded,
      onFilterRemoved,
      pagination,
      query,
      report,
    } = this.props;

    return (
      <DetailsDataToolbar
        categoryOptions={this.getCategoryOptions()}
        groupBy={groupBy}
        isExportDisabled={isExportDisabled}
        onExportClicked={onExportClicked}
        onFilterAdded={onFilterAdded}
        onFilterRemoved={onFilterRemoved}
        pagination={pagination}
        query={query}
        report={report}
        showExport
      />
    );
  }
}

const mapStateToProps = createMapStateToProps<
  DetailsToolbarOwnProps,
  DetailsToolbarStateProps
>(state => {
  const queryString = getQuery({
    filter: {
      resolution: 'monthly',
      time_scope_units: 'month',
      time_scope_value: -1,
    },
  });
  const report = azureReportsSelectors.selectReport(
    state,
    reportType,
    queryString
  );
  const reportFetchStatus = azureReportsSelectors.selectReportFetchStatus(
    state,
    reportType,
    queryString
  );
  return {
    queryString,
    report,
    reportFetchStatus,
  };
});

const mapDispatchToProps: DetailsToolbarDispatchProps = {
  fetchReport: azureReportsActions.fetchReport,
};

const DetailsToolbar = translate()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DetailsToolbarBase)
);

export { DetailsToolbar, DetailsToolbarProps };
