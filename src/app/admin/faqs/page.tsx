'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  useCollection,
  useFirebase,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import type { FAQ } from '@/lib/types';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const faqSchema = z.object({
  question: z.string().min(10, { message: 'Question must be at least 10 characters.' }),
  answer: z.string().min(10, { message: 'Answer must be at least 10 characters.' }),
});

type FaqFormValues = z.infer<typeof faqSchema>;

export default function AdminFaqsPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<({ id: string } & FAQ) | null>(null);

  const faqsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'faqs'), orderBy('question'))
        : null,
    [firestore]
  );
  const { data: faqs, isLoading } = useCollection<FAQ>(faqsQuery);

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: { question: '', answer: '' },
  });

  const handleDialogOpen = (faq: ({ id: string } & FAQ) | null) => {
    setEditingFaq(faq);
    form.reset(faq ? { question: faq.question, answer: faq.answer } : { question: '', answer: '' });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: FaqFormValues) => {
    if (!firestore) return;

    try {
      if (editingFaq) {
        // Update existing FAQ
        const faqRef = doc(firestore, 'faqs', editingFaq.id);
        updateDocumentNonBlocking(faqRef, values);
        toast({ title: 'FAQ Updated', description: 'The FAQ has been successfully updated.' });
      } else {
        // Add new FAQ
        const faqsCollection = collection(firestore, 'faqs');
        addDocumentNonBlocking(faqsCollection, values);
        toast({ title: 'FAQ Added', description: 'The new FAQ has been successfully added.' });
      }
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving the FAQ.',
      });
    }
  };

  const handleDelete = async (faqId: string) => {
    if (!firestore) return;
    try {
      const faqRef = doc(firestore, 'faqs', faqId);
      deleteDocumentNonBlocking(faqRef);
      toast({ title: 'FAQ Deleted', description: 'The FAQ has been successfully deleted.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while deleting the FAQ.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Manage FAQs
          </h1>
          <p className="text-muted-foreground">
            Add, edit, or delete frequently asked questions for the AI assistant.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogOpen(null)}>
              <PlusCircle className="mr-2" /> Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
              <DialogDescription>
                {editingFaq
                  ? "Make changes to an existing FAQ."
                  : "Add a new question and answer to the knowledge base."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., What are your opening hours?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="E.g., We are open from 9 AM to 9 PM, Monday to Saturday."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save FAQ
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>FAQ List</CardTitle>
          <CardDescription>
            This is the knowledge base for the AI Assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && faqs && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Question</TableHead>
                  <TableHead className="w-2/5">Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map(faq => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium">{faq.question}</TableCell>
                    <TableCell className="text-muted-foreground max-w-sm truncate">{faq.answer}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDialogOpen(faq)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the FAQ.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(faq.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && !faqs?.length && (
            <div className="text-center p-8 text-muted-foreground">
              No FAQs found. Add one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
