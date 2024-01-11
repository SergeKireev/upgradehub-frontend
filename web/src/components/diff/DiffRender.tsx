import { ApiName, fetchFiles } from "ethereum-sources-downloader";
import React, { useEffect, useMemo, useState } from "react";
import { tokenize, parseDiff, Diff, Decoration } from "react-diff-view";
import { ExpandableHunk, HunkObject } from "./hunk/ExpandableHunk";
import { RegularHunk } from "./hunk/RegularHunk";
import * as refractor from "refractor";
import { v4 as uuidv4 } from "uuid";

const trimFilePath = (filePath: string) => {
  const fragments = filePath.split("/");
  return fragments.slice(3).join("/");
};

interface DiffRenderProps {
  address: string;
  network: string;
  diff?: string;
}

async function fetchOldCode(
  network: string,
  address: string,
  setOldCode: (codeFetchResult: any) => void,
) {
  /**
   * Everything should be fine since we have already check the source
   * has verified code and is not a proxy
   */
  const response = await fetchFiles(network as ApiName, address);
  setOldCode(response);
}

function buildHunk(
  hunk: HunkObject,
  fileLines?: string[],
  isLast?: boolean,
  updateHunk?: (hunk: HunkObject) => void,
) {
  if (fileLines) {
    return (
      <ExpandableHunk
        key={hunk.content}
        hunk={hunk}
        fileLines={fileLines}
        isLast={isLast}
        updateHunk={updateHunk}
      />
    );
  } else {
    return <RegularHunk key={hunk.content} hunk={hunk} isLast={isLast} />;
  }
}

const renderToken = (token, defaultRender, i) => {
  switch (token.type) {
    default:
      return defaultRender(token, i);
  }
};

function findLinesInCodeResult(oldCode: any, fileName: string) {
  const emptyOldCode = {
    files: {},
  };
  const key = Object.keys((oldCode || emptyOldCode).files).find((x) => {
    return x.trim() === fileName.trim();
  });
  const fileContent = (oldCode || emptyOldCode).files[key];
  const fileLines = fileContent?.split("\n");
  return fileLines;
}

interface RenderDiffProps {
  hunks: any[];
  oldCode: string;
  oldPath: string;
  oldRevision: string;
  newRevision: string;
  diffType: string;
}

const mergeHunks = (hunkA: HunkObject, hunkB: HunkObject) => {
  let _hunkA = hunkA;
  let _hunkB = hunkB;
  if (hunkA.oldStart > hunkB.oldStart) {
    let tmp = _hunkA;
    _hunkA = hunkB;
    _hunkB = tmp;
  }

  const newOldLineNumberIndex = _hunkA.changes.findIndex(
    (x) => x.oldLineNumber === _hunkB.oldStart,
  );
  const newChanges = _hunkA.changes
    .slice(0, newOldLineNumberIndex)
    .concat(_hunkB.changes);

  const result: HunkObject = {
    ..._hunkA,
    newLines: _hunkB.newStart - _hunkA.newStart + _hunkB.newLines,
    oldLines: _hunkB.oldStart - _hunkA.oldStart + _hunkB.oldLines,
    newStart: _hunkA.newStart,
    oldStart: _hunkA.oldStart,
    changes: newChanges,
  };
  return result;
};

const deduplicateHunks = (hunks: HunkObject[], updatedId: string) => {
  const updatedHunk = hunks.find((x) => x.id === updatedId);
  const overlapping = hunks.find((x) => {
    return (
      x.id != updatedId &&
      ((x.oldStart >= updatedHunk.oldStart &&
        x.oldStart <= updatedHunk.oldStart + updatedHunk.oldLines) ||
        (updatedHunk.oldStart >= x.oldStart &&
          x.oldStart + x.oldLines >= updatedHunk.oldStart))
    );
  });
  if (overlapping) {
    const _hunks = hunks
      .filter((x) => {
        return x.id != updatedId && x.id != overlapping.id;
      })
      .concat([mergeHunks(updatedHunk, overlapping)]);
    _hunks.sort((a, b) => a.oldStart - b.oldStart);
    return _hunks;
  } else {
    return hunks;
  }
};

const RenderDiff = (props: RenderDiffProps) => {
  const _hunks = props.hunks.map((x) => {
    return {
      ...x,
      id: uuidv4(),
    };
  });
  const [hunks, setHunks] = useState(_hunks);

  const tokens = tokenize(hunks, {
    highlight: true,
    refractor: refractor,
    language: "sol",
    oldCode: props.oldCode,
  });

  const updateHunk = (hunk: HunkObject) => {
    let newHunks = JSON.parse(JSON.stringify(hunks));
    newHunks = newHunks.map((x) => {
      if (x.id == hunk.id) {
        return hunk;
      } else {
        return x;
      }
    });
    const _newHunks = JSON.parse(
      JSON.stringify(deduplicateHunks(newHunks, hunk.id)),
    );
    setHunks(_newHunks);
  };

  return (
    <Diff
      key={props.oldRevision + "-" + props.newRevision}
      viewType="split"
      diffType={props.diffType}
      tokens={tokens}
      renderToken={renderToken}
      hunks={hunks}
    >
      {(hunks) => {
        return hunks
          .map((hunk, i) => [
            <Decoration key={`${hunk.content}-decoration`}>
              <div className="hunk-header">
                {`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`}
              </div>
            </Decoration>,
            buildHunk(
              hunk,
              findLinesInCodeResult(props.oldCode, trimFilePath(props.oldPath)),
              i === hunks.length - 1,
              updateHunk,
            ),
          ])
          .flat();
      }}
    </Diff>
  );
};

export function DiffRender(props: DiffRenderProps) {
  const diffText = props.diff;
  const [oldCode, setOldCode] = useState(undefined);

  useEffect(() => {
    fetchOldCode(props.network, props.address, setOldCode);
  }, [setOldCode]);

  const files = parseDiff(diffText);
  //Leave error.md only if it is the only file
  const filesWithoutError =
    files.length > 1
      ? files.filter((f) => !f.newPath.includes("error.md"))
      : files;

  const renderFile = ({
    oldPath,
    newPath,
    oldRevision,
    newRevision,
    type,
    hunks,
  }) => (
    <div key={trimFilePath(newPath)} className="file_change">
      <div className="file_header">{trimFilePath(newPath)}</div>
      <RenderDiff
        hunks={hunks}
        oldCode={oldCode}
        oldPath={oldPath}
        oldRevision={oldRevision}
        newRevision={newRevision}
        diffType={type}
      />
    </div>
  );

  return <>{filesWithoutError.map(renderFile)}</>;
}
