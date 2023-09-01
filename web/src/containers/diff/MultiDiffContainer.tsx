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
import { fillPreviousImpl, formatUpgrades } from '../../lib/utils/format';

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
            address={selectedUpgrade.previous_impl}
            diff={selectedUpgrade.diff} />
    } else if (selectedUpgrade && !selectedUpgrade.verified && selectedUpgrade.current_impl === selectedUpgrade.previous_impl) {
        return <InfoContent
            info={'Code diff is empty'} />
    } else if (selectedUpgrade && !selectedUpgrade.verified) {
        return <InfoContent
            info={'Code diff unavailable for this upgrade'} />
    } else {
        return <></>
    }
}

export function MultiDiffContainer(props: MultiDiffContainerProps) {
    const [selectedUpgrade, setSelectedUpgrade] = useState(undefined);
    const pathParams = props.getPathParams(props);

    let upgrades = formatUpgrades(props.data?.upgrades || []);
    fillPreviousImpl(upgrades);
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