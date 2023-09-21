import { INCEPTION_TX_HASH, Upgrade } from "../upgrade";
import { VerifiedStatus } from "../verified_status";

export const formatDate = (ts: number) => {
    const m = new Date(ts);
    return `${m.toDateString()} ${m.toLocaleTimeString()}`
}

export const getKey = (u: Upgrade) => {
    return `${u.proxy_address.toLowerCase()}${u.current_impl.toLowerCase()}${u.tx_hash}`;
}

export const deduplicateUpgrades = (upgrades: Upgrade[]): Upgrade[] => {
    const seen = {}
    const newUpgrades = []
    upgrades.forEach(u => {
        if (!seen[getKey(u)]) {
            seen[getKey(u)] = true
            newUpgrades.push(u);
        }
    })
    return newUpgrades;
}

export function formatUpgrades(upgrades: Upgrade[]) {
    upgrades = upgrades.sort((a, b) => {
        if (a.ts < b.ts)
            return 1;
        else if (a.ts > b.ts)
            return -1;
        else return 0;
    })
    upgrades = deduplicateUpgrades(upgrades);
    return upgrades;
}

export function fillPreviousImpl(upgrades: Upgrade[]) {
    upgrades.forEach((u, i) => {
        if (i < upgrades.length - 1 && u.current_impl === u.previous_impl && !!upgrades[i + 1]) {
            // Upgrades are sorted in reverse order
            u.previous_impl = upgrades[i + 1].current_impl;
        }
    })
}

function isPreviousEqualCurrent(upgrade: Upgrade) {
    return upgrade.current_impl === upgrade.previous_impl;
}

export function fillVerified(upgrades: Upgrade[], verified_statuses?: VerifiedStatus[]) {
    if (verified_statuses) {
        const index = verified_statuses.reduce((acc, x) => {
            acc[x.address] = x.verified;
            return acc;
        }, {})
        upgrades.forEach((x, i) => {
            if (i == upgrades.length - 2 &&
                upgrades[i + 1].tx_hash === INCEPTION_TX_HASH &&
                upgrades[i + 1].current_impl === x.current_impl) {
                if (index[x.current_impl]) {
                    x.unavailable_reason = 'INITIALIZATION'
                } else {
                    x.unavailable_reason = 'INITIALIZATION_UNVERIFIED'
                }
            } else if (x.tx_hash === INCEPTION_TX_HASH) {
                x.unavailable_reason = 'INCEPTION'
            } else if (isPreviousEqualCurrent(x)) {
                x.unavailable_reason = 'PREVIOUS_EQUALS_TARGET'
            } else if (!index[x.previous_impl] && !index[x.current_impl]) {
                x.unavailable_reason = 'PREVIOUS_AND_TARGET_UNAVAILABLE'
            } else if (!index[x.previous_impl]) {
                x.unavailable_reason = 'PREVIOUS_UNAVAILABLE'
            } else if (!index[x.current_impl]) {
                x.unavailable_reason = 'TARGET_UNAVAILABLE'
            }
        })
    }
}

export function trimFirstUpgradeIfEmpty(upgrades: Upgrade[]) {
    // Two cases:
    // 1. Previously upgrade event emitted during init was labeled as 'PREVIOUS_EQUALS_TARGET' which is unclear, so we don't show it
    // 2. With the introduction of the phantom event at inception, we can now correctly label Initialization events as 'INITIALIZATION' so we remove
    // only the inception event
    return upgrades.filter((u, i) =>
        !(u.unavailable_reason === 'PREVIOUS_EQUALS_TARGET' && i === upgrades.length - 1) &&
        !(u.unavailable_reason === 'INCEPTION'))
}