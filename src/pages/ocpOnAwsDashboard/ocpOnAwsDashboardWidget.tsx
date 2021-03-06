import { Tab, Tabs } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import { getQuery } from 'api/ocpOnAwsQuery';
import { OcpOnAwsReport, OcpOnAwsReportType } from 'api/ocpOnAwsReports';
import { transformOcpOnAwsReport } from 'components/charts/commonChart/chartUtils';
import {
  OcpOnAwsReportSummary,
  OcpOnAwsReportSummaryAlt,
  OcpOnAwsReportSummaryDetails,
  OcpOnAwsReportSummaryItem,
  OcpOnAwsReportSummaryItems,
  OcpOnAwsReportSummaryTrend,
  OcpOnAwsReportSummaryUsage,
} from 'components/reports/ocpOnAwsReportSummary';
import formatDate from 'date-fns/format';
import getDate from 'date-fns/get_date';
import getMonth from 'date-fns/get_month';
import getYear from 'date-fns/get_year';
import startOfMonth from 'date-fns/start_of_month';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createMapStateToProps } from 'store/common';
import {
  ocpOnAwsDashboardActions,
  ocpOnAwsDashboardSelectors,
  OcpOnAwsDashboardTab,
  OcpOnAwsDashboardWidget as OcpOnAwsDashboardWidgetStatic,
} from 'store/ocpOnAwsDashboard';
import { ocpOnAwsReportsSelectors } from 'store/ocpOnAwsReports';
import { formatValue, unitLookupKey } from 'utils/formatValue';
import { GetComputedOcpOnAwsReportItemsParams } from 'utils/getComputedOcpOnAwsReportItems';
import { styles } from './ocpOnAwsDashboardWidget.styles';

interface OcpOnAwsDashboardWidgetOwnProps {
  widgetId: number;
}

interface OcpOnAwsDashboardWidgetStateProps
  extends OcpOnAwsDashboardWidgetStatic {
  currentQuery: string;
  currentReport: OcpOnAwsReport;
  currentReportFetchStatus: number;
  previousQuery: string;
  previousReport: OcpOnAwsReport;
  tabsQuery: string;
  tabsReport: OcpOnAwsReport;
  tabsReportFetchStatus: number;
}

interface OcpOnAwsDashboardWidgetDispatchProps {
  fetchReports: typeof ocpOnAwsDashboardActions.fetchWidgetReports;
  updateTab: typeof ocpOnAwsDashboardActions.changeWidgetTab;
}

type OcpOnAwsDashboardWidgetProps = OcpOnAwsDashboardWidgetOwnProps &
  OcpOnAwsDashboardWidgetStateProps &
  OcpOnAwsDashboardWidgetDispatchProps &
  InjectedTranslateProps;

export const getIdKeyForTab = (
  tab: OcpOnAwsDashboardTab
): GetComputedOcpOnAwsReportItemsParams['idKey'] => {
  switch (tab) {
    case OcpOnAwsDashboardTab.clusters:
      return 'cluster';
    case OcpOnAwsDashboardTab.nodes:
      return 'node';
    case OcpOnAwsDashboardTab.projects:
      return 'project';
  }
};

class OcpOnAwsDashboardWidgetBase extends React.Component<
  OcpOnAwsDashboardWidgetProps
