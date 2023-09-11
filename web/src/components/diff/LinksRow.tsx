import React from 'react'
import { dethExplorerUrls, explorerUrls } from '../../lib/networks'
import { SyncStatusData } from '../../lib/sync_status'
import { UnavailableReason } from '../../lib/unavailable_reason'
import { SyncStatus } from './SyncStatus'

interface LinksRowProps {
    address: string,
    currentImpl: string,
    oldImpl: string,
    network: string,
    transaction_hash: string,
    unavailable: boolean,
    unavailable_reason?: UnavailableReason
    sync_status: SyncStatusData
}

function getImplLinks(props: LinksRowProps) {
    const baseUrl = explorerUrls[props.network]
    const dethBaseUrl = dethExplorerUrls[props.network]
    const oldImplCodeLink = `${dethBaseUrl}/address/${props.oldImpl}`
    const currentImplCodeLink = `${dethBaseUrl}/address/${props.currentImpl}`
    const currentImplLink = `${baseUrl}/address/${props.currentImpl}`
    const prevImplLink = `${baseUrl}/address/${props.oldImpl}`

    if (!props.unavailable) {
        return <>
            <a target='_blank' href={oldImplCodeLink}>Old code</a>
            <a target='_blank' href={currentImplCodeLink}>New code</a>
        </>
    }

    if (props.unavailable_reason === 'PREVIOUS_UNAVAILABLE') {
        return <>
            <a target='_blank' href={prevImplLink}>View old impl. contract</a>
            <a target='_blank' href={currentImplCodeLink}>New code</a>
        </>
    } else if (props.unavailable_reason === 'TARGET_UNAVAILABLE') {
        return <>
            <a target='_blank' href={oldImplCodeLink}>Old code</a>
            <a target='_blank' href={currentImplLink}>View new impl. contract</a>
        </>
    } else if (props.unavailable_reason === 'PREVIOUS_EQUALS_TARGET') {
        return <a target='_blank' href={currentImplLink}>Impl. code</a>
    } else if (props.unavailable_reason === 'PREVIOUS_AND_TARGET_UNAVAILABLE') {
        return <>
            <a target='_blank' href={prevImplLink}>View old impl. contract</a>
            <a target='_blank' href={currentImplLink}>View new impl. contract</a>
        </>
    }
    return <></>
}

const Links = (props: LinksRowProps) => {
    const baseUrl = explorerUrls[props.network]
    const currentBlockExplorer = `${baseUrl}/address/${props.address}`
    const currentBlockExplorerTx = `${baseUrl}/tx/${props.transaction_hash}`

    return <div className='links_row'>
        {
            getImplLinks(props)
        }
        {
            (props.transaction_hash) ?
                <a target='_blank' href={currentBlockExplorerTx}>View upgrade tx</a> :
                <></>
        }
        <a target='_blank' href={currentBlockExplorer}>View proxy contract</a>
        <div style={{ flex: 1 }}></div>
        <SyncStatus {...props.sync_status} />
    </div>
}

export const LinksRow = (props: LinksRowProps) => {
    return <Links {...props} />
}