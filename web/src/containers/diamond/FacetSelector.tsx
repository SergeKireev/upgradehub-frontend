import { List, Space, Tag } from 'antd'
import React, { HTMLProps, useState } from 'react'
import { Navigate, Route } from 'react-router-dom'
import { FacetCutSelectorAction } from '../../lib/diamond/facet_utils'
import { DiamondData, SelectorsBucket } from './DiamondPage'
import { SelectorList } from './SelectorList'

interface FacetSelectorProps {
    diamondData: DiamondData
    buckets: SelectorsBucket[]
}

interface ActionBadgesProps {
    actions: FacetCutSelectorAction[]
}

function getActionLabel(a: number) {
    switch(a) {
        case 0: return 'add';
        case 1: return 'replace';
        case 2: return 'remove';
    }
}

function getActionColor(a: number) {
    switch(a) {
        case 0: return 'green';
        case 1: return 'blue';
        case 2: return 'red';
    }
}

export const RenderActionBadges = (props: ActionBadgesProps) => {
    return <Space>{
        props.actions.map(a => {
            return <Tag color={getActionColor(a.action)}>{getActionLabel(a.action)}</Tag>
        })
    }</Space>
}

export const renderBucket = (bucket: SelectorsBucket,
    index: number,
    setSelected: (index: number) => void) => {
    return <List.Item className='facet_selector' key={bucket[0]}>
        <a className='facet_selector_item'
            onClick={() => setSelected(index + 1)}>
            <List.Item.Meta
                title={<div>{`Group ${index + 1}`} <RenderActionBadges actions={bucket.actions}/></div>}
                description={
                    <SelectorList selectors={bucket.selectors} />
                }
            />
        </a>
    </List.Item>
}

export const FacetSelector = (props: HTMLProps<void> & FacetSelectorProps) => {
    const [selected, setSelected] = useState(undefined)
    return selected === undefined ?
        <List
            dataSource={(props?.buckets || [])}
            renderItem={(bucket: SelectorsBucket, index) =>
                renderBucket(bucket, index, setSelected)}
        /> : <Navigate to={`${selected}`} />
}
