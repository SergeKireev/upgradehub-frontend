import React, { useEffect, useState } from "react";
import { LinksRow } from "../../components/diff/LinksRow";
import { DiffRender } from "../../components/diff/DiffRender";
import { SyncStatusData } from "../../lib/sync_status";

interface SingleDiffContainerProps<T> {
  getSearchParams: (match: any) => T;
  diffFetchHook: (searchParams: T) => Promise<string>;
  setError: (err: string) => void;
  match?: any;
}

export function SingleDiffContainer<T>(props: SingleDiffContainerProps<T>) {
  const [upgrade, setUpgrade] = useState(undefined);

  useEffect(() => {
    const searchParams = props.getSearchParams(props);
    props
      .diffFetchHook(searchParams)
      .then((diffResult) => {
        if (diffResult && !upgrade) setUpgrade(diffResult);
      })
      .catch((e) => {
        props.setError(e.message);
      });
  });

  const diffText = upgrade?.diff;
  if (!diffText) {
    return <div>Loading...</div>;
  }

  const defaultSyncStatus: SyncStatusData = {
    processing: false,
    last_update_ts: "0",
  };

  return (
    <div className="content">
      <LinksRow
        address={upgrade.proxy_address}
        currentImpl={upgrade.current_impl}
        network={upgrade.network}
        oldImpl={upgrade.previous_impl}
        transaction_hash={upgrade.tx_hash}
        unavailable={false}
        sync_status={defaultSyncStatus}
      />
      <DiffRender
        address={upgrade.current_impl}
        network={upgrade.network}
        diff={diffText}
      />
    </div>
  );
}
