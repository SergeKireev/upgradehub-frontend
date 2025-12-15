import { Breadcrumb, Col, Layout, Row } from "antd";
import { Header } from "antd/es/layout/layout";
import React from "react";
import { HTMLProps } from "react";
import { TwitterOutlined, GithubOutlined } from "@ant-design/icons";

export interface BreadcrumbProps {
  getItems: () => any;
}

export interface WithBreadcrumb {
  breadcrumb?: BreadcrumbProps;
}

export const AppLayout = (props: HTMLProps<void> & WithBreadcrumb) => {
  return (
    <Layout className="content">
      <Header className="header">
        <div>
          <Row>
            <Col>
              <a href="/">
                <Row>
                  <img src="/assets/logo.png" className="logo" />
                  <div className="logo_name">Upgradehub</div>
                </Row>
              </a>
            </Col>
            <Col className="space_header">.</Col>
          </Row>
        </div>
      </Header>
      {props.breadcrumb ? (
        <Breadcrumb
          className="app_breadcrumb"
          items={props.breadcrumb.getItems()}
        />
      ) : (
        <></>
      )}
      {props.children}
    </Layout>
  );
};
