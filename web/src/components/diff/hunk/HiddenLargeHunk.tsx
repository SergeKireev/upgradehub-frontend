import React, { HTMLProps } from "react";

import { HunkObject } from "./ExpandableHunk";
import { Hunk, Decoration } from "react-diff-view";
import { Col } from "antd";

interface HiddenLargeHunkProps {
  hunk: HunkObject;
  updateHunk: (hunk: HunkObject) => void;
  isLast: boolean;
}

export const HiddenLargeHunk = (
  props: HiddenLargeHunkProps & HTMLProps<void>,
) => {
  const setExpanded = () => {
    const newHunk = {
      ...props.hunk,
      expanded: true,
    };
    props.updateHunk(newHunk);
  };

  const HUNK_SIZE_LIMIT = 200;
  const roundedClass = props.isLast ? "last-hunk-expand" : "";
  if (props.hunk.changes.length < HUNK_SIZE_LIMIT || props.hunk.expanded)
    return <>{props.children}</>;
  else {
    return (
      <Decoration key={props.hunk.content}>
        <div
          className={`hunk-expand-too-large ${roundedClass}`}
          onClick={setExpanded}
        >
          <Col
            className="hunk-expand-too-large-icon-container"
            span={8}
            offset={8}
          >
            Large diff collapsed, click to show
          </Col>
        </div>
      </Decoration>
    );
  }
};
