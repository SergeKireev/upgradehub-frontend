import { Skeleton, Space } from "antd";
import React from "react";

export const SelectorSkeleton = () => {
  return (
    <>
      <Space direction="vertical">
        <Skeleton.Input size="large" />
        <Skeleton.Input size="large" />
        <Skeleton.Input size="large" />
        <Skeleton.Input size="large" />
      </Space>
    </>
  );
};
