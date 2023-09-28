import { ApiName } from "ethereum-sources-downloader";

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