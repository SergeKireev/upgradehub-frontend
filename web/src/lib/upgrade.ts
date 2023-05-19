import { networkNames } from "ethereum-sources-downloader"

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
}

export interface ImmunefiData {
    immunefi_program?: string
}

export type UpgradeWithImmunefi = Upgrade & ImmunefiData