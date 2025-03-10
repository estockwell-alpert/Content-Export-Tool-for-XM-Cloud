'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ITreeItem } from '@/models/ITreeItem';
import { ChevronDown, ChevronRight, Copy, Edit, MoreHorizontal, Plus, Trash } from 'lucide-react';
import { useState } from 'react';

interface ItemListingComponentProps {
  data: ITreeItem[];
}

const initialData: ITreeItem[] = [
  {
    id: '1',
    name: 'Home',
    children: [
      {
        id: '1-1',
        name: 'About Us',
      },
      {
        id: '1-2',
        name: 'Product Development',
        children: [
          { id: '1-2-1', name: 'Engineering' },
          {
            id: '1-2-2',
            name: 'Design',
            children: [
              { id: '1-2-2-1', name: 'UI Design' },
              { id: '1-2-2-2', name: 'UX Research' },
            ],
          },
          { id: '1-2-3', name: 'QA' },
        ],
      },
      {
        id: '1-3',
        name: 'Marketing',
        children: [
          { id: '1-3-1', name: 'Digital Marketing' },
          { id: '1-3-2', name: 'Content Creation' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Project Roadmap',
    children: [
      { id: '2-1', name: 'Q1 Goals' },
      { id: '2-2', name: 'Q2 Goals' },
      { id: '2-3', name: 'Q3 Goals' },
      { id: '2-4', name: 'Q4 Goals' },
    ],
  },
];

export const ItemListingComponent: React.FC<ItemListingComponentProps> = ({ data }) => {
  const [componentData, setComponentData] = useState<ITreeItem[]>(data);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1', '1-1', '1-2']));
  const [editItem, setEditItem] = useState<ITreeItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [addingToParentId, setAddingToParentId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Toggle expanded state
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Find an item by ID in the tree
  const findItemById = (items: ITreeItem[], id: string): ITreeItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Update an item in the tree
  const updateItem = (items: ITreeItem[], id: string, newName: string): ITreeItem[] => {
    return items.map((item) => {
      if (item.id === id) {
        return { ...item, name: newName };
      }
      if (item.children) {
        return {
          ...item,
          children: updateItem(item.children, id, newName),
        };
      }
      return item;
    });
  };

  // Delete an item from the tree
  const deleteItem = (items: ITreeItem[], id: string): ITreeItem[] => {
    return items.filter((item) => {
      if (item.id === id) return false;
      if (item.children) {
        item.children = deleteItem(item.children, id);
      }
      return true;
    });
  };

  // Add a new item to the tree
  const addItem = (items: ITreeItem[], parentId: string, newItem: ITreeItem): ITreeItem[] => {
    return items.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newItem],
        };
      }
      if (item.children) {
        return {
          ...item,
          children: addItem(item.children, parentId, newItem),
        };
      }
      return item;
    });
  };

  // Handle edit submission
  const handleEditSubmit = () => {
    if (editItem && newItemName.trim()) {
      setComponentData(updateItem(data, editItem.id, newItemName));
      setEditItem(null);
      setNewItemName('');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteItemId) {
      setComponentData(deleteItem(data, deleteItemId));
      setDeleteItemId(null);
    }
  };

  // Handle add new item
  const handleAddItem = () => {
    if (addingToParentId && newItemName.trim()) {
      const newId = `${addingToParentId}-${Date.now()}`;
      const newItem: ITreeItem = { id: newId, name: newItemName };
      setComponentData(addItem(data, addingToParentId, newItem));
      setAddingToParentId(null);
      setNewItemName('');
      // Expand the parent to show the new item
      setExpandedItems(new Set([...expandedItems, addingToParentId]));
    }
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems);

    if (checked) {
      newCheckedItems.add(id);
    } else {
      newCheckedItems.delete(id);
    }

    setCheckedItems(newCheckedItems);
  };

  // Recursive component to render tree items
  const TreeItemComponent: React.FC<{ item: ITreeItem; level?: number }> = ({ item, level = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div className="tree-item">
        <div
          className="flex items-center py-2 hover:bg-muted/50 rounded-md px-2"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(item.id)}
              className="mr-1 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-5 mr-1"></div>
          )}

          <Checkbox
            id={`checkbox-${item.id}`}
            checked={checkedItems.has(item.id)}
            onCheckedChange={(checked) => handleCheckboxChange(item.id, checked === true)}
            className="mr-2"
          />

          <span className="flex-grow font-medium">{item.name}</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Dialog
                open={editItem?.id === item.id}
                onOpenChange={(open) => {
                  if (!open) setEditItem(null);
                }}
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setEditItem(item);
                      setNewItemName(item.name);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                    <DialogDescription>Change the name of this item.</DialogDescription>
                  </DialogHeader>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="mt-4"
                    placeholder="Item name"
                  />
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setEditItem(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditSubmit}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={addingToParentId === item.id}
                onOpenChange={(open) => {
                  if (!open) setAddingToParentId(null);
                }}
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setAddingToParentId(item.id);
                      setNewItemName('');
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add Child</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                    <DialogDescription>
                      Add a new child item to "{item.name}
                      ".
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="mt-4"
                    placeholder="New item name"
                  />
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setAddingToParentId(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  // Clone functionality could be implemented here
                  alert(`Clone functionality for "${item.name}" would be implemented here`);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                <span>Clone</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <AlertDialog
                open={deleteItemId === item.id}
                onOpenChange={(open) => {
                  if (!open) setDeleteItemId(null);
                }}
              >
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => {
                      e.preventDefault();
                      setDeleteItemId(item.id);
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{item.name}"{hasChildren ? ' and all its children' : ''}. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteConfirm}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children">
            {item.children!.map((child) => (
              <TreeItemComponent key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hierarchical Tree Listing</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Root Item
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-card">
        <div className="tree-container">
          {data.map((item) => (
            <TreeItemComponent key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
