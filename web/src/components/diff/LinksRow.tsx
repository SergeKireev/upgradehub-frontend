import React from "react";
import { dethExplorerUrls, explorerUrls } from "../../lib/networks";
import { SyncStatusData } from "../../lib/sync_status";
import { UnavailableReason } from "../../lib/unavailable_reason";
import { SyncStatus } from "./SyncStatus";

interface LinksRowProps {
  address: string;
  currentImpl: string;
  oldImpl: string;
  network: string;
  transaction_hash: string;
  unavailable: boolean;
  unavailable_reason?: UnavailableReason;
  sync_status: SyncStatusData;
}

function getImplLinks(props: LinksRowProps) {
  const baseUrl = explorerUrls[props.network];
  const dethBaseUrl = dethExplorerUrls[props.network];
  const oldImplCodeLink = `${dethBaseUrl}/address/${props.oldImpl}`;
  const currentImplCodeLink = `${dethBaseUrl}/address/${props.currentImpl}`;
  const currentImplLink = `${baseUrl}/address/${props.currentImpl}`;
  const prevImplLink = `${baseUrl}/address/${props.oldImpl}`;

  const oldImplCodeElement = props.oldImpl ? (
    <a target="_blank" href={oldImplCodeLink}>
      Old code
    </a>
  ) : (
    <></>
  );
  const currentImplCodeElement = props.currentImpl ? (
    <a target="_blank" href={currentImplCodeLink}>
      Target code
    </a>
  ) : (
    <></>
  );
  const oldImplBlockExplorerElement = props.oldImpl ? (
    <a target="_blank" href={prevImplLink}>
      View old impl. contract
    </a>
  ) : (
    <></>
  );
  const currentImplBlockExplorerElement = props.currentImpl ? (
    <a target="_blank" href={currentImplLink}>
      View target impl. contract
    </a>
  ) : (
    <></>
  );

  if (!props.unavailable) {
    return (
      <>
        {oldImplCodeElement}
        {currentImplCodeElement}
      </>
    );
  }

  if (props.unavailable_reason === "INITIALIZATION") {
    return currentImplCodeElement;
  } else if (props.unavailable_reason === "INITIALIZATION_UNVERIFIED") {
    return currentImplBlockExplorerElement;
  } else if (props.unavailable_reason === "PREVIOUS_UNAVAILABLE") {
    return (
      <>
        {oldImplBlockExplorerElement}
        {currentImplCodeElement}
      </>
    );
  } else if (props.unavailable_reason === "TARGET_UNAVAILABLE") {
    return (
      <>
        {oldImplCodeElement}
        {currentImplBlockExplorerElement}
      </>
    );
  } else if (props.unavailable_reason === "PREVIOUS_EQUALS_TARGET") {
    return currentImplCodeElement;
  } else if (props.unavailable_reason === "PREVIOUS_AND_TARGET_UNAVAILABLE") {
    return (
      <>
        {oldImplBlockExplorerElement}
        {currentImplBlockExplorerElement}
      </>
    );
  } else if (props.unavailable_reason === "REMOVED") {
    return <>{oldImplBlockExplorerElement}</>;
  }
  return <></>;
}

const Links = (props: LinksRowProps) => {
  const baseUrl = explorerUrls[props.network];
  const currentBlockExplorer = `${baseUrl}/address/${props.address}`;
  const currentBlockExplorerTx = `${baseUrl}/tx/${props.transaction_hash}`;

  return (
    <div className="links_row">
      {getImplLinks(props)}
      {props.transaction_hash ? (
        <a target="_blank" href={currentBlockExplorerTx}>
          View upgrade tx
        </a>
      ) : (
        <></>
      )}
      <a target="_blank" href={currentBlockExplorer}>
        View proxy contract
      </a>
      <div style={{ flex: 1 }}></div>
      <SyncStatus {...props.sync_status} />
    </div>
  );
};

export const LinksRow = (props: LinksRowProps) => {
  return <Links {...props} />;
};
