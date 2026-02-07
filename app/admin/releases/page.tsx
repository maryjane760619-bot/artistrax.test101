'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Play, Edit, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { releases, artists } from '@/lib/data'

export default function AdminReleasesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredReleases = releases.filter(release =>
    release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    release.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-2">Releases</h1>
          <p className="text-muted-foreground">Manage your music catalog</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Release
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Add New Release</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Album title" className="bg-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist</Label>
                  <Select>
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Select artist" />
                    </SelectTrigger>
                    <SelectContent>
                      {artists.map(artist => (
                        <SelectItem key={artist.id} value={artist.id}>
                          {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="album">Album</SelectItem>
                      <SelectItem value="ep">EP</SelectItem>
                      <SelectItem value="single">Single</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input id="genre" placeholder="e.g., Electronic" className="bg-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input id="releaseDate" type="date" className="bg-input" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pricing (USD)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mp3Price" className="text-xs text-muted-foreground">MP3</Label>
                    <Input id="mp3Price" type="number" step="0.01" placeholder="9.99" className="bg-input mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="flacPrice" className="text-xs text-muted-foreground">FLAC</Label>
                    <Input id="flacPrice" type="number" step="0.01" placeholder="14.99" className="bg-input mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="wavPrice" className="text-xs text-muted-foreground">WAV</Label>
                    <Input id="wavPrice" type="number" step="0.01" placeholder="14.99" className="bg-input mt-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverArt">Cover Art</Label>
                <Input id="coverArt" type="file" accept="image/*" className="bg-input" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isrc">ISRC (optional)</Label>
                <Input id="isrc" placeholder="e.g., USRC12345678" className="bg-input" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Release</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search releases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-input"
        />
      </div>

      {/* Releases Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card">
              <tr className="border-b border-border">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Release</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Artist</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Type</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Genre</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Price</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReleases.map(release => (
                <tr key={release.id} className="border-b border-border hover:bg-card/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-muted-foreground/20 to-muted rounded flex items-center justify-center">
                          <Play className="w-3 h-3 text-muted-foreground/50" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {release.title}
                          {release.featured && <Star className="w-3 h-3 text-accent fill-accent" />}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden">{release.artistName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm">{release.artistName}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm uppercase text-muted-foreground">{release.type}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm">{release.genre}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">${release.pricing.mp3.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="w-4 h-4 mr-2" />
                          {release.featured ? 'Remove Featured' : 'Set Featured'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
