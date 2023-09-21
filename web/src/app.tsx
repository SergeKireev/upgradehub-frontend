import React, { useState } from 'react'
import { BASE_URL } from './config/api'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useMatch,
} from "react-router-dom";
import { SingleDiffContainer } from './containers/diff/SingleDiffContainer';
import { HomeContent } from './containers/home/Home';
import { AppLayout } from './containers/common/AppLayout';
import { Layout } from 'antd';
import { PollingMultiDiffContainer } from './containers/diff/PollingMultiDiffContainer';

async function initializeStagingDiff(
    params: StagingParams,
    setError?: (err: string) => void) {
    const response = await fetch(
        `${BASE_URL}/staging_upgrades/${params.id}`,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            }
        }
    )
    if (response) {
        const json = await response.json()
        if (json.status === 'ok') {
            if (json.data.length) {
                return json.data[json.data.length - 1]
            }
        } else if (json.status === 'nok') {
            setError(json.msg)
            return undefined;
        }
    }
    setError('Server has returned an empty response');
    return undefined;
}

async function initializeDiff(
    params: BaseParams,
    setError?: (err: string) => void
) {
    const body = params

    const response = await fetch(
        `${BASE_URL}/upgrades`,
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        }
    )
    if (response) {
        const json = await response.json()
        if (json.status === 'ok') {
            if (json.data.length) {
                return json.data[json.data.length - 1]
            }
        } else if (json.status === 'nok') {
            setError(json.msg)
            return undefined;
        }
    }
    setError('Server has returned an empty response');
    return undefined;
}

async function initializeMultiDiff(
    params: BaseParams
) {
    const body = params
    const response = await fetch(
        `${BASE_URL}/v2/upgrades`,
        {
            method: 'POST',
            body: JSON.stringify(body),
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

export interface BaseParams {
    address?: string,
    newImpl?: string,
    network?: string,
}

interface StagingParams {
    id: string
}

export const DiffRoutes = () => {
    const [error, setError] = useState(undefined);

    const stagingDiffFetch = (params: StagingParams) => {
        let id = params.id;
        if ((!id || id === null)) {
            setError('Id should not be null when querying staging')
        }

        return initializeStagingDiff(params, setError)
    }

    const diffFetch = (params: BaseParams) => {
        return initializeDiff(params, setError)
    }

    const multiDiffFetch = (params: BaseParams) => {
        return initializeMultiDiff(params)
    }

    const baseMatch = useMatch("/diffs/:network/:address/:new_impl");
    const getBaseParams = () => {
        return {
            network: baseMatch.params.network,
            address: baseMatch.params.address,
            new_impl: baseMatch.params.new_impl
        };
    }

    const multiDiffMatch = useMatch("/diffs/:network/:address");
    const getMultiDiffParams = () => {
        return {
            network: multiDiffMatch.params.network,
            address: multiDiffMatch.params.address
        };
    }

    const stagingMatch = useMatch("/staging/:id");
    const getStagingParams = () => {
        return {
            id: stagingMatch.params.id
        };
    }

    return <Routes>
        <Route path="/staging/:id"
            element={
                <SingleDiffContainer
                    getSearchParams={getStagingParams}
                    diffFetchHook={stagingDiffFetch}
                    setError={setError}
                />
            } />
        <Route path="/diff/:network/:proxy/:new_impl" element={
            <SingleDiffContainer
                getSearchParams={getBaseParams}
                diffFetchHook={diffFetch}
                setError={setError}
            />
        } />
        <Route path="/diffs/:network/:proxy" element={
            <AppLayout>
                <Layout>
                    <PollingMultiDiffContainer
                        getPathParams={getMultiDiffParams}
                        diffFetchHook={multiDiffFetch}
                        error={error}
                        setError={setError}
                    />
                </Layout>
            </AppLayout>
        } />
        <Route path="/*"
            element={
                <HomeContent />
            } />
    </Routes>
}

export const App = () => {
    return <Router>
        <DiffRoutes />
    </Router>
}
