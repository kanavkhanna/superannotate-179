"use client"

import { useState } from "react"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Item } from "@/components/packing-list-organizer"

interface ItemListProps {
  categoryId: string
  items: Item[]
  onAddItem: (name: string) => void
  onToggleItem: (itemId: string) => void
  onDeleteItem: (itemId: string) => void
}

export function ItemList({ categoryId, items, onAddItem, onToggleItem, onDeleteItem }: ItemListProps) {
  const [newItemName, setNewItemName] = useState("")
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [itemNameToDelete, setItemNameToDelete] = useState<string>("")
  const [inputError, setInputError] = useState<string | null>(null)

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      setInputError("Item name cannot be empty")
      return
    }

    // Check for duplicate item names
    const isDuplicate = items.some((item) => item.name.toLowerCase() === newItemName.trim().toLowerCase())

    if (isDuplicate) {
      setInputError("An item with this name already exists")
      return
    }

    try {
      onAddItem(newItemName)
      setNewItemName("")
      setInputError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add item"
      setInputError(errorMessage)
      toast.error("Failed to add item", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleDeleteItem = (itemId: string, itemName: string) => {
    setItemToDelete(itemId)
    setItemNameToDelete(itemName)
  }

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      try {
        onDeleteItem(itemToDelete)
        setItemToDelete(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete item"
        toast.error("Failed to delete item", {
          description: errorMessage,
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    }
  }

  return (
    <div className="space-y-4 pt-4 pb-4 px-4">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="w-full">
          <Input
            placeholder="Add new item..."
            value={newItemName}
            onChange={(e) => {
              setNewItemName(e.target.value)
              setInputError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddItem()
              }
            }}
            className={`flex-1 border-primary/20 focus-visible:ring-primary/30 bg-background/80 ${
              inputError ? "border-destructive focus-visible:ring-destructive/30" : ""
            }`}
            aria-label="New item name"
          />
          {inputError && <p className="text-destructive text-sm mt-1">{inputError}</p>}
        </div>
        <Button
          size="sm"
          onClick={handleAddItem}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-colors shadow-sm"
          aria-label={`Add ${newItemName || "new item"}`}
        >
          <Plus className="h-4 w-4 mr-1" /> <span>Add</span>
        </Button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-md border border-transparent transition-all duration-200 ${
                item.packed ? "bg-primary/10 border-primary/20" : "hover:bg-muted/30 hover:border-primary/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={item.packed}
                  onCheckedChange={() => onToggleItem(item.id)}
                  aria-label={`Mark ${item.name} as ${item.packed ? "unpacked" : "packed"}`}
                  className={`${item.packed ? "border-primary bg-primary text-primary-foreground" : "border-foreground/50"} transition-colors`}
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className={`text-sm font-medium cursor-pointer transition-all ${
                    item.packed ? "line-through text-foreground/70" : "text-foreground"
                  }`}
                >
                  {item.name}
                </label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteItem(item.id, item.name)}
                className="h-7 w-7 opacity-70 hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-sm text-foreground text-center py-6 border border-dashed border-foreground/20 rounded-md">
            No items yet. Add an item to get started.
          </div>
        )}
      </div>

      <Dialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] border-destructive/20">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Item</DialogTitle>
            <DialogDescription className="text-foreground">
              Are you sure you want to delete "{itemNameToDelete}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setItemToDelete(null)}
              aria-label={`Cancel deleting ${itemNameToDelete}`}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteItem} aria-label={`Delete ${itemNameToDelete}`}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

