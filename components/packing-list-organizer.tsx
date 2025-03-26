"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryList } from "@/components/category-list"
import { TripSelector } from "@/components/trip-selector"
import { AddTripDialog } from "@/components/add-trip-dialog"
import { EditTripDialog } from "@/components/edit-trip-dialog"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type Trip = {
  id: string
  name: string
  date: string
  categories: Category[]
}

export type Category = {
  id: string
  name: string
  items: Item[]
}

export type Item = {
  id: string
  name: string
  packed: boolean
}

// Default data to use if no data exists in localStorage
const DEFAULT_TRIPS: Trip[] = [
  {
    id: "default-trip-1",
    name: "Summer Vacation",
    date: "2025-07-15",
    categories: [
      {
        id: "default-category-1",
        name: "Clothing",
        items: [
          { id: "default-item-1", name: "T-shirts", packed: false },
          { id: "default-item-2", name: "Shorts", packed: false },
          { id: "default-item-3", name: "Swimwear", packed: false },
        ],
      },
      {
        id: "default-category-2",
        name: "Toiletries",
        items: [
          { id: "default-item-4", name: "Toothbrush", packed: false },
          { id: "default-item-5", name: "Shampoo", packed: false },
          { id: "default-item-6", name: "Sunscreen", packed: false },
        ],
      },
      {
        id: "default-category-3",
        name: "Electronics",
        items: [
          { id: "default-item-7", name: "Phone charger", packed: false },
          { id: "default-item-8", name: "Camera", packed: false },
          { id: "default-item-9", name: "Power bank", packed: false },
        ],
      },
    ],
  },
  {
    id: "default-trip-2",
    name: "Business Trip",
    date: "2025-09-10",
    categories: [
      {
        id: "default-category-4",
        name: "Clothing",
        items: [
          { id: "default-item-10", name: "Suits", packed: false },
          { id: "default-item-11", name: "Dress shirts", packed: false },
          { id: "default-item-12", name: "Ties", packed: false },
        ],
      },
      {
        id: "default-category-5",
        name: "Documents",
        items: [
          { id: "default-item-13", name: "Passport", packed: false },
          { id: "default-item-14", name: "Business cards", packed: false },
          { id: "default-item-15", name: "Presentation materials", packed: false },
        ],
      },
    ],
  },
]

// Local storage key
const STORAGE_KEY = "packingListTrips"

