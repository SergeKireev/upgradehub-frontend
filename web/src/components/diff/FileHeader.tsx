import React from "react";
import { trimFilePath } from "../../lib/utils/format";
import { Collapse } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { POPULAR_LIBRARIES } from "../../lib/utils/constants";

interface FileHeaderProps {
  oldPath: string;
  newPath: string;
  type: string;
  child: React.ReactNode;
}

function filterOutPopularLibraries(path: string) {
  const hasPopularLibrary = POPULAR_LIBRARIES.reduce((hasPopular, keyword) => {
    return hasPopular || path.indexOf(keyword) !== -1;
  }, false);
  return hasPopularLibrary;
}

function buildTitle(oldPath: string, newPath: string, type: string) {
    const _oldPath = trimFilePath(oldPath);
    const _newPath = trimFilePath(newPath);
    if (type === 'rename') {
        return `Moved ${_oldPath} -> ${_newPath}`;
    } else if (type === 'delete') {
        return `Deleted ${_oldPath}`;
    } else {
        return `${_newPath}`;
    }
}

function isCollapsible(type: string) {
    return type === 'modify' || type === 'add';
}

export const FileHeader = (props: FileHeaderProps) => {
  const title = buildTitle(props.oldPath, props.newPath, props.type);
  const header = <div>{title}</div>;
  const defaultActiveKey = filterOutPopularLibraries(title)
    ? undefined
    : props.oldPath;
  return (
    <Collapse
      collapsible={isCollapsible(props.type) ? "header" : "disabled"}
      defaultActiveKey={defaultActiveKey}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined
          style={{ color: "white" }}
          rotate={isActive ? 90 : 0}
        />
      )}
    >
      <Collapse.Panel
        showArrow={isCollapsible(props.type)}
        className="file_header"
        header={header}
        key={props.oldPath}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {props.child}
        </div>
      </Collapse.Panel>
    </Collapse>
  );
};
