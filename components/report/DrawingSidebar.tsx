"use client"

import * as React from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface DrawingSidebarProps {
  balloonedImageUrl: string
  originalImageUrl: string
}

function InteractiveImageZoom({ imageUrl, altText }: { imageUrl: string; altText: string }) {
  const [scale, setScale] = React.useState(1)
  const [isDragging, setIsDragging] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 5))
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 0.5))
  const handleReset = () => { setScale(1); setPosition({ x: 0, y: 0 }) }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handleDoubleClick = () => {
    if (scale > 1) {
      handleReset()
    } else {
      setScale(2)
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-muted/30 rounded-md touch-none group">
      
      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-md p-1.5 rounded-full border shadow-lg transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100">
        <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale <= 0.5} className="h-8 w-8 rounded-full">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="text-xs font-mono w-12 text-center select-none font-medium">
          {Math.round(scale * 100)}%
        </div>
        <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale >= 5} className="h-8 w-8 rounded-full">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 rounded-full" title="Reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Container */}
      <div 
        className={`w-full h-full flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onWheel={(e) => {
          if (e.deltaY < 0) handleZoomIn()
          else handleZoomOut()
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt={altText}
          draggable={false}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="max-w-full max-h-full object-contain pointer-events-none select-none"
        />
      </div>
    </div>
  )
}


export function DrawingSidebar({ balloonedImageUrl, originalImageUrl }: DrawingSidebarProps) {
  const [activeImage, setActiveImage] = React.useState<"ballooned" | "original">("ballooned")
  
  const currentImageUrl = activeImage === "ballooned" ? balloonedImageUrl : originalImageUrl

  return (
    <div className="w-95 shrink-0 flex flex-col border-r border-border bg-muted/20">
      <div className="p-4 border-b">
        <ToggleGroup 
          value={[activeImage]} 
          onValueChange={(val: any) => {
            const newVal = Array.isArray(val) ? val[0] : val;
            if (newVal === "ballooned" || newVal === "original") setActiveImage(newVal);
          }}
          className="justify-start w-full"
        >
          <ToggleGroupItem 
            value="ballooned" 
            aria-label="Show ballooned drawing"
            className="flex-1 uppercase text-xs tracking-widest font-semibold data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            Ballooned
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="original" 
            aria-label="Show original drawing"
            className="flex-1 uppercase text-xs tracking-widest font-semibold data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            Original
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <Dialog>
          <DialogTrigger>
            <div className="rounded-md border bg-card p-1 shadow-sm cursor-zoom-in hover:shadow-md transition-shadow">
              {/* Using standard img since it comes from API route and might change */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentImageUrl} 
                alt={`${activeImage} drawing`}
                className="w-full h-auto rounded-sm object-contain"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[95vw] h-[95vh] w-full p-2 bg-background border-none shadow-2xl flex flex-col">
            <div className="sr-only">
              <DialogTitle>Drawing Preview</DialogTitle>
              <DialogDescription>Full screen view of the {activeImage} engineering drawing.</DialogDescription>
            </div>
            <div className="flex-1 overflow-hidden rounded-md border border-border">
              <InteractiveImageZoom imageUrl={currentImageUrl} altText={`${activeImage} drawing full`} />
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Click image to expand
        </div>
      </ScrollArea>
    </div>
  )
}