> {
  public state = {
    activeTabKey: 0,
  };

  public componentDidMount() {
    const { availableTabs, fetchReports, id, updateTab, widgetId } = this.props;
    if (availableTabs) {
      updateTab(id, availableTabs[0]);
    }
    fetchReports(widgetId);
  }

  private buildDetailsLink = (tab: OcpOnAwsDashboardTab) => {
    const currentTab = getIdKeyForTab(tab);
    return `/ocp-on-aws?${getQuery({
      group_by: {
        [currentTab]: '*',
      },
      order_by: { cost: 'desc' },
    })}`;
  };

  private getChart = (height: number) => {
    const { currentReport, previousReport, reportType, t, trend } = this.props;

    const costReportType =
      reportType === OcpOnAwsReportType.cost ||
      reportType === OcpOnAwsReportType.database ||
      reportType === OcpOnAwsReportType.network;
    const reportItem = costReportType ? 'infrastructureCost' : 'usage';
    const currentUsageData = transformOcpOnAwsReport(
      currentReport,
      trend.type,
      'date',
      reportItem
    );
    const previousUsageData = transformOcpOnAwsReport(
      previousReport,
      trend.type,
      'date',
      reportItem
    );
    const currentRequestData =
      reportType !== OcpOnAwsReportType.cost
        ? transformOcpOnAwsReport(currentReport, trend.type, 'date', 'request')
        : undefined;
    const previousRequestData =
      reportType !== OcpOnAwsReportType.cost
        ? transformOcpOnAwsReport(previousReport, trend.type, 'date', 'request')
        : undefined;
    const units = this.getUnits();

    return (
      <>
        {Boolean(
          reportType === OcpOnAwsReportType.cost ||
            reportType === OcpOnAwsReportType.database ||
            reportType === OcpOnAwsReportType.instanceType ||
            reportType === OcpOnAwsReportType.network ||
            reportType === OcpOnAwsReportType.storage
        ) ? (
          <OcpOnAwsReportSummaryTrend
            currentData={currentUsageData}
            formatDatumValue={formatValue}
            formatDatumOptions={trend.formatOptions}
            height={height}
            previousData={previousUsageData}
            title={t(trend.titleKey, {
              units: t(`units.${units}`),
            })}
          />
        ) : (
          <OcpOnAwsReportSummaryUsage
            currentRequestData={currentRequestData}
            currentUsageData={currentUsageData}
            formatDatumValue={formatValue}
            formatDatumOptions={trend.formatOptions}
            height={height}
            previousRequestData={previousRequestData}
            previousUsageData={previousUsageData}
            title={t(trend.titleKey, {
              units: t(`units.${units}`),
            })}
          />
        )}
      </>
    );
  };

  private getDetails = () => {
    const { currentReport, details, reportType } = this.props;
    const units = this.getUnits();
    return (
      <OcpOnAwsReportSummaryDetails
        costLabel={this.getDetailsLabel(details.costKey, units)}
        formatOptions={details.formatOptions}
        formatValue={formatValue}
        report={currentReport}
        reportType={reportType}
        requestLabel={this.getDetailsLabel(details.requestKey, units)}
        showUnits={details.showUnits}
        usageLabel={this.getDetailsLabel(details.usageKey, units)}
      />
    );
  };

  private getDetailsLabel = (key: string, units: string) => {
    const { t } = this.props;
    return key ? t(key, { units: t(`units.${units}`) }) : undefined;
  };

  private getDetailsLink = () => {
    const { currentTab, isDetailsLink } = this.props;
    return (
      isDetailsLink && (
        <Link
          to={this.buildDetailsLink(currentTab)}
          onClick={this.handleInsightsNavClick}
        >
          {this.getDetailsLinkTitle(currentTab)}
        </Link>
      )
    );
  };

  private getDetailsLinkTitle = (tab: OcpOnAwsDashboardTab) => {
    const { t } = this.props;
    const key = getIdKeyForTab(tab) || '';

    return t('group_by.all', { groupBy: key });
  };

  private getHorizontalLayout = () => {
    const { currentReportFetchStatus } = this.props;
    return (
      <OcpOnAwsReportSummaryAlt
        detailsLink={this.getDetailsLink()}
        status={currentReportFetchStatus}
        subTitle={this.getSubTitle()}
        subTitleTooltip={this.getSubTitleTooltip()}
        tabs={this.getTabs()}
        title={this.getTitle()}
      >
        {this.getDetails()}
        {this.getChart(180)}
      </OcpOnAwsReportSummaryAlt>
    );
  };

  private getSubTitle = () => {
    const { t } = this.props;

    const today = new Date();
    const month = getMonth(today);

    return t('ocp_on_aws_dashboard.widget_subtitle', { month });
  };

  private getSubTitleTooltip = () => {
    const { t } = this.props;

    const today = new Date();
    const month = getMonth(today);
    const endDate = formatDate(today, 'DD');
    const startDate = formatDate(startOfMonth(today), 'DD');
    const year = getYear(today);

    return t('ocp_on_aws_dashboard.widget_subtitle_tooltip', {
      count: getDate(today),
      endDate,
      month,
      startDate,
      year,
    });
  };

  private getTab = (tab: OcpOnAwsDashboardTab, index: number) => {
    const { tabsReport, tabsReportFetchStatus } = this.props;
    const currentTab = getIdKeyForTab(tab);

    return (
      <Tab
        eventKey={index}
        key={`${getIdKeyForTab(tab)}-tab`}
        title={this.getTabTitle(tab)}
      >
        <div className={css(styles.tabItems)}>
          <OcpOnAwsReportSummaryItems
            idKey={currentTab}
            key={`${currentTab}-items`}
            report={tabsReport}
            status={tabsReportFetchStatus}
          >
            {({ items }) =>
              items.map(reportItem => this.getTabItem(tab, reportItem))
            }
          </OcpOnAwsReportSummaryItems>
        </div>
      </Tab>
    );
  };

  private getTabItem = (tab: OcpOnAwsDashboardTab, reportItem) => {
    const { availableTabs, reportType, tabsReport, topItems } = this.props;
    const { activeTabKey } = this.state;

    const currentTab = getIdKeyForTab(tab);
    const activeTab = getIdKeyForTab(availableTabs[activeTabKey]);

    const isCostReport =
      reportType === OcpOnAwsReportType.cost ||
      reportType === OcpOnAwsReportType.database ||
      reportType === OcpOnAwsReportType.network;

    if (activeTab === currentTab) {
      return (
        <OcpOnAwsReportSummaryItem
          key={`${reportItem.id}-item`}
          formatOptions={topItems.formatOptions}
          formatValue={formatValue}
          label={reportItem.label ? reportItem.label.toString() : ''}
          totalValue={
            isCostReport
              ? tabsReport.meta.total.infrastructure_cost.value
              : tabsReport.meta.total.usage.value
          }
          units={reportItem.units}
          value={
            isCostReport ? reportItem.infrastructureCost : reportItem.usage
          }
        />
      );
    } else {
      return null;
    }
  };

  private getTabs = () => {
    const { availableTabs } = this.props;

    if (availableTabs) {
      return (
        <Tabs
          isFilled
          activeKey={this.state.activeTabKey}
          onSelect={this.handleTabClick}
        >
          {availableTabs.map((tab, index) => this.getTab(tab, index))}
        </Tabs>
      );
    } else {
      return null;
    }
  };

  private getTabTitle = (tab: OcpOnAwsDashboardTab) => {
    const { t } = this.props;
    const key = getIdKeyForTab(tab) || '';

    return t('group_by.top', { groupBy: key });
  };

  private getTitle = () => {
    const { t, titleKey } = this.props;

    const today = new Date();
    const month = getMonth(today);
    const endDate = formatDate(today, 'Do');
    const startDate = formatDate(startOfMonth(today), 'Do');

    return t(titleKey, { endDate, month, startDate });
  };

  private getUnits = () => {
    const { currentReport, reportType } = this.props;

    let units = '';
    if (currentReport && currentReport.meta && currentReport.meta.total) {
      if (
        reportType === OcpOnAwsReportType.cost ||
        reportType === OcpOnAwsReportType.database ||
        reportType === OcpOnAwsReportType.network
      ) {
        units = currentReport.meta.total.infrastructure_cost
          ? unitLookupKey(currentReport.meta.total.infrastructure_cost.units)
          : '';
      } else {
        units = currentReport.meta.total.usage
          ? unitLookupKey(currentReport.meta.total.usage.units)
          : '';
      }
    }
    return units;
  };

  private getVerticalLayout = () => {
    const { currentReportFetchStatus } = this.props;
    return (
      <OcpOnAwsReportSummary
        detailsLink={this.getDetailsLink()}
        status={currentReportFetchStatus}
        subTitle={this.getSubTitle()}
        subTitleTooltip={this.getSubTitleTooltip()}
        title={this.getTitle()}
      >
        {this.getDetails()}
        {this.getChart(75)}
        {this.getTabs()}
      </OcpOnAwsReportSummary>
    );
  };

  private handleInsightsNavClick = () => {
    insights.chrome.appNavClick({ id: 'ocp-on-aws', secondaryNav: true });
  };

  private handleTabClick = (event, tabIndex) => {
    const { availableTabs, id, updateTab } = this.props;
    const tab = availableTabs[tabIndex];

    updateTab(id, tab);
    this.setState({
      activeTabKey: tabIndex,
    });
  };

  public render() {
    const { isHorizontal = false } = this.props;
    return Boolean(isHorizontal)
      ? this.getHorizontalLayout()
      : this.getVerticalLayout();
  }
}

