"use client";

import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PitchContext } from '@/context/PitchContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Pitch } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const pitchSchema = z.object({
  title: z.string().min(1, "Title is required."),
  presenter: z.string().min(1, "Presenter is required."),
  category: z.string().min(1, "Category is required."),
  description: z.string().min(1, "Description is required."),
  imageFile: z
    .instanceof(File, { message: "Image is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

type PitchFormValues = z.infer<typeof pitchSchema>;

interface AddPitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPitchDialog({ isOpen, onClose }: AddPitchDialogProps) {
  const { categories, addPitch } = useContext(PitchContext);
  const { toast } = useToast();

  const form = useForm<PitchFormValues>({
    resolver: zodResolver(pitchSchema),
    defaultValues: {
      title: '',
      presenter: '',
      category: '',
      description: '',
      imageFile: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (data: PitchFormValues) => {
    try {
      const formData = new FormData();
      formData.append('file', data.imageFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Image upload failed.');
      }

      const newPitch: Omit<Pitch, '_id' | 'netScore' | 'visible' | 'upvotes' | 'downvotes'> = {
        title: data.title,
        description: data.description,
        presenter: data.presenter,
        imageUrl: uploadData.url,
        category: data.category,
      };

      await addPitch(newPitch);
      toast({
        title: "Pitch Added",
        description: `"${data.title}" has been successfully added.`,
      });
      onClose();
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Could not create pitch. Please try again.";
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Pitch</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new pitch for rating.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Pitch title" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="presenter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presenter</FormLabel>
                  <FormControl>
                    <Input placeholder="Presenter's name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field }) => (
                 <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the pitch" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className="pt-4">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Add Pitch'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
