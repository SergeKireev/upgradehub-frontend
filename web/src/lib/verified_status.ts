import { ApiName } from "ethereum-sources-downloader";

export interface VerifiedStatus {
    address: string,
    network: ApiName,
    verified: boolean
}