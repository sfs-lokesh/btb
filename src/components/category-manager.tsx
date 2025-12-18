"use client";

import { useState, useContext } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PitchContext } from '@/context/PitchContext';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export function CategoryManager() {
  const { categories, addCategory, removeCategory } = useContext(PitchContext);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const handleAddCategory = async () => {
    if (newCategory.trim() === '') {
      setError('Category name cannot be empty.');
      return;
    }
    if (categories.includes(newCategory.trim())) {
      setError('This category already exists.');
      return;
    }
    await addCategory(newCategory.trim());
    setNewCategory('');
    setError('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Management</CardTitle>
        <CardDescription>
          Add or remove pitch categories. These will be available when adding a new pitch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button onClick={handleAddCategory}>Add Category</Button>
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories added yet.</p>
          ) : (
            categories.map((category) => (
              <Badge key={category} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                {category}
                <button
                  onClick={() => removeCategory(category)}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  aria-label={`Remove ${category}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
