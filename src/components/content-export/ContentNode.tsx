import { IInstance } from '@/models/IInstance';
import { GetItemChildren, IContentNode } from '@/services/sitecore/contentExportToolUtil';
import React, { FC } from 'react';

interface ContentNodeProps {
  item: IContentNode;
  activeInstance?: IInstance;
  selectNode: (e: any) => void;
}

export const ContentNode: FC<ContentNodeProps> = ({ item, activeInstance, selectNode }) => {
  const [children, setChildren] = React.useState([]);

  const toggleNode = async (e: any) => {
    if (!activeInstance) return;
    if (!e.target.classList.contains('loaded')) {
      const id = e.target.parentElement.getAttribute('data-id');
      const results = await GetItemChildren(activeInstance, id);
      const children = results.children;
      console.log(children);

      setChildren(children);

      e.target.classList.add('loaded');
      e.target.classList.add('open');
    } else {
      if (e.target.classList.contains('open')) {
        e.target.classList.remove('open');
      } else {
        e.target.classList.add('open');
      }
    }
  };

  return (
    <li data-name={item.name} data-id={item.itemId}>
      <a className="browse-expand" onClick={(e) => toggleNode(e)}></a>
      <a className="sitecore-node" onDoubleClick={(e) => selectNode(e)}>
        {item.name}
      </a>
      <ul id={item.itemId}>
        {children &&
          children.map((child, index) => (
            <ContentNode key={index} item={child} selectNode={selectNode} activeInstance={activeInstance}></ContentNode>
          ))}
      </ul>
    </li>
  );
};
