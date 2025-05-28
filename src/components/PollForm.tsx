'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, PlusCircle } from 'lucide-react';
import { createPollAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text cannot be empty.'),
});

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Question text cannot be empty.'),
  type: z.enum(['multiple-choice', 'free-text']),
  options: z.array(optionSchema).optional(),
});

const pollFormSchema = z.object({
  title: z.string().min(1, 'Poll title cannot be empty.'),
  questions: z.array(questionSchema).min(1, 'Poll must have at least one question.'),
});

type PollFormValues = z.infer<typeof pollFormSchema>;

let questionIdCounter = 0;
let optionIdCounter = 0;
const newQuestionId = () => `q-${questionIdCounter++}`;
const newOptionId = () => `o-${optionIdCounter++}`;

export default function PollForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: '',
      questions: [{ id: newQuestionId(), text: '', type: 'multiple-choice', options: [{id: newOptionId(), text: ''}, {id: newOptionId(), text: ''}] }],
    },
  });

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  async function onSubmit(data: PollFormValues) {
    setIsSubmitting(true);
    // Validate that multiple choice questions have at least 2 options with text
    for (const q of data.questions) {
      if (q.type === 'multiple-choice') {
        const filledOptions = q.options?.filter(opt => opt.text.trim() !== '') || [];
        if (filledOptions.length < 2) {
          toast({
            title: 'Validation Error',
            description: `Question "${q.text || 'Unnamed Question'}" must have at least two non-empty options.`,
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      }
    }

    const result = await createPollAction(data.title, data.questions);
    if (result.pollId) {
      toast({
        title: 'Poll Created!',
        description: 'Your poll has been successfully created.',
      });
      router.push(`/results/${result.pollId}`);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to create poll.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl text-primary">Create a New Poll</CardTitle>
        <CardDescription>Fill in the details below to create your instant poll.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg">Poll Title</Label>
            <Input id="title" {...form.register('title')} placeholder="e.g., Favorite Programming Language" className="text-base"/>
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
          </div>

          {questions.map((question, questionIndex) => (
            <Card key={question.id} className="p-4 space-y-4 bg-secondary/30">
              <div className="flex justify-between items-center">
                <Label htmlFor={`questions.${questionIndex}.text`} className="text-md font-semibold">Question {questionIndex + 1}</Label>
                {questions.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(questionIndex)} aria-label="Remove question">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                )}
              </div>
              <Textarea
                id={`questions.${questionIndex}.text`}
                {...form.register(`questions.${questionIndex}.text`)}
                placeholder="e.g., What is your preferred backend framework?"
                className="text-base bg-background"
              />
              {form.formState.errors.questions?.[questionIndex]?.text && <p className="text-sm text-destructive">{form.formState.errors.questions?.[questionIndex]?.text?.message}</p>}

              <Select
                defaultValue={question.type}
                onValueChange={(value: 'multiple-choice' | 'free-text') => {
                  form.setValue(`questions.${questionIndex}.type`, value);
                  if (value === 'multiple-choice' && (!form.getValues(`questions.${questionIndex}.options`) || form.getValues(`questions.${questionIndex}.options`)?.length === 0) ) {
                     form.setValue(`questions.${questionIndex}.options`, [{id: newOptionId(), text: ''}, {id: newOptionId(), text: ''}]);
                  } else if (value === 'free-text') {
                     form.setValue(`questions.${questionIndex}.options`, []);
                  }
                }}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="free-text">Free Text</SelectItem>
                </SelectContent>
              </Select>

              {form.watch(`questions.${questionIndex}.type`) === 'multiple-choice' && (
                <OptionsArray questionIndex={questionIndex} control={form.control} register={form.register} getValues={form.getValues} setValue={form.setValue} errors={form.formState.errors.questions?.[questionIndex]?.options} />
              )}
               {form.formState.errors.questions?.[questionIndex]?.options && typeof form.formState.errors.questions?.[questionIndex]?.options === 'string' && (
                <p className="text-sm text-destructive">{form.formState.errors.questions?.[questionIndex]?.options?.toString()}</p>
              )}
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={() => appendQuestion({ id: newQuestionId(), text: '', type: 'multiple-choice', options: [{id: newOptionId(), text: ''}, {id: newOptionId(), text: ''}] })}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add Question
          </Button>
          <CardFooter className="p-0 pt-6">
            <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

// Sub-component for managing options array
function OptionsArray({ questionIndex, control, register, errors, getValues, setValue }: any) { // Simplified 'any' for brevity here
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  return (
    <div className="space-y-3 pl-4 border-l-2 border-primary/50">
      <Label className="text-sm font-medium">Options</Label>
      {fields.map((option, optionIndex) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Input
            {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
            placeholder={`Option ${optionIndex + 1}`}
            className="text-base bg-background"
          />
          {fields.length > 2 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(optionIndex)} aria-label="Remove option">
              <Trash2 className="h-4 w-4 text-destructive/70" />
            </Button>
          )}
        </div>
      ))}
      {errors && errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={() => append({ id: newOptionId(), text: '' })}
        className="text-primary"
      >
        <PlusCircle className="mr-1 h-4 w-4" /> Add Option
      </Button>
    </div>
  );
}

