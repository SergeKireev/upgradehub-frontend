import { networkNames } from "ethereum-sources-downloader"
import { UnavailableReason } from "./unavailable_reason"

type Network = keyof typeof networkNames

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
}

export interface ImmunefiData {
    immunefi_program?: string
}

export type UpgradeWithImmunefi = Upgrade & ImmunefiData