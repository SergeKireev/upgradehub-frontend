import { ApiName } from 'ethereum-sources-downloader';
import React from 'react'
import { SimpleDiff, Upgrade } from '../../lib/upgrade';
import { DiamondData, SelectorsBucket } from './DiamondPage';
import { fillVerifiedOne } from '../../lib/utils/format'
import { ManagedMultiDiffContainer } from '../diff/MultiDiffContainer';
import { Card } from 'antd';
import { SelectorList } from './SelectorList';

export interface DiamondMultiDiffContainerProps {
    address: string,
    network: ApiName,
    bucket: SelectorsBucket,
    diamondData: DiamondData
}

export const DiamondMultiDiffContainer = (props: DiamondMultiDiffContainerProps) => {
    const { address, network, bucket, diamondData } = props;

    const simpleDiffsIndex: { [key: string]: SimpleDiff } = diamondData.simpleDiffs.reduce((acc, diff) => {
        acc[`${diff.previous_impl.toLowerCase()}_${diff.current_impl.toLowerCase()}`] = diff
        return acc;
    }, {});

    const verifiedStatusesIndex = diamondData.verifiedStatuses.reduce((acc, x) => {
        acc[x.address.toLowerCase()] = x.verified;
        return acc;
    }, {})

    const upgrades = bucket.actions.map((action, i) => {
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
        if (action.action === 1 && i > 0) {
            const previousAddress = bucket.actions[i - 1].address.toLowerCase()
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
        } else if (i === 0) {
            const currentAddress = action.address.toLowerCase()
            const upgrade: Upgrade = baseUpgrade
            if (verifiedStatusesIndex[currentAddress.toLowerCase()])
                upgrade.unavailable_reason = 'INITIALIZATION'
            else
                upgrade.unavailable_reason = 'INITIALIZATION_UNVERIFIED'
            return upgrade;
        } else if (action.action === 2 && i > 0) {
            const currentAddress = bucket.actions[i - 1].address.toLowerCase()
            const upgrade: Upgrade = {
                ...baseUpgrade,
                previous_impl: currentAddress,
                current_impl: currentAddress
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