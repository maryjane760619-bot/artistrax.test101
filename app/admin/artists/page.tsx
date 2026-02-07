'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Edit, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { artists, getReleasesByArtist } from '@/lib/data'

export default function AdminArtistsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-2">Artists</h1>
          <p className="text-muted-foreground">Manage your label roster</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Artist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Add New Artist</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Artist Name</Label>
                <Input id="name" placeholder="Artist or band name" className="bg-input" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genres">Genres</Label>
                <Input id="genres" placeholder="e.g., Electronic, Ambient, Deep House" className="bg-input" />
                <p className="text-xs text-muted-foreground">Comma-separated list of genres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Artist biography..." 
                  className="bg-input min-h-[100px]" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Artist Image</Label>
                <Input id="image" type="file" accept="image/*" className="bg-input" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Artist</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-input"
        />
      </div>

      {/* Artists Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtists.map(artist => {
          const artistReleases = getReleasesByArtist(artist.id)
          
          return (
            <div 
              key={artist.id}
              className="border border-border rounded-lg bg-card p-4 hover:border-muted-foreground/50 transition-colors"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-muted-foreground/30 to-muted rounded-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium truncate">{artist.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {artistReleases.length} release{artistReleases.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Page
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {artist.genres.map(genre => (
                  <span 
                    key={genre}
                    className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {artist.bio}
              </p>
            </div>
          )
        })}
      </div>

      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No artists found.</p>
        </div>
      )}
    </div>
  )
}
