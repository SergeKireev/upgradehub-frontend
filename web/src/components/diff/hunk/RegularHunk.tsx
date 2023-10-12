import React, { useState } from "react";
import { HunkObject } from "./ExpandableHunk";
import { HiddenLargeHunk } from "./HiddenLargeHunk";
import { Hunk } from "react-diff-view";

interface RegularHunkProps {
  hunk: HunkObject;
  isLast: boolean;
}
export const RegularHunk = (props: RegularHunkProps) => {
  const [hunk, setHunk] = useState(props.hunk);
  return (
    <HiddenLargeHunk hunk={hunk} updateHunk={setHunk} isLast={props.isLast}>
      <Hunk key={hunk.content} hunk={hunk} />
    </HiddenLargeHunk>
  );
};
