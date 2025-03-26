"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

interface TripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  trip?: Trip | null
  onSave: (trip: Trip) => void
}

export function TripDialog({ open, onOpenChange, mode, trip, onSave }: TripDialogProps) {
  const [tripName, setTripName] = useState("")
  const [tripDate, setTripDate] = useState("")
  const [nameError, setNameError] = useState("")
  const [dateError, setDateError] = useState("")

  useEffect(() => {
    if (open) {
      if (mode === "edit" && trip) {
        setTripName(trip.name)
        setTripDate(trip.date)
      } else {
        setTripName("")
        setTripDate("")
      }
      setNameError("")
      setDateError("")
    }
  }, [open, mode, trip])

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
    let isValid = true

    // Validate name
    if (!tripName.trim()) {
      setNameError("Trip name is required")
      isValid = false
    } else {
      setNameError("")
    }

    // Validate date is provided for new trips
    if (mode === "add" && !tripDate) {
      setDateError("Trip date is required")
      isValid = false
    } else if (tripDate && new Date(tripDate) < new Date(getTodayDate())) {
      // Validate date is not in the past
      setDateError("Trip date cannot be in the past")
      isValid = false
    } else {
      setDateError("")
    }

    if (!isValid) return

    try {
      if (mode === "add") {
        const newTrip: Trip = {
          id: crypto.randomUUID(),
          name: tripName,
          date: tripDate,
          categories: [],
        }
        onSave(newTrip)
      } else if (mode === "edit" && trip) {
        const updatedTrip: Trip = {
          ...trip,
          name: tripName,
          date: tripDate,
        }
        onSave(updatedTrip)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} trip`
      setNameError(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-primary/20 shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">{mode === "add" ? "Create New Trip" : "Edit Trip"}</DialogTitle>
            <DialogDescription>
              {mode === "add" ? "Add a new trip to organize your packing list." : "Update your trip details."}
            </DialogDescription>
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
                onChange={(e) => {
                  setTripDate(e.target.value)
                  if (e.target.value) {
                    setDateError("")
                  }
                }}
                min={getTodayDate()}
                className={`border-primary/20 focus-visible:ring-primary/30 ${
                  dateError ? "border-destructive focus-visible:ring-destructive/30" : ""
                }`}
              />
              {dateError && <p className="text-sm text-destructive">{dateError}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              aria-label={mode === "add" ? "Cancel creating trip" : `Cancel editing ${tripName}`}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 transition-colors"
              aria-label={mode === "add" ? `Create ${tripName || "new trip"}` : `Save changes to ${tripName}`}
            >
              {mode === "add" ? "Create Trip" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

