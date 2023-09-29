import { ApiName } from "ethereum-sources-downloader";
import { DiamondEvent } from "../upgrade";

interface FacetCut {
    address: string,
    action: number,
    freezable?: number,
    selectors: string[],
}

export interface FacetCutSelectorAction {
    action: number,
    address: string,
    ts: string
}

type BucketedFacetCutSelectorAction = { [key: string]: FacetCutSelectorAction[] }

export function compressFacetCutActions(facetCutActions: FacetCutSelectorAction[]): FacetCutSelectorAction[] {
    const newFacetCutSelectorActions: FacetCutSelectorAction[] = []
    let i = 0;
    while (i < facetCutActions.length) {
        //Replace delete-add by replace
        if (i < facetCutActions.length - 1 &&
            facetCutActions[i].action === 2 &&
            facetCutActions[i + 1].action === 0) {
            newFacetCutSelectorActions.push({
                address: facetCutActions[i + 1].address,
                action: 1,
                ts: facetCutActions[i].ts
            });
            i += 2;
        } else {
            newFacetCutSelectorActions.push(facetCutActions[i]);
            i++
        }
    }
    return newFacetCutSelectorActions;
}

function computeActionsKey(actions: FacetCutSelectorAction[]) {
    return actions.map(x => {
        return `${x.action}|${x.address}`
    }).join('|');
}

export function createSelectorBuckets(diamondEvents: DiamondEvent[]) {
    const index: { [key: string]: FacetCutSelectorAction[] } = {}
    const selectorToName: { [key: string]: string } = {}
    diamondEvents.forEach(d => {
        if (!index[d.selector]) {
            index[d.selector] = []
        }
        if (!selectorToName[d.selector])
            selectorToName[d.selector] = d.function_sig !== null ? d.function_sig : d.selector

        index[d.selector].push({
            action: d.action,
            address: d.new_impl,
            ts: (d.ts * 1000).toString()
        })
    })

    const keys = Object.keys(index)
    const selectorNamesBuckets: { [key: string]: string[] } = {};
    const actionsByBucket: { [key: string]: FacetCutSelectorAction[] } = {};
    keys.forEach(key => {
        const actions = compressFacetCutActions(index[key])
        const actionsKey = computeActionsKey(actions);
        if (!selectorNamesBuckets[actionsKey])
            selectorNamesBuckets[actionsKey] = []
        selectorNamesBuckets[actionsKey].push(selectorToName[key]);
        actionsByBucket[actionsKey] = actions;
    })

    return Object.keys(selectorNamesBuckets).map(k => ({
        selectors: selectorNamesBuckets[k],
        actions: actionsByBucket[k]
    }));
}

