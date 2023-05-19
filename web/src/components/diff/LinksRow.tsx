import React from 'react'
import { dethExplorerUrls, explorerUrls } from '../../lib/networks'

interface LinksRowProps {
    address: string,
    currentImpl: string,
    oldImpl: string,
    network: string,
    transaction_hash: string,
    unavailable: boolean
}

const LinksAvailable = (props: LinksRowProps) => {
    const baseUrl = explorerUrls[props.network]
    const dethBaseUri = dethExplorerUrls[props.network]
    const oldImplLink = `${dethBaseUri}/address/${props.oldImpl}`
    const currentBlockExplorer = `${baseUrl}/address/${props.address}`
    const currentBlockExplorerTx = `${baseUrl}/tx/${props.transaction_hash}`
    const currentImplLink = `${dethBaseUri}/address/${props.currentImpl}`

    return <div className='links_row'>
        {
            props.oldImpl ?
                <a target='_blank' href={oldImplLink}>Old code</a> :
                <></>
        }
        {
            props.currentImpl ?
                <a target='_blank' href={currentImplLink}>New code</a> :
                <></>
        }
        {
            (props.transaction_hash) ?
                <a target='_blank' href={currentBlockExplorerTx}>View upgrade tx</a> :
                <></>
        }
        <a target='_blank' href={currentBlockExplorer}>View proxy contract</a>
    </div>
}

const LinksUnavailable = (props: LinksRowProps) => {
    const baseUrl = explorerUrls[props.network]
    const currentBlockExplorer = `${baseUrl}/address/${props.address}`
    const currentBlockExplorerTx = `${baseUrl}/tx/${props.transaction_hash}`
    const currentImplLink = `${baseUrl}/address/${props.currentImpl}`

    return <div className='links_row'>
        {
            (props.transaction_hash) ?
                <a target='_blank' href={currentBlockExplorerTx}>View upgrade tx</a> :
                <></>
        }
        {
            props.currentImpl ?
                <a target='_blank' href={currentImplLink}>View Implementation contract</a> :
                <></>
        }
        <a target='_blank' href={currentBlockExplorer}>View proxy contract</a>
    </div>
}

export const LinksRow = (props: LinksRowProps) => {
    return props.unavailable ?
        <LinksUnavailable {...props} /> :
        <LinksAvailable {...props} />
}