import React from 'react';
import { Tag } from "antd"
import {
    CheckCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { SyncStatusData } from '../../lib/sync_status';
import { formatDate } from '../../lib/utils/format';

export const SyncStatus = (props: SyncStatusData) => {
    return props.processing ?
        <Tag icon={<SyncOutlined spin />} color="processing">
            syncing
        </Tag> :
        props.last_update_ts ?
            <Tag icon={<CheckCircleOutlined />} color="default">
                last synced {formatDate(parseInt(props.last_update_ts))}
            </Tag> :
            <></>
}