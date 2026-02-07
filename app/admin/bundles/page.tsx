'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Package } from 'lucide-react'
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
import { bundles, getReleaseById } from '@/lib/data'

export default function AdminBundlesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredBundles = bundles.filter(bundle =>
    bundle.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-2">Bundles</h1>
          <p className="text-muted-foreground">Manage curated collections</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Create New Bundle</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Bundle Title</Label>
                <Input id="title" placeholder="e.g., Summer Collection" className="bg-input" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe this bundle..." 
                  className="bg-input" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input id="originalPrice" type="number" step="0.01" placeholder="39.99" className="bg-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">Bundle Price</Label>
                  <Input id="discountedPrice" type="number" step="0.01" placeholder="29.99" className="bg-input" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Bundle Image</Label>
                <Input id="image" type="file" accept="image/*" className="bg-input" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Bundle</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search bundles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-input"
        />
      </div>

      {/* Bundles List */}
      <div className="space-y-4">
        {filteredBundles.map(bundle => {
          const bundleReleases = bundle.releases
            .map(id => getReleaseById(id))
            .filter(Boolean)
          
          return (
            <div 
              key={bundle.id}
              className="border border-border rounded-lg bg-card p-6 hover:border-muted-foreground/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 h-32 rounded-lg bg-muted flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-muted-foreground/30 to-muted rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl">{bundle.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{bundle.description}</p>
                    </div>
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
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Bundle Price</p>
                      <p className="text-lg font-medium">${bundle.discountedPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Original</p>
                      <p className="text-lg text-muted-foreground line-through">${bundle.originalPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Savings</p>
                      <p className="text-lg font-medium text-accent">${(bundle.originalPrice - bundle.discountedPrice).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Includes {bundleReleases.length} releases:</p>
                    <div className="flex flex-wrap gap-2">
                      {bundleReleases.map(release => release && (
                        <span 
                          key={release.id}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                        >
                          {release.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredBundles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No bundles found.</p>
        </div>
      )}
    </div>
  )
}
