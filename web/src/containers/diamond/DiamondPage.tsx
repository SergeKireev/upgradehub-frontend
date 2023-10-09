import React, { useEffect, useState } from 'react'
import { ApiName } from 'ethereum-sources-downloader'
import { DiamondParams } from '../../app'
import { Loading } from '../../components/loading/Loading'
import { createSelectorBuckets, FacetCutSelectorAction } from '../../lib/diamond/facet_utils'
import { DiamondEvent, SimpleDiff } from '../../lib/upgrade'
import { VerifiedStatus } from '../../lib/verified_status'
import { BreadcrumbProps } from '../common/AppLayout'
import { DiamondMultiDiffContainer } from './DiamondMultiDiffContainer'
import { FacetSelector } from './FacetSelector'

interface FacetSelectorContainerProps {
    getPathParams: (match: any) => DiamondParams
    diffFetchHook: (searchParams: DiamondParams) => Promise<DiamondData>
    setError: (err: string) => void
    error: string
    selectedSearchParam?: number;
    setBreadcrumb: (breadcrumb: BreadcrumbProps) => void
}

interface FacetSelectorState {
    diamondData: DiamondData,
    buckets: CategorizedSelectorBuckets
}

export type CategorizedSelectorBuckets = { [facetName: string]: SelectorsBucket[] }

export interface DiamondData {
    diamondEvents: DiamondEvent[],
    simpleDiffs: SimpleDiff[],
    verifiedStatuses: VerifiedStatus[]
}

export interface SelectorsBucket {
    selectors: string[],
    actions: FacetCutSelectorAction[]
}

function categorizeByName(buckets: SelectorsBucket[], diamondData: DiamondData): { [facetName: string]: SelectorsBucket[] } {
    const namesIndex = diamondData.verifiedStatuses.reduce((acc, v) => {
        acc[v.address] = v.name;
        return acc;
    }, {})
    const index = {}
    buckets.forEach(b => {
        let facetName = namesIndex[b.actions[0].address.toLowerCase()] || '';
        facetName = facetName.toLowerCase();
        if (!index[facetName]) {
            index[facetName] = []
        }
        index[facetName].push(b);
    })
    return index;
}

function handleDiamondData(
    d: DiamondData,
    setFacetSelectorState: (f: FacetSelectorState) => void
) {
    const getLatestTimestamp = (bucket: SelectorsBucket) => {
        const ts = bucket.actions[bucket.actions.length - 1].ts;
        return ts ? parseInt(ts) : 0;
    }

    const buckets: SelectorsBucket[] = createSelectorBuckets(d.diamondEvents);
    buckets.sort((a, b) => (getLatestTimestamp(b) - getLatestTimestamp(a)));

    const categorized = categorizeByName(buckets, d);
    setFacetSelectorState({
        diamondData: d,
        buckets: categorized
    })
}

function getNames(d: DiamondData) {
    return d?.verifiedStatuses?.reduce((acc, x) => {
        const name = x.name || ''
        acc[name.toLowerCase()] = name;
        return acc;
    }, {});
}

export const DiamondPage = (props: FacetSelectorContainerProps) => {
    const [facetSelectorState, setFacetSelectorState] = useState(undefined);

    const pathParams = props.getPathParams(props);

    useEffect(() => {
        props.diffFetchHook(pathParams)
            .then((d: DiamondData) => handleDiamondData(d, setFacetSelectorState))
            .catch(e => {
                props.setError('Could not fetch diamond events');
            })
    }, [])

    if (!facetSelectorState) {
        return <Loading
            message='Loading diamond state'
        />
    }

    const casedNamesIndex = getNames(facetSelectorState.diamondData);

    if (pathParams.selectedBucket) {
        return <DiamondMultiDiffContainer
            address={pathParams.address}
            network={pathParams.network as ApiName}
            bucket={
                facetSelectorState.buckets
                [pathParams.selectedBucket.facetName.toLowerCase()]
                [pathParams.selectedBucket.groupIndex - 1]
            }
            diamondData={facetSelectorState.diamondData}
        />
    }

    return <FacetSelector
        style={{
            background: 'white'
        }}
        casedNamesIndex={casedNamesIndex}
        buckets={facetSelectorState?.buckets}
        diamondData={facetSelectorState?.diamondData}
    />

}