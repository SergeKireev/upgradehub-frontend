import { Card, Divider, List, Space, Tag } from "antd";
import React, { HTMLProps, useState } from "react";
import { Navigate, Route } from "react-router-dom";
import { SelectedBucket } from "../../app";
import { FacetCutSelectorAction } from "../../lib/diamond/facet_utils";
import {
  CategorizedSelectorBuckets,
  DiamondData,
  SelectorsBucket,
} from "./DiamondPage";
import { SelectorList } from "./SelectorList";

type CasedNamesIndex = { [lowerCase: string]: string };

interface FacetSelectorProps {
  diamondData: DiamondData;
  buckets: CategorizedSelectorBuckets;
  casedNamesIndex: CasedNamesIndex;
}

interface ActionBadgesProps {
  actions: FacetCutSelectorAction[];
}

function getActionLabel(a: number) {
  switch (a) {
    case 0:
      return "add";
    case 1:
      return "replace";
    case 2:
      return "remove";
  }
}

function getActionColor(a: number) {
  switch (a) {
    case 0:
      return "green";
    case 1:
      return "blue";
    case 2:
      return "red";
  }
}

export const RenderActionBadges = (props: ActionBadgesProps) => {
  return (
    <Space>
      {props.actions.map((a, i) => {
        return (
          <Tag key={`${i}`} color={getActionColor(a.action)}>
            {getActionLabel(a.action)}
          </Tag>
        );
      })}
    </Space>
  );
};

export const renderBucket = (
  bucket: SelectorsBucket,
  index: number,
  facetName: string,
  setSelected: (selected: SelectedBucket) => void,
) => {
  return (
    <List.Item className="facet_selector" key={bucket[0]}>
      <a
        className="facet_selector_item"
        onClick={() =>
          setSelected({
            groupIndex: index + 1,
            facetName: facetName,
          })
        }
      >
        <List.Item.Meta
          title={
            <div>
              {`Group ${index + 1}`}{" "}
              <RenderActionBadges actions={bucket.actions} />
            </div>
          }
          description={<SelectorList selectors={bucket.selectors} />}
        />
      </a>
    </List.Item>
  );
};

export const renderBucketsInFacets = (
  categorized: CategorizedSelectorBuckets,
  setSelected: (selected: SelectedBucket) => void,
  casedNamesIndex: CasedNamesIndex,
) => {
  return (
    <Space direction="vertical">
      {Object.keys(categorized).map((facetName, i) => {
        const buckets = categorized[facetName];
        return (
          <Card
            className="facet_selector_card"
            key={`${facetName}${i}`}
            title={
              <div className="facet_selector_title">
                {casedNamesIndex[facetName]}
              </div>
            }
          >
            <List
              dataSource={buckets || []}
              renderItem={(bucket: SelectorsBucket, index) =>
                renderBucket(bucket, index, facetName, setSelected)
              }
            />
          </Card>
        );
      })}
    </Space>
  );
};

export const FacetSelector = (props: HTMLProps<void> & FacetSelectorProps) => {
  const [selected, setSelected] = useState<SelectedBucket>(undefined);
  return selected === undefined ? (
    renderBucketsInFacets(props?.buckets, setSelected, props.casedNamesIndex)
  ) : (
    <Navigate to={`${selected.facetName}/${selected.groupIndex}`} />
  );
};
