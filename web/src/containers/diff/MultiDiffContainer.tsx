import React, { useState } from 'react'
import { LinksRow } from '../../components/diff/LinksRow';
import { DiffRender } from '../../components/diff/DiffRender';
import { DiffSelector } from './DiffSelector';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import { Upgrade } from '../../lib/upgrade';
import { ErrorContent } from '../../components/error/ErrorContent';
import { Loading } from '../../components/loading/Loading';
import { InfoContent } from '../../components/error/InfoContent';
import { BaseParams } from '../../app';

interface MultiDiffContainerPropsData {
    error?: string,
    info?: string,
    upgrades: Upgrade[],
}

export interface MultiDiffContainerProps {
    data?: MultiDiffContainerPropsData
    loadingMsg?: string
    getPathParams: (match: any) => BaseParams
}

function renderContent(
    info?: string,
    error?: string,
    loadingMsg?: string,
    selectedUpgrade?: Upgrade) {
    if ((!error && !info && !selectedUpgrade) || loadingMsg) {
        const message = loadingMsg ? loadingMsg : 'Loading'
        return <Loading message={message} />
    } else if (info) {
        return <InfoContent
            info={info} />
    } else if (error) {
        return <ErrorContent
            error={error} />
    } else if (selectedUpgrade && selectedUpgrade.verified) {
        return <DiffRender
            key={selectedUpgrade.current_impl}
            network={selectedUpgrade.network}
            address={selectedUpgrade.current_impl}
            diff={selectedUpgrade.diff} />
    } else if (selectedUpgrade && !selectedUpgrade.verified) {
        return <InfoContent
            info={'Code diff unavailable for this upgrade'} />
    } else {
        return <></>
    }
}

export const getKey = (u: Upgrade) => {
    return `${u.proxy_address.toLowerCase()}${u.current_impl.toLowerCase()}${u.tx_hash}`;
}

export const deduplicateUpgrades = (upgrades: Upgrade[]): Upgrade[] => {
    const seen = {}
    const newUpgrades = []
    upgrades.forEach(u => {
        if (!seen[getKey(u)]) {
            seen[getKey(u)] = true
            newUpgrades.push(u);
        }
    })
    return newUpgrades;
}


export function MultiDiffContainer(props: MultiDiffContainerProps) {
    const [selectedUpgrade, setSelectedUpgrade] = useState(undefined);
    const pathParams = props.getPathParams(props);

    let upgrades = props.data?.upgrades || [];
    upgrades = upgrades.sort((a, b) => {
        if (a.ts < b.ts)
            return 1;
        else if (a.ts > b.ts)
            return -1;
        else return 0;
    })
    upgrades = deduplicateUpgrades(upgrades);

    if (props.data?.upgrades && props.data?.upgrades.length && !selectedUpgrade) {
        setSelectedUpgrade(upgrades[0]);
    }

    return (<>
        {
            upgrades?.length > 0 ?
                <Sider
                    width={220}
                    style={{
                        background: 'white',
                    }}>
                    <div className='upgrade_selector'>
                        <DiffSelector
                            upgrades={upgrades || []}
                            setSelectedDiff={setSelectedUpgrade}
                        />
                    </div>
                </Sider> : <></>
        }
        <Content style={{
            background: 'white'
        }}>
            <LinksRow
                address={pathParams.address}
                currentImpl={selectedUpgrade?.current_impl}
                network={pathParams.network}
                oldImpl={selectedUpgrade?.previous_impl}
                transaction_hash={selectedUpgrade?.tx_hash}
                unavailable={selectedUpgrade && !selectedUpgrade.verified}
            />
            {renderContent(
                props.data?.info,
                props.data?.error,
                props.loadingMsg,
                selectedUpgrade)}
        </Content>
    </>);
};