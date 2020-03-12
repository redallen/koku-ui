export const enum DashboardChartType {
  cost = 'cost',
  trend = 'trend',
  usage = 'usage',
}

export const enum DashboardPerspective {
  aws = 'aws',
  awsFiltered = 'aws_filtered',
  azure = 'azure',
  azureFiltered = 'azure_filtered',
  ocp = 'ocp',
  ocpCloud = 'ocp_cloud', // all filtered by OCP
  ocpUsage = 'ocp_usage',
  ocpSupplementary = 'ocp_supplementary',
}

export interface ValueFormatOptions {
  fractionDigits?: number;
}

export interface DashboardWidget {
  availableTabs?: any[];
  chartType?: DashboardChartType;
  currentTab: any;
  details: {
    costKey?: string /** i18n label key */;
    formatOptions: ValueFormatOptions;
    showUnits?: boolean;
    showUsageLegendLabel?: boolean;
    units?: string;
    usageFormatOptions?: ValueFormatOptions;
    usageKey?: string /** i18n label key */;
  };
  filter?: {
    limit?: number;
    service?: string;
    service_name?: string;
  };
  id: number;
  isDetailsLink?: boolean;
  isHorizontal?: boolean;
  isUsageFirst?: boolean;
  perspective?: DashboardPerspective;
  reportType: any;
  /** i18n key for the title. passed { startDate, endDate, month, time } */
  titleKey: string;
  tabsFilter?: {
    limit?: number;
    service?: string;
    service_name?: string;
  };
  trend: {
    titleKey: string;
    type: number;
    formatOptions: ValueFormatOptions;
  };
  topItems: {
    formatOptions: {};
  };
}
