import axios from 'axios';

import { PagedLinks, PagedMetaData } from './api';

export interface ProviderAuthentication {
  uuid?: string;
  provider_resource_name: string;
}

export interface ProviderBillingSource {
  uuid?: string;
  bucket: string;
}

export interface ProviderCreatedBy {
  uuid?: string;
  username?: string;
  email?: string;
}

export interface ProviderCustomer {
  uuid?: string;
  name?: string;
  owner?: ProviderCreatedBy;
  date_created?: string;
}

export interface ProviderCostModel {
  name: string;
  uuid: string;
}

export interface Provider {
  active?: boolean;
  authentication?: ProviderAuthentication;
  billing_source?: ProviderBillingSource;
  created_by?: ProviderCreatedBy;
  created_timestamp?: Date;
  cost_models?: ProviderCostModel[];
  current_month_data?: boolean;
  customer?: ProviderCustomer;
  name?: string;
  type?: string;
  uuid?: string;
}

export interface Providers {
  meta: PagedMetaData;
  links?: PagedLinks;
  data: Provider[];
}

// eslint-disable-next-line no-shadow
export const enum ProviderType {
  aws = 'aws',
  azure = 'azure',
  gcp = 'gcp',
  ibm = 'gcp', // Todo: update to use ibm backend apis when they become available
  ocp = 'ocp',
}

export function fetchProviders(query: string) {
  const insights = (window as any).insights;
  const queryString = query ? `?${query}` : '';
  if (insights && insights.chrome && insights.chrome.auth && insights.chrome.auth.getUser) {
    return insights.chrome.auth.getUser().then(() => {
      return axios.get<Providers>(`sources/${queryString}`);
    });
  } else {
    return axios.get<Providers>(`sources/${queryString}`);
  }
}
