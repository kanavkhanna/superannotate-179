"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { Trip } from "@/components/packing-list-organizer"

interface TripSelectorProps {
  trips: Trip[]
  currentTripId: string | undefined
  onTripChange: (tripId: string) => void
}

export function TripSelector({ trips, currentTripId, onTripChange }: TripSelectorProps) {
  const [open, setOpen] = useState(false)

  const currentTrip = trips.find((trip) => trip.id === currentTripId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:min-w-[220px] sm:w-auto justify-between border-primary/20 bg-background/80 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-colors"
        >
          {currentTrip ? currentTrip.name : "Select a trip..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[220px] p-0 border-primary/20 bg-background/80 backdrop-blur-md shadow-lg">
        <Command>
          <CommandInput placeholder="Search trips..." className="border-none focus:ring-0" />
          <CommandList>
            <CommandEmpty>No trips found.</CommandEmpty>
            <CommandGroup>
              {trips.map((trip) => (
                <CommandItem
                  key={trip.id}
                  value={trip.name}
                  onSelect={() => {
                    onTripChange(trip.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn("mr-2 h-4 w-4 text-primary", currentTripId === trip.id ? "opacity-100" : "opacity-0")}
                  />
                  {trip.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

