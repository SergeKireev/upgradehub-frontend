import { Row, Tag } from 'antd';
import React from 'react'
import { Upgrade } from "../../../lib/upgrade"

const formatDate = (ts: string) => {
    const m = new Date(parseInt(ts));
    return `${m.toDateString()} ${m.toLocaleTimeString()}`
}

export interface DisabledOptionCardProps {
    upgrade: Upgrade
}

function renderTag(upgrade: Upgrade) {
    if (!upgrade.unavailable_reason) {
        return <Tag color="gold">Diff unavailable</Tag>
    } else if (upgrade.unavailable_reason === 'PREVIOUS_AND_TARGET_UNAVAILABLE') {
        return <Tag color="gold">Both impls not verified</Tag>
    } else if (upgrade.unavailable_reason === 'PREVIOUS_UNAVAILABLE') {
        return <Tag color="gold">Prev impl not verified</Tag>
    } else if (upgrade.unavailable_reason === 'TARGET_UNAVAILABLE') {
        return <Tag color="gold">Target impl not verified</Tag>
    } else if (upgrade.unavailable_reason === 'PREVIOUS_EQUALS_TARGET') {
        return <Tag color="gold">Target same as previous</Tag>
    } else if (upgrade.unavailable_reason === 'INITIALIZATION' || upgrade.unavailable_reason === 'INITIALIZATION_UNVERIFIED') {
        return <Tag color="gold">Initialization</Tag>
    } else if (upgrade.unavailable_reason === 'REMOVED') {
        return <Tag color="error">Removed</Tag>
    }
}

export const DisabledOptionCard = (props: DisabledOptionCardProps) => {
    return <>
        <Row>
            <div className='upgrade_selector_date'>
                {
                    formatDate(props.upgrade.ts)
                }
            </div>
        </Row>
        <Row>
            {
                renderTag(props.upgrade)
            }
        </Row>
    </>
}