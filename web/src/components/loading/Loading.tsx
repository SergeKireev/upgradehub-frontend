import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Col, Row, Space, Spin } from "antd";

interface LoadingProps {
  message: string;
}

export const Loading = (props: LoadingProps) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 60 }} spin />;
  return (
    <div style={{ background: "white" }}>
      <Col span={8} offset={8}>
        <div className="loading_content">
          <Spin size="large" indicator={antIcon} />
          <div>{props.message}</div>
        </div>
      </Col>
    </div>
  );
};
