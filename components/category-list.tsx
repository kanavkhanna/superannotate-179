"use client"

import { useState } from "react"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ItemList } from "@/components/item-list"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Category } from "@/components/packing-list-organizer"

interface CategoryListProps {
  categories: Category[]
  onAddCategory: (name: string) => void
  onDeleteCategory: (id: string) => void
  onAddItem: (categoryId: string, name: string) => void
  onToggleItem: (categoryId: string, itemId: string) => void
  onDeleteItem: (categoryId: string, itemId: string) => void
}

export function CategoryList({
  categories,
  onAddCategory,
  onDeleteCategory,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}: CategoryListProps) {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [categoryNameToDelete, setCategoryNameToDelete] = useState<string>("")
  const [inputError, setInputError] = useState<string | null>(null)

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      setInputError("Category name cannot be empty")
      return
    }

    // Check for duplicate category names
    const isDuplicate = categories.some(
      (category) => category.name.toLowerCase() === newCategoryName.trim().toLowerCase(),
    )

    if (isDuplicate) {
      setInputError("A category with this name already exists")
      return
    }

    try {
      onAddCategory(newCategoryName)
      setNewCategoryName("")
      setInputError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add category"
      setInputError(errorMessage)
      toast.error("Failed to add category", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setCategoryToDelete(categoryId)
    setCategoryNameToDelete(categoryName)
  }

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      try {
        onDeleteCategory(categoryToDelete)
        setCategoryToDelete(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete category"
        toast.error("Failed to delete category", {
          description: errorMessage,
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-primary/10 shadow-sm">
        <div className="w-full">
          <Input
            placeholder="Add new category..."
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.target.value)
              setInputError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddCategory()
              }
            }}
            className={`flex-1 border-primary/20 focus-visible:ring-primary/30 bg-background/80 ${
              inputError ? "border-destructive focus-visible:ring-destructive/30" : ""
            }`}
            aria-label="New category name"
          />
          {inputError && <p className="text-destructive text-sm mt-1">{inputError}</p>}
        </div>
        {/* Add category button */}
        <Button
          onClick={handleAddCategory}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-colors shadow-sm"
          aria-label={`Add ${newCategoryName || "new category"}`}
        >
          <Plus className="h-4 w-4 mr-1" /> <span>Add Category</span>
        </Button>
      </div>

      {categories.length > 0 ? (
        <Accordion type="multiple" defaultValue={categories.map((c) => c.id)} className="space-y-4">
          {categories.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border border-primary/10 rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex items-center justify-between pr-4 bg-gradient-to-r from-primary/5 to-transparent">
                <AccordionTrigger className="flex-1 hover:no-underline px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-primary-foreground bg-primary px-2 py-0.5 rounded-full">
                      {category.items.filter((item) => item.packed).length}/{category.items.length}
                    </span>
                  </div>
                </AccordionTrigger>
                {/* Delete category button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCategory(category.id, category.name)
                  }}
                  className="h-8 w-8 text-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label={`Delete ${category.name} category`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <AccordionContent className="pb-0 pt-0">
                <div className="border-t border-primary/10">
                  <ItemList
                    categoryId={category.id}
                    items={category.items}
                    onAddItem={(name) => onAddItem(category.id, name)}
                    onToggleItem={(itemId) => onToggleItem(category.id, itemId)}
                    onDeleteItem={(itemId) => onDeleteItem(category.id, itemId)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="border-primary/10 shadow-sm text-center py-8">
          <CardContent>
            <p className="text-foreground">No categories yet. Add a category to get started.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={categoryToDelete !== null} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] border-destructive/20">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Category</DialogTitle>
            <DialogDescription className="text-foreground">
              Are you sure you want to delete "{categoryNameToDelete}" and all its items? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            {/* Dialog buttons */}
            <Button
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              aria-label={`Cancel deleting ${categoryNameToDelete} category`}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCategory}
              aria-label={`Delete ${categoryNameToDelete} category`}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

