import { BaseParams, StagingParams, WithProxyType } from "../../app";
import { BASE_URL } from "../../config/api";
import { DiamondEvent, SimpleDiff, Upgrade } from "../upgrade";
import { VerifiedStatus } from "../verified_status";

export class ApiService {
    private async fetchApi<T, E>(endpoint: string, input: T): Promise<E> {
        const body = input ? {
            body: JSON.stringify(input) as BodyInit
        } : undefined
        const response = await fetch(
            `${BASE_URL}${endpoint}`,
            {
                ...body,
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                }
            }
        )
        if (response) {
            const json = await response.json()
            if (json.status === 'ok') {
                //Return the whole array of found upgrades
                return json.data
            } else if (json.status === 'nok') {
                return Promise.reject(json.msg);
            }
        }
        const msg = 'Server has returned an empty response';
        return Promise.reject(msg);
    }

    async fetchStagingDiff(params: StagingParams) {
        const _this = this
        const body = params
        const upgrades: Upgrade[] = await _this.fetchApi<BaseParams, Upgrade[]>('/staging_upgrades', undefined);
        return (upgrades || [])[0].diff
    }

    async fetchMultiDiff(params: BaseParams) {
        const _this = this;
        const body = params
        return _this.fetchApi<BaseParams, Upgrade[]>('/v2/upgrades', body);
    }

    async fetchSingleDiff(params: BaseParams) {
        const _this = this;
        const body = params
        const upgrades: Upgrade[] = await _this.fetchApi<BaseParams, Upgrade[]>('/v2/upgrades', body);
        return (upgrades || [])[0].diff
    }

    async fetchDiamondEvents(params: BaseParams) {
        const _this = this;
        const body = params
        const diamondEvents: DiamondEvent[] = await _this.fetchApi<BaseParams, DiamondEvent[]>('/v2/facet_cuts', body);
        const simpleDiffs: SimpleDiff[] = await _this.fetchApi<BaseParams, SimpleDiff[]>(`/v2/simple_diffs`, body);
        const verifiedStatuses: VerifiedStatus[] = await _this.fetchApi<BaseParams & WithProxyType, VerifiedStatus[]>('/v2/verified_impls', {
            ...body,
            proxyType: 'diamond'
        })
        
        //We do the join between these in the frontend
        return {
            diamondEvents: diamondEvents,
            simpleDiffs: simpleDiffs,
            verifiedStatuses: verifiedStatuses
        }
    }
}