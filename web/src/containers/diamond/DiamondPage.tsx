import React, { useEffect, useState } from "react";
import { ApiName } from "ethereum-sources-downloader";
import { DiamondParams } from "../../app";
import { Loading } from "../../components/loading/Loading";
import {
  createSelectorBuckets,
  FacetCutSelectorAction,
} from "../../lib/diamond/facet_utils";
import { DiamondEvent, SimpleDiff } from "../../lib/upgrade";
import { VerifiedStatus } from "../../lib/verified_status";
import { BreadcrumbProps } from "../common/AppLayout";
import { DiamondMultiDiffContainer } from "./DiamondMultiDiffContainer";
import { FacetSelector } from "./FacetSelector";

const UNVERIFIED_FACET_NAME = "Facet contract not verified";

interface FacetSelectorContainerProps {
  getPathParams: (match: any) => DiamondParams;
  diffFetchHook: (searchParams: DiamondParams) => Promise<DiamondData>;
  setError: (err: string) => void;
  error: string;
  selectedSearchParam?: number;
  setBreadcrumb: (breadcrumb: BreadcrumbProps) => void;
}

interface FacetSelectorState {
  diamondData: DiamondData;
  buckets: CategorizedSelectorBuckets;
}

export type CategorizedSelectorBuckets = {
  [facetName: string]: SelectorsBucket[];
};

export interface DiamondData {
  diamondEvents: DiamondEvent[];
  simpleDiffs: SimpleDiff[];
  verifiedStatuses: VerifiedStatus[];
}

export interface SelectorsBucket {
  selectors: string[];
  actions: FacetCutSelectorAction[];
}

function getFacetNameFromActions(
  actions: FacetCutSelectorAction[],
  names: { [address: string]: string },
): string {
  const found = actions.find((a) => {
    const name = names[a.address.toLowerCase()];
    return !!name;
  });
  return found ? names[found.address.toLowerCase()] : UNVERIFIED_FACET_NAME;
}

function categorizeByName(
  buckets: SelectorsBucket[],
  diamondData: DiamondData,
): { [facetName: string]: SelectorsBucket[] } {
  const namesIndex = diamondData.verifiedStatuses.reduce((acc, v) => {
    acc[v.address] = v.name;
    return acc;
  }, {});
  const index = {};
  buckets.forEach((b, i) => {
    let facetName = getFacetNameFromActions(b.actions, namesIndex);
    facetName = facetName.toLowerCase();
    if (!index[facetName]) {
      index[facetName] = [];
    }
    index[facetName].push(b);
  });
  return index;
}

function handleDiamondData(
  d: DiamondData,
  setFacetSelectorState: (f: FacetSelectorState) => void,
) {
  const getLatestTimestamp = (bucket: SelectorsBucket) => {
    const ts = bucket.actions[bucket.actions.length - 1].ts;
    return ts ? parseInt(ts) : 0;
  };

  const buckets: SelectorsBucket[] = createSelectorBuckets(d.diamondEvents);
  buckets.sort((a, b) => getLatestTimestamp(b) - getLatestTimestamp(a));

  const categorized = categorizeByName(buckets, d);
  setFacetSelectorState({
    diamondData: d,
    buckets: categorized,
  });
}

function getNames(d: DiamondData) {
  return d?.verifiedStatuses?.reduce((acc, x) => {
    const name = !x.name ? UNVERIFIED_FACET_NAME : x.name;
    acc[name.toLowerCase()] = name;
    return acc;
  }, {});
}

export const DiamondPage = (props: FacetSelectorContainerProps) => {
  const [facetSelectorState, setFacetSelectorState] = useState(undefined);

  const pathParams = props.getPathParams(props);

  useEffect(() => {
    props
      .diffFetchHook(pathParams)
      .then((d: DiamondData) => handleDiamondData(d, setFacetSelectorState))
      .catch((e) => {
        props.setError("Could not fetch diamond events");
      });
  }, []);

  if (!facetSelectorState) {
    return <Loading message="Loading diamond state" />;
  }

  const casedNamesIndex = getNames(facetSelectorState.diamondData);

  if (pathParams.selectedBucket) {
    return (
      <DiamondMultiDiffContainer
        address={pathParams.address}
        network={pathParams.network as ApiName}
        bucket={
          facetSelectorState.buckets[
            pathParams.selectedBucket.facetName.toLowerCase()
          ][pathParams.selectedBucket.groupIndex - 1]
        }
        diamondData={facetSelectorState.diamondData}
      />
    );
  }

  return (
    <FacetSelector
      style={{
        background: "white",
      }}
      casedNamesIndex={casedNamesIndex}
      buckets={facetSelectorState?.buckets}
      diamondData={facetSelectorState?.diamondData}
    />
  );
};