export function PackingListOrganizer() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)
  const [isAddTripOpen, setIsAddTripOpen] = useState(false)
  const [isEditTripOpen, setIsEditTripOpen] = useState(false)
  const [isDeleteTripOpen, setIsDeleteTripOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load trips from localStorage on initial render
  useEffect(() => {
    try {
      setIsLoading(true)
      const savedTrips = localStorage.getItem(STORAGE_KEY)

      if (savedTrips) {
        // If we have saved trips, use them
        const parsedTrips = JSON.parse(savedTrips)
        setTrips(parsedTrips)
        if (parsedTrips.length > 0) {
          setCurrentTrip(parsedTrips[0])
        }
      } else {
        // If no saved trips, use default data
        setTrips(DEFAULT_TRIPS)
        setCurrentTrip(DEFAULT_TRIPS[0])
        // Save default data to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRIPS))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load trips"
      setError(errorMessage)
      toast.error("Failed to load trips", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })

      // If there's an error, still use default data
      setTrips(DEFAULT_TRIPS)
      setCurrentTrip(DEFAULT_TRIPS[0])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save trips to localStorage whenever they change
  useEffect(() => {
    if (trips.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save trips"
        toast.error("Failed to save changes", {
          description: errorMessage,
          icon: <AlertCircle className="h-5 w-5" />,
        })
      }
    }
  }, [trips])

  // Calculate progress whenever current trip changes
  useEffect(() => {
    if (currentTrip) {
      calculateProgress()
    }
  }, [currentTrip])

  const calculateProgress = () => {
    if (!currentTrip) return 0

    let totalItems = 0
    let packedItems = 0

    currentTrip.categories.forEach((category) => {
      totalItems += category.items.length
      packedItems += category.items.filter((item) => item.packed).length
    })

    const newProgress = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100)
    setProgress(newProgress)
  }

  const handleAddTrip = (newTrip: Trip) => {
    try {
      const updatedTrips = [...trips, newTrip]
      setTrips(updatedTrips)
      setCurrentTrip(newTrip)
      setIsAddTripOpen(false)

      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips))

      toast.success("Trip created", {
        description: `${newTrip.name} has been created successfully`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create trip"
      toast.error("Failed to create trip", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleEditTrip = (updatedTrip: Trip) => {
    try {
      const updatedTrips = trips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
      setTrips(updatedTrips)
      setCurrentTrip(updatedTrip)
      setIsEditTripOpen(false)

      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips))

      toast.success("Trip updated", {
        description: `${updatedTrip.name} has been updated successfully`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update trip"
      toast.error("Failed to update trip", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleDeleteTrip = () => {
    if (!currentTrip) return

    try {
      // Store the trip before deleting for undo functionality
      const deletedTrip = { ...currentTrip }

      // Update state first
      const updatedTrips = trips.filter((trip) => trip.id !== currentTrip.id)
      setTrips(updatedTrips)
      setCurrentTrip(updatedTrips.length > 0 ? updatedTrips[0] : null)
      setIsDeleteTripOpen(false)

      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips))

      // Create an undo function that captures the current state
      const undoDelete = () => {
        const restoredTrips = [...updatedTrips, deletedTrip]
        setTrips(restoredTrips)
        setCurrentTrip(deletedTrip)

        // Save to localStorage immediately
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredTrips))

        toast.success("Trip restored", {
          description: `${deletedTrip.name} has been restored successfully`,
        })
      }

      // Show toast with undo button
      toast.success("Trip deleted", {
        description: `${deletedTrip.name} has been deleted`,
        action: {
          label: "Undo",
          onClick: undoDelete,
        },
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete trip"
      toast.error("Failed to delete trip", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleTripChange = (tripId: string) => {
    try {
      const selected = trips.find((trip) => trip.id === tripId)
      if (selected) {
        setCurrentTrip(selected)
      } else {
        throw new Error("Trip not found")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change trip"
      toast.error("Failed to change trip", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleAddCategory = (categoryName: string) => {
    if (!currentTrip || !categoryName.trim()) return

    try {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: categoryName,
        items: [],
      }

      const updatedTrip = {
        ...currentTrip,
        categories: [...currentTrip.categories, newCategory],
      }

      const updatedTrips = trips.map((trip) => (trip.id === currentTrip.id ? updatedTrip : trip))

      setTrips(updatedTrips)
      setCurrentTrip(updatedTrip)

      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips))

      toast.success("Category added", {
        description: `${categoryName} has been added successfully`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add category"
      toast.error("Failed to add category", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (!currentTrip) return

    try {
      // Find the category before deleting
      const categoryToDelete = currentTrip.categories.find((category) => category.id === categoryId)

      if (categoryToDelete) {
        // Create a copy of the current trip for undo
        const originalTrip = { ...currentTrip }

        // Update state first
        const updatedCategories = currentTrip.categories.filter((category) => category.id !== categoryId)
        const updatedTrip = {
          ...currentTrip,
          categories: updatedCategories,
        }
        const updatedTrips = trips.map((trip) => (trip.id === currentTrip.id ? updatedTrip : trip))

        setTrips(updatedTrips)
        setCurrentTrip(updatedTrip)

        // Save to localStorage immediately
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips))

        // Create an undo function that captures the current state
        const undoDelete = () => {
          const restoredTrip = originalTrip
          const restoredTrips = trips.map((trip) => (trip.id === restoredTrip.id ? restoredTrip : trip))

          setTrips(restoredTrips)
          setCurrentTrip(restoredTrip)

          // Save to localStorage immediately
          localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredTrips))

          toast.success("Category restored", {
            description: `${categoryToDelete.name} has been restored successfully`,
          })
        }

        toast.success("Category deleted", {
          description: `${categoryToDelete.name} has been deleted`,
          action: {
            label: "Undo",
            onClick: undoDelete,
          },
        })
      } else {
        throw new Error("Category not found")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete category"
      toast.error("Failed to delete category", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleAddItem = (categoryId: string, itemName: string) => {
    if (!currentTrip || !itemName.trim()) return

    try {
      const newItem: Item = {
        id: crypto.randomUUID(),
        name: itemName,
        packed: false,
      }

      const updatedCategories = currentTrip.categories.map((category) =>
        category.id === categoryId ? { ...category, items: [...category.items, newItem] } : category,
      )

      const updatedTrip = {
        ...currentTrip,
        categories: updatedCategories,
      }

      const updatedTrips = trips.map((trip) => (trip.id === currentTrip.id ? updatedTrip : trip))

      setTrips(updatedTrips)
      setCurrentTrip(updatedTrip)

      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips))

      toast.success("Item added", {
        description: `${itemName} has been added successfully`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add item"
      toast.error("Failed to add item", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleToggleItem = (categoryId: string, itemId: string) => {
    if (!currentTrip) return

    try {
      const category = currentTrip.categories.find((c) => c.id === categoryId)
      const item = category?.items.find((i) => i.id === itemId)

      if (!category || !item) {
        throw new Error("Item not found")
      }

      const updatedCategories = currentTrip.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) => (item.id === itemId ? { ...item, packed: !item.packed } : item)),
            }
          : category,
      )

      const updatedTrip = {
        ...currentTrip,
        categories: updatedCategories,
      }

      const updatedTrips = trips.map((trip) => (trip.id === currentTrip.id ? updatedTrip : trip))

      setTrips(updatedTrips)
      setCurrentTrip(updatedTrip)

      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update item"
      toast.error("Failed to update item", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    if (!currentTrip) return

    try {
      // Find the category and item before deleting
      const category = currentTrip.categories.find((c) => c.id === categoryId)
      const itemToDelete = category?.items.find((item) => item.id === itemId)

      if (category && itemToDelete) {
        // Create a copy of the current trip for undo
        const originalTrip = JSON.parse(JSON.stringify(currentTrip))

        // Update state first
        const updatedCategories = currentTrip.categories.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                items: category.items.filter((item) => item.id !== itemId),
              }
            : category,
        )

        const updatedTrip = {
          ...currentTrip,
          categories: updatedCategories,
        }

        const updatedTrips = trips.map((trip) => (trip.id === currentTrip.id ? updatedTrip : trip))

        setTrips(updatedTrips)
        setCurrentTrip(updatedTrip)

        // Save to localStorage immediately
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips))

        // Create an undo function that captures the current state
        const undoDelete = () => {
          const restoredTrip = originalTrip
          const restoredTrips = trips.map((trip) => (trip.id === restoredTrip.id ? restoredTrip : trip))

          setTrips(restoredTrips)
          setCurrentTrip(restoredTrip)

          // Save to localStorage immediately
          localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredTrips))

          toast.success("Item restored", {
            description: `${itemToDelete.name} has been restored successfully`,
          })
        }

        toast.success("Item deleted", {
          description: `${itemToDelete.name} has been deleted`,
          action: {
            label: "Undo",
            onClick: undoDelete,
          },
        })
      } else {
        throw new Error("Item not found")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete item"
      toast.error("Failed to delete item", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded"></div>
          <div className="h-32 w-full max-w-2xl bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && trips.length === 0) {
    return (
      <Card className="border-destructive/10 shadow-lg animate-slide-in" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-medium mb-2">Error Loading Trips</h2>
          <p className="text-foreground mb-6 max-w-md">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 transition-colors"
            aria-label="Retry loading trips"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-in">
        <TripSelector trips={trips} currentTripId={currentTrip?.id} onTripChange={handleTripChange} />

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => setIsAddTripOpen(true)}
            className="bg-primary hover:bg-primary/90 transition-colors shadow-sm"
            aria-label="Create new trip"
          >
            <Plus className="h-4 w-4 mr-1" /> <span>New Trip</span>
          </Button>

          {currentTrip && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditTripOpen(true)}
                className="border-primary/20 hover:border-primary/40 transition-colors"
                aria-label={`Edit ${currentTrip?.name} trip`}
              >
                <Edit className="h-4 w-4 mr-1" /> <span>Edit</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteTripOpen(true)}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                aria-label={`Delete ${currentTrip?.name} trip`}
              >
                <Trash2 className="h-4 w-4 mr-1" /> <span>Delete</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {currentTrip ? (
        <div className="space-y-8 animate-slide-in">
          <Card className="overflow-hidden border-primary/10 shadow-lg" style={{ boxShadow: "var(--card-shadow)" }}>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 px-6 py-4 border-b border-primary/10">
              <h2 className="text-xl font-medium">
                {currentTrip.name}{" "}
                {currentTrip.date && <span className="text-foreground font-normal ml-1">• {currentTrip.date}</span>}
              </h2>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Packing Progress</h3>
                  <span className="text-sm text-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {currentTrip.categories.reduce(
                      (acc, category) => acc + category.items.filter((item) => item.packed).length,
                      0,
                    )}
                    /{currentTrip.categories.reduce((acc, category) => acc + category.items.length, 0)} items
                  </span>
                </div>
                <div className="relative pt-1">
                  <Progress
                    value={progress}
                    className="h-2"
                    aria-label={`Packing progress: ${progress}% complete`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                  />
                  <div className="text-right mt-1">
                    <span className="text-xs font-semibold inline-block text-primary">{progress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CategoryList
            categories={currentTrip.categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddItem={handleAddItem}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeleteItem}
          />
        </div>
      ) : (
        <Card className="border-primary/10 shadow-lg animate-slide-in" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-medium mb-2">No trips yet</h2>
            <p className="text-foreground mb-6 max-w-md">
              Create your first trip to start organizing your packing lists
            </p>
            <Button
              onClick={() => setIsAddTripOpen(true)}
              className="bg-primary hover:bg-primary/90 transition-colors"
              aria-label="Create your first trip"
            >
              <Plus className="h-4 w-4 mr-1" /> Create Trip
            </Button>
          </CardContent>
        </Card>
      )}

      <AddTripDialog open={isAddTripOpen} onOpenChange={setIsAddTripOpen} onAddTrip={handleAddTrip} />

      {currentTrip && (
        <>
          <EditTripDialog
            open={isEditTripOpen}
            onOpenChange={setIsEditTripOpen}
            trip={currentTrip}
            onEditTrip={handleEditTrip}
          />

          <Dialog open={isDeleteTripOpen} onOpenChange={setIsDeleteTripOpen}>
            <DialogContent className="sm:max-w-[425px] border-destructive/20">
              <DialogHeader>
                <DialogTitle className="text-destructive">Delete Trip</DialogTitle>
                <DialogDescription className="text-foreground">
                  Are you sure you want to delete "{currentTrip?.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteTripOpen(false)}
                  aria-label={`Cancel deleting ${currentTrip?.name} trip`}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteTrip}
                  aria-label={`Delete ${currentTrip?.name} trip`}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

