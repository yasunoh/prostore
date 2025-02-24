'use client'

import { useToast } from "@/hooks/use-toast";
import { reviewFormDefaultValues } from "@/lib/constants";
import { insertReviewSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarIcon } from "lucide-react";
import { createUpdateReview, getReviewByProductId } from "@/lib/actions/review.action";

const ReviewForm = ({userId, productId, onReviewSubmitted}:{
  userId:string;
  productId:string;
  onReviewSubmitted: () => void;
}) => {
  const [open, setOpen] = useState(false)

  const {toast} = useToast();

  const form = useForm<z.infer<typeof insertReviewSchema>>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: reviewFormDefaultValues
  })

  // Open Form Handler
  const handleOpenForm = async () => {
    form.setValue('productId', productId);
    form.setValue('userId', userId);

    const review = await getReviewByProductId({productId})

    if(review) {
      form.setValue('title', review.title);
      form.setValue('description', review.description);
      form.setValue('rating', review.rating);
    }

    setOpen(true);
  }

  // Submit Form Handler
  const onSubmit:SubmitHandler<z.infer<typeof insertReviewSchema>> = async(values) =>{
    const res = await createUpdateReview({...values, productId});

    if(!res.success) {
      return toast({
        variant: 'destructive',
        description: res.message
      })
    } 

    setOpen(false);

    onReviewSubmitted();

    toast({
      description: res.message
    })
  }


  return ( <Dialog open={open} onOpenChange={setOpen}>
    <Button onClick={handleOpenForm} variant='default'>
      Write a Review
    </Button>
    <DialogContent className="sm:max-w-[425px]">
      <Form {...form}>
        <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your thoughts with other customers
          </DialogDescription>
          <div className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value.toString()} >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({length: 5}).map((_, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {index + 1} <StarIcon className="inline h-4 w-4" />
                      </SelectItem>

                    ))}
                  </SelectContent>                    
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" size='lg' className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Submitting...':'Submit'}
            </Button>
          </DialogFooter>
        </form>

      </Form>
      
    </DialogContent>
  </Dialog> );
}
 
export default ReviewForm;