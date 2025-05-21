import { IInstance } from '@/models/IInstance';
import { GetItemChildren, IContentNode } from '@/services/sitecore/contentExportToolUtil';
import { convertStringToGuid } from '@/services/sitecore/helpers';
import React, { FC } from 'react';

interface ContentNodeProps {
  item: IContentNode;
  activeInstance?: IInstance;
  selectNode: (e: any) => void;
  currentSelections: IContentNode[];
}

export const ContentNode: FC<ContentNodeProps> = ({ item, activeInstance, selectNode, currentSelections }) => {
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

  const isSelected = () => {
    const isSelected = currentSelections.some((node) => node.itemId === convertStringToGuid(item.itemId));
    console.log('Is ' + item.name + ' selected: ' + isSelected);
    return isSelected;
  };

  return (
    <li data-name={item.name} data-id={item.itemId}>
      {item.hasChildren && <a className="browse-expand" onClick={(e) => toggleNode(e)}></a>}
      <a className={'sitecore-node ' + (isSelected() ? 'selected' : '')} onDoubleClick={(e) => selectNode(e)}>
        {item.name}
      </a>
      <ul id={item.itemId}>
        {children &&
          children.map((child, index) => (
            <ContentNode
              key={index}
              item={child}
              selectNode={selectNode}
              activeInstance={activeInstance}
              currentSelections={currentSelections}
            ></ContentNode>
          ))}
      </ul>
    </li>
  );
};
