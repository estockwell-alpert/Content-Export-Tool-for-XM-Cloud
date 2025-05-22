import { IInstance } from '@/models/IInstance';
import { GetItemChildren, IContentNode } from '@/services/sitecore/contentExportToolUtil';
import { convertStringToGuid } from '@/services/sitecore/helpers';
import cn from 'classnames';
import React, { FC } from 'react';

interface ContentNodeProps {
  item: IContentNode;
  activeInstance?: IInstance;
  selectNode: (e: any) => void;
  currentSelections: IContentNode[];
  templatesOnly?: boolean;
}

export const ContentNode: FC<ContentNodeProps> = ({
  item,
  activeInstance,
  selectNode,
  currentSelections,
  templatesOnly,
}) => {
  const [children, setChildren] = React.useState([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

  const toggleNode = async (e: any) => {
    if (!activeInstance) return;
    if (!isLoaded) {
      const id = e.target.parentElement.getAttribute('data-id');
      const results = await GetItemChildren(activeInstance, id);
      const children = results.children;
      console.log(children);

      setChildren(children);
      setIsLoaded(true);
      setIsOpen(true);
    } else {
      if (isOpen) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    }
  };

  const isSelected = () => {
    const isSelected = currentSelections.some((node) => node.itemId === convertStringToGuid(item.itemId));
    return isSelected;
  };

  const isSelectable = !templatesOnly || item.template?.name === 'Template';

  return (
    <li data-name={item.name} data-id={item.itemId}>
      {item.hasChildren && (!templatesOnly || !isSelectable) && (
        <a className="browse-expand" onClick={(e) => toggleNode(e)}>
          {isOpen ? '-' : '+'}
        </a>
      )}
      <a
        className={cn('sitecore-node', isSelected() ? 'selected' : '', !isSelectable ? 'not-selectable' : '')}
        onDoubleClick={(e) => selectNode(e)}
      >
        {item.name}
      </a>

      <ul id={item.itemId} className={isOpen ? 'open' : ''}>
        {children &&
          children.map((child, index) => (
            <ContentNode
              key={index}
              item={child}
              selectNode={selectNode}
              activeInstance={activeInstance}
              currentSelections={currentSelections}
              templatesOnly={templatesOnly}
            ></ContentNode>
          ))}
      </ul>
    </li>
  );
};
