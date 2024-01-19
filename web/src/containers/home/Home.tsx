import React, { useState } from "react";
import { Button, Col, Form, Input, Select } from "antd";
import { AppLayout } from "../common/AppLayout";
import { Navigate } from "react-router-dom";

export const HomeContent = () => {
  const [redirectUrl, setRedirectUrl] = useState(undefined);
  const onFinish = (val: any) => {
    const url = `/diffs/${val.network}/${val.address}`;
    setRedirectUrl(url);
  };
  document.title = 'Upgradehub - Home';
  if (!redirectUrl) {
    return (
      <AppLayout>
        <div className="home_content">
          <Col offset={8} span={8}>
            <Form
              className="home_form"
              name="form_item_path"
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                network: "etherscan",
                address: "0x2e1db01f87ab645321cb12048bbab8a9538c61cc",
              }}
            >
              <Form.Item name="network" label="Network">
                <Select
                  options={[
                    { value: "etherscan", label: "Ethereum" },
                    { value: "bscscan", label: "BSC" },
                    { value: "ftmscan", label: "Fantom" },
                    { value: "polygonscan", label: "Polygon" },
                    { value: "arbiscan", label: "Arbitrum" },
                    { value: "snowtrace", label: "Avalanche" },
                    { value: "cronoscan", label: "Cronos" },
                    { value: "moonbeam", label: "Moonbeam" },
                    { value: "optimistic.etherscan", label: "Optimism" },
                  ]}
                />
              </Form.Item>
              <Form.Item name="address" label="Contract address">
                <Input placeholder={"Address of a proxy"} />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Go
              </Button>
            </Form>
          </Col>
        </div>
      </AppLayout>
    );
  } else {
    return <Navigate replace to={redirectUrl} />;
  }
};
