import { Card, Col, Row } from 'antd'
import { ApiName } from 'ethereum-sources-downloader'
import React, { useEffect, useState } from 'react'
import { DiamondParams } from '../../app'
import { Loading } from '../../components/loading/Loading'
import { compressFacetCutActions, FacetCutSelectorAction } from '../../lib/diamond/facet_utils'
import { DiamondEvent, SimpleDiff, Upgrade } from '../../lib/upgrade'
import { fillVerifiedOne } from '../../lib/utils/format'
import { VerifiedStatus } from '../../lib/verified_status'
import { BreadcrumbProps } from '../common/AppLayout'
import { ManagedMultiDiffContainer } from '../diff/MultiDiffContainer'
import { FacetSelector } from './FacetSelector'
import { SelectorList } from './SelectorList'

interface FacetSelectorContainerProps {
    getPathParams: (match: any) => DiamondParams
    diffFetchHook: (searchParams: DiamondParams) => Promise<DiamondData>
    setError: (err: string) => void
    error: string
    selectedSearchParam?: number;
    setBreadcrumb: (breadcrumb: BreadcrumbProps) => void
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

function computeActionsKey(actions: FacetCutSelectorAction[]) {
    return actions.map(x => {
        return `${x.action}|${x.address}`
    }).join('|');
}

function createSelectorBuckets(diamondEvents: DiamondEvent[]) {
    const index: { [key: string]: FacetCutSelectorAction[] } = {}
    const selectorToName: { [key: string]: string } = {}
    diamondEvents.forEach(d => {
        if (!index[d.selector]) {
            index[d.selector] = []
        }
        if (!selectorToName[d.selector])
            selectorToName[d.selector] = d.function_sig !== null ? d.function_sig : d.selector

        index[d.selector].push({
            action: d.action,
            address: d.new_impl,
            ts: (d.ts * 1000).toString()
        })
    })

    const keys = Object.keys(index)
    const selectorNamesBuckets: { [key: string]: string[] } = {};
    const actionsByBucket: { [key: string]: FacetCutSelectorAction[] } = {};
    keys.forEach(key => {
        const actions = compressFacetCutActions(index[key])
        const actionsKey = computeActionsKey(actions);
        if (!selectorNamesBuckets[actionsKey])
            selectorNamesBuckets[actionsKey] = []
        selectorNamesBuckets[actionsKey].push(selectorToName[key]);
        actionsByBucket[actionsKey] = actions;
    })

    return Object.keys(selectorNamesBuckets).map(k => ({
        selectors: selectorNamesBuckets[k],
        actions: actionsByBucket[k]
    }));
}

function renderBucketMultiDiff(address: string,
    network: ApiName,
    bucket: SelectorsBucket,
    diamondData: DiamondData) {

    const simpleDiffsIndex: { [key: string]: SimpleDiff } = diamondData.simpleDiffs.reduce((acc, diff) => {
        acc[`${diff.previous_impl.toLowerCase()}_${diff.current_impl.toLowerCase()}`] = diff
        return acc;
    }, {});

    const verifiedStatusesIndex = diamondData.verifiedStatuses.reduce((acc, x) => {
        acc[x.address.toLowerCase()] = x.verified;
        return acc;
    }, {})

    const upgrades = bucket.actions.map((action, i) => {
        if (action.action === 1 && i > 0) {
            const previousAddress = bucket.actions[i - 1].address
            const currentAddress = action.address
            const upgrade = {
                current_impl: currentAddress.toLowerCase(),
                previous_impl: previousAddress.toLowerCase(),
                diff: simpleDiffsIndex[`${previousAddress.toLowerCase()}_${currentAddress.toLowerCase()}`]?.diff,
                log_index: 0,
                network: network,
                proxy_address: address,
                ts: action.ts,
                tx_hash: '',
                tx_index: 0,
                verified: !!(simpleDiffsIndex[`${previousAddress.toLowerCase()}_${currentAddress.toLowerCase()}`]?.diff),
            }
            fillVerifiedOne(upgrade, verifiedStatusesIndex)
            return upgrade;
        } else if (i === 0) {
            const currentAddress = action.address
            const upgrade: Upgrade = {
                current_impl: currentAddress.toLowerCase(),
                previous_impl: currentAddress.toLowerCase(),
                diff: undefined,
                log_index: 0,
                network: network,
                proxy_address: address,
                ts: action.ts,
                tx_hash: '',
                tx_index: 0,
                verified: false,
            }
            if (verifiedStatusesIndex[currentAddress.toLowerCase()])
                upgrade.unavailable_reason = 'INITIALIZATION'
            else
                upgrade.unavailable_reason = 'INITIALIZATION_UNVERIFIED'
            return upgrade;
        } else if (action.action === 2 && i > 0) {
            const currentAddress = bucket.actions[i - 1].address
            const upgrade: Upgrade = {
                current_impl: currentAddress.toLowerCase(),
                previous_impl: currentAddress.toLowerCase(),
                diff: undefined,
                log_index: 0,
                network: network,
                proxy_address: address,
                ts: action.ts,
                tx_hash: '',
                tx_index: 0,
                verified: false,
            }
            upgrade.unavailable_reason = 'REMOVED'
            return upgrade;
        }
        return undefined;
    }).filter(x => x !== undefined);

    return <ManagedMultiDiffContainer
        address={address}
        network={network}
        syncStatus={undefined}
        description={
            <Card
                title='Impacted selectors'
                className='diamond_diff_page_selector_list'
                bordered={false}
                >
                <SelectorList
                    selectors={bucket.selectors} />
            </Card>
        }
        data={{
            //@ts-ignore
            upgrades: upgrades as Upgrade[]
        }}
    />
}

export const DiamondPage = (props: FacetSelectorContainerProps) => {
    const [facetSelectorState, setFacetSelectorState] = useState(undefined);

    const pathParams = props.getPathParams(props);

    const getLatestTimestamp = (bucket: SelectorsBucket) => {
        const ts = bucket.actions[bucket.actions.length-1].ts;
        return ts ? parseInt(ts) : 0;
    }

    useEffect(() => {
        props.diffFetchHook(pathParams).then(d => {
            const buckets: SelectorsBucket[] = createSelectorBuckets(d.diamondEvents);
            buckets.sort((a, b) => (getLatestTimestamp(b) - getLatestTimestamp(a)));
            setFacetSelectorState({
                diamondData: d,
                buckets: buckets
            });
        }).catch(e => {
            props.setError('Could not fetch diamond events');
        })
    }, [])

    if (!facetSelectorState) {
        return <div style={{
            background: 'white'
        }}>
            <Loading

                message='Loading diamond state'
            />
        </div>
    }

    if (pathParams.selectedBucket) {
        return renderBucketMultiDiff(pathParams.address,
            pathParams.network as ApiName,
            facetSelectorState.buckets[pathParams.selectedBucket - 1],
            facetSelectorState.diamondData)
    }

    return <FacetSelector
        style={{
            background: 'white'
        }}
        buckets={facetSelectorState?.buckets}
        diamondData={facetSelectorState?.diamondData}
    />

}