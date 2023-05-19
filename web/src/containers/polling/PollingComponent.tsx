import React, { useEffect, useState } from "react"
import { HTMLProps } from "react"
import { Loading } from "../../components/loading/Loading";

export type PollingAction = 'retry' | 'continue'

type FetchStatusCallback<T> = () => Promise<PollingStatus<T>>;

export interface PollingStatus<T> {
    nextAction: PollingAction,
    data?: T
}

interface PollingComponentProps<T> {
    launch: () => Promise<PollingStatus<T>>
    fetchStatus: () => Promise<PollingStatus<T>>
    interval: number
}

async function poll<T>(
    launch: () => Promise<PollingStatus<T>>,
    fetchStatus: FetchStatusCallback<T>,
    onStatus: (pollingStatus: PollingStatus<T>,
        fetchStatus: FetchStatusCallback<T>)
        => Promise<void>,
    setData: (data: T) => void,
    setPolling: (polling: boolean) => void
) {
    const status = await launch();
    if (status.nextAction === 'continue') {
        setData(status.data);
    } else {
        setPolling(true);
        const initialStatus = await fetchStatus();
        await onStatus(initialStatus, fetchStatus);
    }
}

function sleep(interval: number): Promise<void> {
    return new Promise((res, rej) => {
        setTimeout(() => res(), interval);
    })
}

export function PollingComponent<T>(props: PollingComponentProps<T> & HTMLProps<void>) {
    const [data, setData] = useState(undefined);
    const [polling, setPolling] = useState(false);

    async function onStatus<T>(pollingStatus: PollingStatus<T>, fetchStatus: FetchStatusCallback<T>) {
        if (pollingStatus.nextAction === 'retry') {
            await sleep(props.interval || 5000);
            const status = await fetchStatus();
            await onStatus(status, fetchStatus);
        } else if (pollingStatus.nextAction === 'continue') {
            const status = await props.launch();
            if (status.nextAction === 'continue') {
                setData(status.data);
            } else {
                setData({
                    ...(pollingStatus.data),
                    ...(status.data)
                });
            }
        }
    }

    useEffect(() => {
        poll(props.launch, props.fetchStatus, onStatus, setData, setPolling).finally(() => {
            setPolling(false);
        });
    }, [setPolling, setData])

    let loadingMsg = polling ? 'Processing of upgrades for this address is queued' : undefined;
    return (<>
        {React.cloneElement(
            props.children as any,
            { ...props, data: data, loadingMsg: loadingMsg })}
    </>)
}