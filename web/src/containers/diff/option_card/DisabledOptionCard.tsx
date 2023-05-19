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

export const DisabledOptionCard = (props: DisabledOptionCardProps) => {
    return <>
        <Row>
            <div style={{
               fontSize: 11
            }}>
                {
                    formatDate(props.upgrade.ts)
                }
            </div>
        </Row>
        <Row>
            <Tag color="gold">Diff unavailable</Tag>
        </Row>
    </>
}