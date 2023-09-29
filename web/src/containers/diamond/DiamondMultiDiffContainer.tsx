import { ApiName } from 'ethereum-sources-downloader';
import React from 'react'
import { SimpleDiff, Upgrade } from '../../lib/upgrade';
import { DiamondData, SelectorsBucket } from './DiamondPage';
import { fillVerifiedOne } from '../../lib/utils/format'
import { ManagedMultiDiffContainer } from '../diff/MultiDiffContainer';
import { Card } from 'antd';
import { SelectorList } from './SelectorList';
import { FacetCutSelectorAction } from '../../lib/diamond/facet_utils';

export interface DiamondMultiDiffContainerProps {
    address: string,
    network: ApiName,
    bucket: SelectorsBucket,
    diamondData: DiamondData
}

function facetActionToUpgrade(address: string,
    network: ApiName,
    simpleDiffsIndex: any,
    verifiedStatusesIndex: any,
    action: FacetCutSelectorAction,
    previousAction?: FacetCutSelectorAction): Upgrade {
    const baseUpgrade = {
        network: network,
        proxy_address: address.toLowerCase(),
        log_index: 0,
        tx_hash: '',
        tx_index: 0,
        current_impl: action.address.toLowerCase(),
        previous_impl: action.address.toLowerCase(),
        ts: action.ts,
        diff: undefined,
        verified: false,
    }

    // In the normal case we need the previous action to deduce previous implementation
    if (action.action === 1 && previousAction) {
        const previousAddress = previousAction.address.toLowerCase()
        const currentAddress = action.address.toLowerCase()
        const simpleDiff = simpleDiffsIndex[`${previousAddress}_${currentAddress}`]?.diff;
        const upgrade = {
            ...baseUpgrade,
            previous_impl: previousAddress.toLowerCase(),
            diff: simpleDiff,
            ts: action.ts,
            verified: !!(simpleDiff),
        }
        fillVerifiedOne(upgrade, verifiedStatusesIndex)
        return upgrade;
    // In the case this is the first action, the selector is added so we consider it to be an initialization
    } else if (!previousAction) {
        const currentAddress = action.address.toLowerCase()
        const upgrade: Upgrade = baseUpgrade
        if (verifiedStatusesIndex[currentAddress.toLowerCase()])
            upgrade.unavailable_reason = 'INITIALIZATION'
        else
            upgrade.unavailable_reason = 'INITIALIZATION_UNVERIFIED'
        return upgrade;
    // Selector is removed, add a dummy upgrade to show the removal
    } else if (action.action === 2 && previousAction) {
        const currentAddress = previousAction.address.toLowerCase()
        const upgrade: Upgrade = {
            ...baseUpgrade,
            previous_impl: currentAddress,
            current_impl: currentAddress
        }
        upgrade.unavailable_reason = 'REMOVED'
        return upgrade;
    }
    return undefined;
}

function upgradesForSelectorsBucket(
    address: string,
    network: ApiName,
    bucket: SelectorsBucket,
    diamondData: DiamondData
): Upgrade[] {
    //Index some data fetched from auxiliary apis, to be able to join efficiently
    const simpleDiffsIndex: { [key: string]: SimpleDiff } = diamondData.simpleDiffs.reduce((acc, diff) => {
        acc[`${diff.previous_impl.toLowerCase()}_${diff.current_impl.toLowerCase()}`] = diff
        return acc;
    }, {});

    const verifiedStatusesIndex = diamondData.verifiedStatuses.reduce((acc, x) => {
        acc[x.address.toLowerCase()] = x.verified;
        return acc;
    }, {})

    const upgrades = bucket.actions.map((action, i) => {
        return facetActionToUpgrade(
            address,
            network,
            simpleDiffsIndex,
            verifiedStatusesIndex,
            action, i > 0 ? bucket.actions[i - 1] : undefined
        );
    }).filter(x => x !== undefined);

    return upgrades;
}

export const DiamondMultiDiffContainer = (props: DiamondMultiDiffContainerProps) => {
    const { address, network, bucket, diamondData } = props;

    const upgrades = upgradesForSelectorsBucket(address, network, bucket, diamondData);
    upgrades.reverse()

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