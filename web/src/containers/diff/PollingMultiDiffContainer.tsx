import React, { useState } from 'react'
import { BaseParams } from '../../app';
import { BASE_URL } from '../../config/api';
import { Upgrade } from '../../lib/upgrade';
import { PollingAction, PollingComponent, PollingStatus } from '../polling/PollingComponent';
import { ManagedMultiDiffContainer, MultiDiffContainer } from "./MultiDiffContainer";

interface PollingMultiDiffContainerProps {
    getPathParams: (match: any) => BaseParams
    diffFetchHook: (searchParams: BaseParams) => Promise<Upgrade[]>
    setError: (err: string) => void
    error: string
    selectedSearchParam?: number;
    useSyncStatus: boolean
}

type MultiDiffDataStatus = 'ok' | 'nok';
interface MultiDiffData {
    status: MultiDiffDataStatus,
    info?: string,
    error?: string,
    upgrades?: Upgrade[]
}

async function requestScanStatus(params: BaseParams) {
    const requestStatus = await fetch(`${BASE_URL}/request_scan_status`, {
        body: JSON.stringify(params),
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }
    }).catch(console.error);
    if (requestStatus) {
        const json = await requestStatus.json().catch(console.error);
        if (json)
            return json;
        else return { status: 'nok' };
    }
}

async function requestScan(params: BaseParams) {
    const requestStatus = await fetch(`${BASE_URL}/request_scan`, {
        body: JSON.stringify(params),
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }
    }).catch(console.error);

    if (requestStatus) {
        const json = await requestStatus.json().catch(console.error);
        if (json)
            return json;
        else return { status: 'nok' };
    }
}

async function pollForRequestStatus(
    params: BaseParams,
): Promise<PollingStatus<MultiDiffData>> {
    const response = await requestScanStatus(params);
    console.log("Polling for request status", response);
    if (
        response?.status === 'ok' &&
        response?.data?.requested
    ) {
        //Found and already requested, we can continue polling
        return {
            nextAction: 'retry'
        }
    } else if (
        response?.status === 'ok' &&
        response?.data?.requestable
    ) {
        const requestScanResponse = await requestScan(params)
        if (requestScanResponse.data === true) {
            return {
                nextAction: 'retry'
            }
        } else {
            //Get out of the polling loop
            return {
                nextAction: 'continue',
                data: {
                    status: 'ok'
                }
            }
        }
    } else if (
        response?.status === 'ok' &&
        response?.data?.upgrade_event_nb === 0
    ) {
        //Not found but is not a proxy, so we stop right here
        return {
            nextAction: 'continue',
            data: {
                status: 'nok',
                error: 'This address does not seem to be a proxy address'
            }
        }
    } else if (
        response?.status === 'ok' &&
        response?.data?.upgrade_event_nb === 1
    ) {
        return {
            nextAction: 'continue',
            data: {
                status: 'nok',
                info: 'This proxy has never been upgraded'
            }
        }
    } else {
        //We have detected everything intermediary, now if the
        //Polling has finished, we retry fetching the upgrades by calling next()
        return {
            nextAction: 'continue',
            data: {
                status: 'ok'
            }
        }
    }
}

export function PollingMultiDiffContainer(props: PollingMultiDiffContainerProps) {
    const pathParams = props.getPathParams(props);

    function fetchData(): Promise<PollingStatus<MultiDiffData>> {
        return props.diffFetchHook(pathParams).then((_upgrades: Upgrade[]) => {
            if (_upgrades && _upgrades.length) {
                return {
                    nextAction: 'continue' as PollingAction,
                    data: {
                        status: 'ok' as MultiDiffDataStatus,
                        upgrades: _upgrades
                    }
                }
            }
            return {
                nextAction: 'retry' as PollingAction
            }
        }).catch((e: string) => {
            return {
                nextAction: 'retry' as PollingAction,
                data: {
                    status: 'nok' as MultiDiffDataStatus,
                    error: e
                }
            }
        });
    }

    const launch = async () => {
        return fetchData();
    }

    const pollForRequestStatusClosured = () => {
        return pollForRequestStatus(pathParams);
    }

    const POLL_INTERVAL = 10000;
    return <PollingComponent
        fetchStatus={pollForRequestStatusClosured}
        interval={POLL_INTERVAL}
        launch={launch}
    >
        <MultiDiffContainer
            {...props}
        />
    </PollingComponent>
}