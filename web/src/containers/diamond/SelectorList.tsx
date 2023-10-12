import React, { HTMLProps } from "react";
import { Col, Row } from "antd";

interface SelectorListProps {
  selectors: string[];
}

function orderByLength(a: string, b: string) {
  const _a = a.length > 50;
  const _b = b.length > 50;
  if (_a > _b) return 1;
  else if (_a < _b) {
    return -1;
  } else {
    return 0;
  }
}

function colSizeByLength(s: string) {
  if (s.length > 50) {
    return 12;
  } else {
    return 6;
  }
}

export const SelectorList = (props: SelectorListProps & HTMLProps<void>) => {
  const _selectors = props.selectors.sort(orderByLength);
  return (
    <Row className={props.className}>
      {_selectors.map((name) => {
        return (
          <Col span={colSizeByLength(name)} key={`${name}_`}>
            <div className="diamond_selector_name">{name}</div>
          </Col>
        );
      })}
    </Row>
  );
};
