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
    buckets: SelectorsBucket[]
}

export interface DiamondData {
    diamondEvents: DiamondEvent[],
    simpleDiffs: SimpleDiff[],
    verifiedStatuses: VerifiedStatus[]
}

export interface SelectorsBucket {
    selectors: string[],
    actions: FacetCutSelectorAction[]
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
    setFacetSelectorState({
        diamondData: d,
        buckets: buckets
    })
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

    if (pathParams.selectedBucket) {
        return <DiamondMultiDiffContainer
            address={pathParams.address}
            network={pathParams.network as ApiName}
            bucket={facetSelectorState.buckets[pathParams.selectedBucket - 1]}
            diamondData={facetSelectorState.diamondData}
        />
    }

    return <FacetSelector
        style={{
            background: 'white'
        }}
        buckets={facetSelectorState?.buckets}
        diamondData={facetSelectorState?.diamondData}
    />

}