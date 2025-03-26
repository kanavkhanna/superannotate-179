"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Trip } from "@/components/packing-list-organizer"

interface EditTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Trip
  onEditTrip: (trip: Trip) => void
}

export function EditTripDialog({ open, onOpenChange, trip, onEditTrip }: EditTripDialogProps) {
  const [tripName, setTripName] = useState("")
  const [tripDate, setTripDate] = useState("")
  const [nameError, setNameError] = useState("")

  useEffect(() => {
    if (open && trip) {
      setTripName(trip.name)
      setTripDate(trip.date)
    }
  }, [open, trip])

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

    // Validate date if provided and it's changed from the original
    if (tripDate && tripDate !== trip.date && new Date(tripDate) < new Date(getTodayDate())) {
      toast.error("Invalid date", {
        description: "Trip date cannot be in the past",
        icon: <AlertCircle className="h-5 w-5" />,
      })
      return
    }

    try {
      const updatedTrip: Trip = {
        ...trip,
        name: tripName,
        date: tripDate,
      }

      onEditTrip(updatedTrip)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update trip"
      toast.error("Failed to update trip", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  const resetForm = () => {
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
            <DialogTitle className="text-xl">Edit Trip</DialogTitle>
            <DialogDescription>Update your trip details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Trip Name
              </Label>
              <Input
                id="edit-name"
                value={tripName}
                onChange={(e) => {
                  setTripName(e.target.value)
                  if (e.target.value.trim()) {
                    setNameError("")
                  }
                }}
                className={`border-primary/20 focus-visible:ring-primary/30 ${
                  nameError ? "border-destructive focus-visible:ring-destructive/30" : ""
                }`}
              />
              {nameError && <p className="text-sm text-destructive">{nameError}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-date" className="text-sm font-medium">
                Trip Date
              </Label>
              <Input
                id="edit-date"
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
              aria-label={`Cancel editing ${tripName}`}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary/90 hover:bg-primary transition-colors"
              aria-label={`Save changes to ${tripName}`}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

