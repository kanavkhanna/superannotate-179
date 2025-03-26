"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Trip } from "@/components/packing-list-organizer"

interface AddTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTrip: (trip: Trip) => void
}

export function AddTripDialog({ open, onOpenChange, onAddTrip }: AddTripDialogProps) {
  const [tripName, setTripName] = useState("")
  const [tripDate, setTripDate] = useState("")
  const [nameError, setNameError] = useState("")

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (!tripName.trim()) {
      setNameError("Trip name is required")
      toast.error("Invalid trip name", {
        description: "Trip name is required",
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    // Validate date if provided
    if (tripDate && new Date(tripDate) < new Date(getTodayDate())) {
      toast.error("Invalid date", {
        description: "Trip date cannot be in the past",
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    try {
      const newTrip: Trip = {
        id: crypto.randomUUID(),
        name: tripName,
        date: tripDate,
        categories: [],
      }

      onAddTrip(newTrip)
      resetForm()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create trip"
      toast.error("Failed to create trip", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const resetForm = () => {
    setTripName("")
    setTripDate("")
    setNameError("")
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-primary/20 shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Trip</DialogTitle>
            <DialogDescription>Add a new trip to organize your packing list.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Trip Name
              </Label>
              <Input
                id="name"
                value={tripName}
                onChange={(e) => {
                  setTripName(e.target.value)
                  if (e.target.value.trim()) {
                    setNameError("")
                  }
                }}
                placeholder="Summer Vacation"
                className={`border-primary/20 focus-visible:ring-primary/30 ${
                  nameError ? "border-destructive focus-visible:ring-destructive/30" : ""
                }`}
              />
              {nameError && <p className="text-sm text-destructive">{nameError}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Trip Date
              </Label>
              <Input
                id="date"
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                min={getTodayDate()}
                className="border-primary/20 focus-visible:ring-primary/30"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              aria-label="Cancel creating trip"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary/90 hover:bg-primary transition-colors"
              aria-label={`Create ${tripName || "new trip"}`}
            >
              Create Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