const mapStateToProps = createMapStateToProps<
  OcpOnAwsDashboardWidgetOwnProps,
  OcpOnAwsDashboardWidgetStateProps
>((state, { widgetId }) => {
  const widget = ocpOnAwsDashboardSelectors.selectWidget(state, widgetId);
  const queries = ocpOnAwsDashboardSelectors.selectWidgetQueries(
    state,
    widgetId
  );
  return {
    ...widget,
    currentQuery: queries.current,
    previousQuery: queries.previous,
    tabsQuery: queries.tabs,
    currentReport: ocpOnAwsReportsSelectors.selectReport(
      state,
      widget.reportType,
      queries.current
    ),
    currentReportFetchStatus: ocpOnAwsReportsSelectors.selectReportFetchStatus(
      state,
      widget.reportType,
      queries.current
    ),
    previousReport: ocpOnAwsReportsSelectors.selectReport(
      state,
      widget.reportType,
      queries.previous
    ),
    tabsReport: ocpOnAwsReportsSelectors.selectReport(
      state,
      widget.reportType,
      queries.tabs
    ),
    tabsReportFetchStatus: ocpOnAwsReportsSelectors.selectReportFetchStatus(
      state,
      widget.reportType,
      queries.tabs
    ),
  };
});

const mapDispatchToProps: OcpOnAwsDashboardWidgetDispatchProps = {
  fetchReports: ocpOnAwsDashboardActions.fetchWidgetReports,
  updateTab: ocpOnAwsDashboardActions.changeWidgetTab,
};

const OcpOnAwsDashboardWidget = translate()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OcpOnAwsDashboardWidgetBase)
);

export {
  OcpOnAwsDashboardWidget,
  OcpOnAwsDashboardWidgetBase,
  OcpOnAwsDashboardWidgetProps,
};
