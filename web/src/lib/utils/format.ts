import { Upgrade } from "../upgrade";

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
        if (i < upgrades.length - 1 && u.current_impl === u.previous_impl) {
            // Upgrades are sorted in reverse order
            u.previous_impl = upgrades[i+1].current_impl;
            console.log('Setting previous impl to be', upgrades[i+1].current_impl);
        }
    })
}