import React from 'react'
import { Upgrade } from '../../../lib/upgrade';
import { parseDiff } from 'react-diff-view';
import { Row, Tag } from 'antd';

const formatDate = (ts: string) => {
    const m = new Date(parseInt(ts));
    return `${m.toDateString()} ${m.toLocaleTimeString()}`
}

export interface DiffOptionCardProps {
    upgrade: Upgrade
}

export const DiffOptionCard = (props: DiffOptionCardProps) => {
    const files = parseDiff(props.upgrade.diff)
    const total = {
        removed: 0,
        added: 0
    }
    files.forEach((f: any) => {
        f.hunks.forEach(h => {
            h.changes.forEach(c => {
                if (c.isInsert)
                    total.added += 1;
                if (c.isDelete)
                    total.removed += 1;
            })
        })
    })
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
            <Tag color="green">+{total.added}</Tag>
            <Tag color="red">-{total.removed}</Tag>
        </Row>
    </>
}
