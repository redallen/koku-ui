import { ChartPie, ChartThemeColor } from '@patternfly/react-charts';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/components/Skeleton';
import { Report } from 'api/reports/report';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { FetchStatus } from 'store/common';
import { reportActions } from 'store/reports';
import { formatValue } from 'utils/formatValue';
import { chartStyles, styles } from './costBreakdownChart.styles';

interface CostBreakdownChartOwnProps {
  report: Report;
}

interface CostBreakdownChartStateProps {
  report?: Report;
  reportFetchStatus?: FetchStatus;
}

interface CostBreakdownChartDispatchProps {
  fetchReport?: typeof reportActions.fetchReport;
}

interface CostBreakdownChartState {
  width: number;
}

type CostBreakdownChartProps = CostBreakdownChartOwnProps &
  CostBreakdownChartStateProps &
  CostBreakdownChartDispatchProps &
  InjectedTranslateProps;

class CostBreakdownChartBase extends React.Component<CostBreakdownChartProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  public state: CostBreakdownChartState = {
    width: 0,
  };

  public componentDidMount() {
    setTimeout(() => {
      if (this.containerRef.current) {
        this.setState({ width: this.containerRef.current.clientWidth });
      }
      window.addEventListener('resize', this.handleResize);
    });
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  private getSkeleton = () => {
    return (
      <>
        <Skeleton style={styles.chartSkeleton} size={SkeletonSize.md} />
      </>
    );
  };

  private handleResize = () => {
    if (this.containerRef.current) {
      this.setState({ width: this.containerRef.current.clientWidth });
    }
  };

  public render() {
    const { report, reportFetchStatus, t } = this.props;
    const { width } = this.state;

    const hasCost =
      report && report.meta && report.meta.total && report.meta.total.cost;
    const hasMarkup = hasCost && report.meta.total.cost.markup;
    const hasRaw = hasCost && report.meta.total.cost.raw;
    const hasUsage = hasCost && report.meta.total.cost.usage;

    const markupUnits = hasMarkup ? report.meta.total.cost.markup.units : 'USD';
    const rawUnits = hasRaw ? report.meta.total.cost.raw.units : 'USD';
    const usageUnits = hasUsage ? report.meta.total.cost.usage.units : 'USD';

    const markupValue = hasMarkup ? report.meta.total.cost.markup.value : 0;
    const rawValue = hasRaw ? report.meta.total.cost.raw.value : 0;
    const usageValue = hasUsage ? report.meta.total.cost.usage.value : 0;

    const markup = formatValue(
      hasMarkup ? report.meta.total.cost.markup.value : 0,
      markupUnits
    );
    const raw = formatValue(
      hasRaw ? report.meta.total.cost.raw.value : 0,
      rawUnits
    );
    const usage = formatValue(
      hasUsage ? report.meta.total.cost.usage.value : 0,
      usageUnits
    );

    const markupLabel = t('breakdown.cost_breakdown.markup_label');
    const rawLabel = t('breakdown.cost_breakdown.raw_label');
    const usageLabel = t('breakdown.cost_breakdown.usage_label');

    return (
      <div ref={this.containerRef} style={{ height: chartStyles.chartHeight }}>
        {reportFetchStatus === FetchStatus.inProgress ? (
          this.getSkeleton()
        ) : (
          <ChartPie
            ariaDesc={t('breakdown.cost_breakdown.aria_desc')}
            ariaTitle={t('breakdown.cost_breakdown.aria_title')}
            constrainToVisibleArea
            data={[
              { x: markupLabel, y: markupValue, units: markupUnits },
              { x: rawLabel, y: rawValue, units: rawUnits },
              { x: usageLabel, y: usageValue, units: usageUnits },
            ]}
            height={chartStyles.chartHeight}
            labels={({ datum }) =>
              t('breakdown.cost_breakdown.tooltip', {
                name: datum.x,
                value: formatValue(datum.y, datum.units),
              })
            }
            legendData={[
              {
                name: t('breakdown.cost_breakdown.legend', {
                  name: markupLabel,
                  value: markup,
                }),
              },
              {
                name: t('breakdown.cost_breakdown.legend', {
                  name: rawLabel,
                  value: raw,
                }),
              },
              {
                name: t('breakdown.cost_breakdown.legend', {
                  name: usageLabel,
                  value: usage,
                }),
              },
            ]}
            legendOrientation="vertical"
            legendPosition="right"
            padding={{
              bottom: 20,
              left: 0,
              right: width - chartStyles.chartHeight, // Adjusted to accommodate legend
              top: 20,
            }}
            themeColor={ChartThemeColor.green}
            width={width}
          />
        )}
      </div>
    );
  }
}

const CostBreakdownChart = translate()(CostBreakdownChartBase);

export { CostBreakdownChart, CostBreakdownChartProps };
