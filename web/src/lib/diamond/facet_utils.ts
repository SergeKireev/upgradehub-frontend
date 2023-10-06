import { DiamondEvent } from "../upgrade";
import { compareNumbers, eventOrderableComparison } from "../utils/format";

export interface FacetCutSelectorAction {
    action: number,
    address: string,
    ts: string,
    tx_index: number,
    log_index: number
}

interface FacetComparable {
    ts: string | number,
    tx_index: number,
    log_index: number
    action: number
}

export function compressFacetCutActions(facetCutActions: FacetCutSelectorAction[]): FacetCutSelectorAction[] {
    const newFacetCutSelectorActions: FacetCutSelectorAction[] = []
    let i = 0;
    while (i < facetCutActions.length) {
        //Replace delete-add by replace
        if (i < facetCutActions.length - 1 &&
            facetCutActions[i].action === 2 &&
            facetCutActions[i + 1].action === 0) {
            newFacetCutSelectorActions.push({
                ...facetCutActions[i + 1],
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

function eventOrderableComparisonWithAction(a: FacetComparable, b: FacetComparable) {
    const comparison = eventOrderableComparison(a, b);
    if (comparison != 0)
        return comparison;
    else {
        //Prefer having add after remove
        return -compareNumbers(a.action, b.action);
    }
}

export function createSelectorBuckets(diamondEvents: DiamondEvent[]) {
    const index: { [key: string]: FacetCutSelectorAction[] } = {}
    const selectorToName: { [key: string]: string } = {}
    diamondEvents.sort(eventOrderableComparisonWithAction);
    diamondEvents.forEach(d => {
        if (!index[d.selector]) {
            index[d.selector] = []
        }
        if (!selectorToName[d.selector])
            selectorToName[d.selector] = d.function_sig !== null ? d.function_sig : d.selector

        index[d.selector].push({
            action: d.action,
            address: d.new_impl,
            ts: (d.ts * 1000).toString(),
            tx_index: d.tx_index,
            log_index: d.log_index
        })
    })

    const keys = Object.keys(index)
    const selectorNamesBuckets: { [key: string]: string[] } = {};
    const actionsByBucket: { [key: string]: FacetCutSelectorAction[] } = {};
    keys.forEach(key => {
        // Replaces delete-inserts by replace
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

