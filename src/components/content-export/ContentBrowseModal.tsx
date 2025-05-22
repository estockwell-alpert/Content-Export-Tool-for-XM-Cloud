import { IInstance } from '@/models/IInstance';
import { IContentNode } from '@/services/sitecore/contentExportToolUtil';
import { stripGuid } from '@/services/sitecore/helpers';
import { Dispatch, FC, SetStateAction } from 'react';
import { Button } from '../ui/button';
import { ContentNode } from './ContentNode';

interface ContentBrowseModalProps {
  activeInstance?: IInstance;
  selectNode: (e: any) => void;
  currentSelections: IContentNode[];
  browseContentOpen: boolean;
  setBrowseContentOpen: Dispatch<SetStateAction<boolean>>;
  startItem: string;
  setStartItem: Dispatch<SetStateAction<string>>;
}

export const ContentBrowseModal: FC<ContentBrowseModalProps> = ({
  activeInstance,
  selectNode,
  currentSelections,
  browseContentOpen,
  setBrowseContentOpen,
  startItem,
  setStartItem,
}) => {
  const confirmSelection = () => {
    let startItems = startItem?.split(',');
    let newIds = currentSelections
      ?.map((item) => item.itemId.trim())
      .filter((newId) => !startItems.some((startId) => stripGuid(startId) === stripGuid(newId)));

    console.log('Preexisting Start Items: ');
    console.log(startItems);
    console.log('New Ids: ');
    console.log(newIds);

    let udpatedStartItems = startItems.concat(newIds);
    setStartItem(udpatedStartItems?.join(', '));
    setBrowseContentOpen(false);
  };

  return (
    <>
      <div id="content-tree" className={'content-tree ' + (browseContentOpen ? 'open' : '')}>
        <div className="inner">
          <div className="browse-box">
            <ul>
              <ContentNode
                item={{
                  itemId: '{11111111-1111-1111-1111-111111111111}',
                  name: 'sitecore',
                  children: [],
                  hasChildren: true,
                }}
                activeInstance={activeInstance}
                selectNode={selectNode}
                currentSelections={currentSelections ?? []}
              ></ContentNode>
            </ul>
          </div>
          <div className="selected-box">
            <div className="selected-inner">
              <div className="flex justify-between gap-2">
                <ul>
                  {currentSelections && (
                    <li>
                      <b>selected:</b>
                    </li>
                  )}
                  {currentSelections &&
                    currentSelections?.map((item, index) => (
                      <li data-id={item.itemId} data-name={item.name} key={index}>
                        {item.name}
                      </li>
                    ))}
                </ul>
                <Button variant="ghost" size="sm" onClick={() => setBrowseContentOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="default" size="sm" onClick={confirmSelection}>
                  Confirm Selections
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
