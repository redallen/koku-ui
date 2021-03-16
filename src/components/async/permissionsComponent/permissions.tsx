import { getUserAccessQuery } from 'api/queries/userAccessQuery';
import { UserAccess, UserAccessType } from 'api/userAccess';
import { AxiosError } from 'axios';
import Loading from 'pages/state/loading';
import NotAuthorized from 'pages/state/notAuthorized';
import NotAvailable from 'pages/state/notAvailable';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { paths, routes } from 'routes';
import { createMapStateToProps, FetchStatus } from 'store/common';
import {
  allUserAccessQuery,
  gcpUserAccessQuery,
  ibmUserAccessQuery,
  userAccessActions,
  userAccessSelectors,
} from 'store/userAccess';

interface PermissionsOwnProps extends RouteComponentProps<void> {
  children?: React.ReactNode;
}

interface PermissionsStateProps {
  gcpUserAccess: UserAccess;
  gcpUserAccessError: AxiosError;
  gcpUserAccessFetchStatus: FetchStatus;
  gcpUserAccessQueryString: string;
  ibmUserAccess: UserAccess;
  ibmUserAccessError: AxiosError;
  ibmUserAccessFetchStatus: FetchStatus;
  ibmUserAccessQueryString: string;
  userAccess: UserAccess;
  userAccessError: AxiosError;
  userAccessFetchStatus: FetchStatus;
  userAccessQueryString: string;
}

interface PermissionsDispatchProps {
  fetchUserAccess: typeof userAccessActions.fetchUserAccess;
}

interface PermissionsState {
  // TBD...
}

type PermissionsProps = PermissionsOwnProps & PermissionsDispatchProps & PermissionsStateProps;

class PermissionsBase extends React.Component<PermissionsProps> {
  protected defaultState: PermissionsState = {
    // TBD...
  };
  public state: PermissionsState = { ...this.defaultState };

  public componentDidMount() {
    const { gcpUserAccessQueryString, ibmUserAccessQueryString, userAccessQueryString, fetchUserAccess } = this.props;

    fetchUserAccess(UserAccessType.all, userAccessQueryString);
    fetchUserAccess(UserAccessType.gcp, gcpUserAccessQueryString);
    fetchUserAccess(UserAccessType.ibm, ibmUserAccessQueryString);
  }

  private hasPermissions() {
    const { location, gcpUserAccess, ibmUserAccess, userAccess }: any = this.props;

    if (!userAccess) {
      return false;
    }

    const aws = userAccess && userAccess.data.find(d => d.type === UserAccessType.aws);
    const azure = userAccess && userAccess.data.find(d => d.type === UserAccessType.azure);
    const costModel = userAccess && userAccess.data.find(d => d.type === UserAccessType.cost_model);
    const gcp = gcpUserAccess && gcpUserAccess.data === true;
    const ibm = ibmUserAccess && ibmUserAccess.data === true;
    const ocp = userAccess && userAccess.data.find(d => d.type === UserAccessType.ocp);

    // cost models may include :uuid
    const _pathname = location.pathname.includes(paths.costModels) ? paths.costModels : location.pathname;
    const currRoute = routes.find(({ path }) => path.includes(_pathname));

    switch (currRoute.path) {
      case paths.explorer:
      case paths.overview:
        return (
          (aws && aws.access) ||
          (azure && azure.access) ||
          (costModel && costModel.access) ||
          gcp ||
          ibm ||
          (ocp && ocp.access)
        );
      case paths.awsDetails:
      case paths.awsDetailsBreakdown:
        return aws && aws.access;
      case paths.azureDetails:
      case paths.azureDetailsBreakdown:
        return azure && azure.access;
      case paths.costModels:
        return costModel && costModel.access;
      case paths.gcpDetails:
      case paths.gcpDetailsBreakdown:
        return gcp;
      case paths.ibmDetails:
      case paths.ibmDetailsBreakdown:
        return ibm;
      case paths.ocpDetails:
      case paths.ocpDetailsBreakdown:
        return ocp && ocp.access;
      default:
        return false;
    }
  }

  public render() {
    const { children = null, location, userAccess, userAccessFetchStatus, userAccessError } = this.props;

    if (userAccessFetchStatus === FetchStatus.inProgress) {
      return <Loading />;
    } else if (userAccessError) {
      return <NotAvailable />;
    } else if (userAccess && userAccessFetchStatus === FetchStatus.complete && this.hasPermissions()) {
      return children;
    }

    // Page access denied because user doesn't have RBAC permissions and is not an org admin
    return <NotAuthorized pathname={location.pathname} />;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapStateToProps = createMapStateToProps<PermissionsOwnProps, PermissionsStateProps>((state, props) => {
  const userAccessQueryString = getUserAccessQuery(allUserAccessQuery);
  const userAccess = userAccessSelectors.selectUserAccess(state, UserAccessType.all, userAccessQueryString);
  const userAccessError = userAccessSelectors.selectUserAccessError(state, UserAccessType.all, userAccessQueryString);
  const userAccessFetchStatus = userAccessSelectors.selectUserAccessFetchStatus(
    state,
    UserAccessType.all,
    userAccessQueryString
  );

  // Todo: temporarily request GCP separately with beta flag.
  const gcpUserAccessQueryString = getUserAccessQuery(gcpUserAccessQuery);
  const gcpUserAccess = userAccessSelectors.selectUserAccess(state, UserAccessType.gcp, gcpUserAccessQueryString);
  const gcpUserAccessError = userAccessSelectors.selectUserAccessError(
    state,
    UserAccessType.gcp,
    gcpUserAccessQueryString
  );
  const gcpUserAccessFetchStatus = userAccessSelectors.selectUserAccessFetchStatus(
    state,
    UserAccessType.gcp,
    gcpUserAccessQueryString
  );

  // Todo: temporarily request IBM separately with beta flag.
  const ibmUserAccessQueryString = getUserAccessQuery(ibmUserAccessQuery);
  const ibmUserAccess = userAccessSelectors.selectUserAccess(state, UserAccessType.ibm, ibmUserAccessQueryString);
  const ibmUserAccessError = userAccessSelectors.selectUserAccessError(
    state,
    UserAccessType.ibm,
    ibmUserAccessQueryString
  );
  const ibmUserAccessFetchStatus = userAccessSelectors.selectUserAccessFetchStatus(
    state,
    UserAccessType.ibm,
    ibmUserAccessQueryString
  );

  return {
    gcpUserAccess,
    gcpUserAccessError,
    gcpUserAccessFetchStatus,
    gcpUserAccessQueryString,
    ibmUserAccess,
    ibmUserAccessError,
    ibmUserAccessFetchStatus,
    ibmUserAccessQueryString,
    userAccess,
    userAccessError,
    userAccessFetchStatus,
    userAccessQueryString,
  };
});

const mapDispatchToProps: PermissionsDispatchProps = {
  fetchUserAccess: userAccessActions.fetchUserAccess,
};

const Permissions = withRouter(connect(mapStateToProps, mapDispatchToProps)(PermissionsBase));

export { Permissions, PermissionsProps };
