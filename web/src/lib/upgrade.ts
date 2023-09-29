import { ApiName, networkNames } from "ethereum-sources-downloader"
import { UnavailableReason } from "./unavailable_reason"

type Network = keyof typeof networkNames

//Special value
export const INCEPTION_TX_HASH = '0xcafebebe'

export interface Upgrade {
    proxy_address: string
    previous_impl: string
    current_impl: string
    diff: string
    ts: string
    network: Network
    tx_hash: string
    verified?: boolean
    unavailable_reason?: UnavailableReason
    tx_index: number
    log_index: number
}

export interface DiamondEvent {
    id?: string,
    address: string,
    new_impl: string,
    action: number,
    selector: string,
    function_sig?: string,
    network: ApiName,
    tx_hash: string,
    block_number: number,
    log_index: number,
    tx_index: number
    ts: number,
}

export interface SimpleDiff {
    id?: string,
    proxy_address: string,
    current_impl: string,
    previous_impl: string,
    diff: string
}