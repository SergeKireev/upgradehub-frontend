import React, { useState } from "react";
import { BASE_URL } from "./config/api";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useMatch,
  Params,
  Link,
} from "react-router-dom";
import { SingleDiffContainer } from "./containers/diff/SingleDiffContainer";
import { HomeContent } from "./containers/home/Home";
import { AppLayout } from "./containers/common/AppLayout";
import { Layout } from "antd";
import { PollingMultiDiffContainer } from "./containers/diff/PollingMultiDiffContainer";
import { DiamondPage } from "./containers/diamond/DiamondPage";
import { ApiService } from "./lib/api/api_service";

export interface BaseParams {
  address?: string;
  newImpl?: string;
  network?: string;
}

export interface SelectedBucket {
  facetName: string;
  groupIndex: number;
}

export interface DiamondParams {
  address?: string;
  network?: string;
  selectedBucket?: SelectedBucket;
}

export interface WithProxyType {
  proxyType: "erc1967" | "diamond";
}

export interface StagingParams {
  id: string;
}

export const DiffRoutes = () => {
  const [error, setError] = useState(undefined);
  const [breadcrumb, setBreadcrumb] = useState(undefined);
  const apiService = new ApiService();

  const stagingDiffFetch = (params: StagingParams) => {
    let id = params.id;
    if (!id || id === null) {
      setError("Id should not be null when querying staging");
    }

    return apiService.fetchStagingDiff(params);
  };

  const diffFetch = (params: BaseParams) => {
    return apiService.fetchSingleDiff(params);
  };

  const multiDiffFetch = (params: BaseParams) => {
    return apiService.fetchMultiDiff(params);
  };

  const diamondFetch = (params: BaseParams) => {
    return apiService.fetchDiamondEvents(params);
  };

  const baseMatch = useMatch("/diffs/:network/:address/:new_impl");
  const getBaseParams = () => {
    return {
      network: baseMatch.params.network,
      address: baseMatch.params.address,
      newImpl: baseMatch.params.new_impl,
    };
  };

  const multiDiffMatch = useMatch("/diffs/:network/:address");
  const getMultiDiffParams = () => {
    return {
      network: multiDiffMatch.params.network,
      address: multiDiffMatch.params.address,
    };
  };

  const stagingMatch = useMatch("/staging/:id");
  const getStagingParams = () => {
    return {
      id: stagingMatch.params.id,
    };
  };

  const getDiamondParams = () => {
    const diamondMatch = useMatch("/diamond/:network/:address");
    const diamondMatchWSelected = useMatch(
      "/diamond/:network/:address/:facetName/:groupIndex",
    );
    const match: any =
      diamondMatch !== null ? diamondMatch : diamondMatchWSelected;
    return {
      network: match.params.network,
      address: match.params.address,
      selectedBucket: match.params.facetName
        ? {
            facetName: match.params.facetName,
            groupIndex: match.params.groupIndex,
          }
        : undefined,
    };
  };

  const getDiamondBreadcrumbItems = () => {
    const diamondParams = getDiamondParams();
    const path = `/diamond/${diamondParams.network}/${diamondParams.address}`;
    let result = [];
    if (diamondParams.selectedBucket) {
      result = [
        {
          title: <Link to={path}>{diamondParams.address}</Link>,
        },
        {
          title: <span>{diamondParams.selectedBucket.facetName}</span>,
        },
        {
          title: <span>{diamondParams.selectedBucket.groupIndex}</span>,
        },
      ];
    } else {
      result = [
        {
          title: <span>{diamondParams.address}</span>,
        },
      ];
    }
    return result;
  };

  return (
    <Routes>
      <Route
        path="/staging/:id"
        element={
          <SingleDiffContainer
            getSearchParams={getStagingParams}
            diffFetchHook={stagingDiffFetch}
            setError={setError}
          />
        }
      />
      <Route
        path="/diff/:network/:proxy/:new_impl"
        element={
          <SingleDiffContainer
            getSearchParams={getBaseParams}
            diffFetchHook={diffFetch}
            setError={setError}
          />
        }
      />
      <Route
        path="/diffs/:network/:proxy"
        element={
          <AppLayout>
            <Layout>
              <PollingMultiDiffContainer
                getPathParams={getMultiDiffParams}
                diffFetchHook={multiDiffFetch}
                error={error}
                setError={setError}
                useSyncStatus
              />
            </Layout>
          </AppLayout>
        }
      />
      <Route
        path="/diamond/:network/:proxy/:facetname?/:group_index?"
        element={
          <AppLayout
            breadcrumb={{
              getItems: getDiamondBreadcrumbItems,
            }}
          >
            <Layout>
              <DiamondPage
                getPathParams={getDiamondParams}
                diffFetchHook={diamondFetch}
                error={error}
                setError={setError}
                setBreadcrumb={setBreadcrumb}
              />
            </Layout>
          </AppLayout>
        }
      />
      <Route path="/*" element={<HomeContent />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <Router>
      <DiffRoutes />
    </Router>
  );
};
