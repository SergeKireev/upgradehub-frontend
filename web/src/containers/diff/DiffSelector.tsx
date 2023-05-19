import React, { HTMLProps, useEffect } from 'react'
import { Radio, RadioChangeEvent, Space } from "antd"
import { Upgrade } from "../../lib/upgrade"
import { DiffOptionCard } from './option_card/DiffOptionCard'
import { useSearchParams } from 'react-router-dom';
import { DisabledOptionCard } from './option_card/DisabledOptionCard';
import { getKey } from './MultiDiffContainer';

interface DiffSelectorProps {
    upgrades: Upgrade[];
    setSelectedDiff: (upgrade: Upgrade) => void;
}

export const getOptionCard = (upgrade: Upgrade) => {
    if (upgrade.verified) {
        return <DiffOptionCard upgrade={upgrade} />
    } else {
        return <DisabledOptionCard upgrade={upgrade} />
    }
}

export const DiffSelector = (props: DiffSelectorProps & HTMLProps<void>) => {
    let [searchParams, setSearchParams] = useSearchParams();

    let upgrades = props.upgrades;

    const upgradesIndex = upgrades.reduce((ind, u, i) => {
        ind[getKey(u)] = [u, i]
        return ind;
    }, {})

    const setNewValue = (e: RadioChangeEvent) => {
        const id = e.target.value;
        const [upgrade, index] = upgradesIndex[id];
        props.setSelectedDiff(upgrade);
        searchParams.set('selected', (upgrades.length - index).toString())
        setSearchParams(searchParams);
    }

    let selectedSearchParam = undefined
    try {
        selectedSearchParam = parseInt(searchParams.get('selected'))
    } catch (e) { }

    let _selected = selectedSearchParam >= upgrades.length ? 0 : upgrades.length - selectedSearchParam
    if (!selectedSearchParam) {
        _selected = 0;
    }

    useEffect(() => {
        if (selectedSearchParam)
            props.setSelectedDiff(upgrades[upgrades.length - selectedSearchParam]);
    })

    const _selectedKey = getKey(upgrades[_selected]);
    return <Radio.Group defaultValue={_selectedKey} buttonStyle="solid" onChange={setNewValue}>
        <Space direction="vertical">
            {
                upgrades.map(u => {
                    return <Radio.Button
                        value={getKey(u)}
                        id={getKey(u)}
                        key={getKey(u)}
                        style={{
                            height: 60,
                            width: 200
                        }}
                    >
                        {getOptionCard(u)}
                    </Radio.Button>
                })
            }
        </Space>
    </Radio.Group>
}