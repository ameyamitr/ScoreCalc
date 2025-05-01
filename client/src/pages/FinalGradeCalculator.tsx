import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { finalGradeInputSchema } from "@shared/schema";

interface FinalGradeResults {
  neededGrade: number;
  letterGrade: string;
  feasibilityMessage: string;
  isPossible: boolean;
}

const formSchema = finalGradeInputSchema.refine(
  (data) => data.currentWeight + data.finalWeight === 100,
  {
    message: "Current grade weight and final exam weight must sum to 100%",
    path: ["finalWeight"],
  }
);

const FinalGradeCalculator = () => {
  const [results, setResults] = useState<FinalGradeResults | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentGrade: 85,
      currentWeight: 70,
      finalWeight: 30,
      desiredGrade: 90,
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/calculate/final-grade", data);
      return response.json();
    },
    onSuccess: (data: FinalGradeResults) => {
      setResults(data);
      toast({
        title: "Calculation Complete",
        description: "Your required final exam grade has been calculated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate required grade. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    calculateMutation.mutate(data);
  };

  // Helper to update finalWeight when currentWeight changes
  const handleCurrentWeightChange = (value: number) => {
    const newCurrentWeight = isNaN(value) ? 0 : value;
    form.setValue("finalWeight", 100 - newCurrentWeight);
  };

  return (
    <div className="py-12 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-4">Final Grade Calculator</h1>
          <p className="text-neutral-700 mb-6">
            Calculate the grade you need on your final exam to achieve your desired course grade.
          </p>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="currentGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Grade (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 87.5" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currentWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Grade Weight (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 70" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(value);
                                handleCurrentWeightChange(value);
                              }}
                            />
                          </FormControl>
                          <p className="text-xs text-neutral-600 mt-1">
                            Percentage of final grade determined by work so far
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="finalWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Final Exam Weight (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 30" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(value);
                                form.setValue("currentWeight", 100 - value);
                              }}
                            />
                          </FormControl>
                          <p className="text-xs text-neutral-600 mt-1">
                            Percentage of final grade determined by final exam
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="desiredGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desired Final Grade (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 90" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-secondary hover:bg-secondary/90"
                      disabled={calculateMutation.isPending}
                    >
                      {calculateMutation.isPending ? "Calculating..." : "Calculate Needed Grade"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {results && (
            <div className="result-container mt-8 p-6 bg-secondary/5 rounded-lg">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Your Final Grade Results</h3>
              
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${!results.isPossible ? 'text-red-500' : 'text-secondary'}`}>
                    {results.neededGrade.toFixed(1)}%
                  </div>
                  <div className="text-neutral-700">Grade Needed on Final Exam</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-neutral-900 mb-2">Grade Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Current Grade:</span>
                      <span className="font-medium">{form.getValues().currentGrade.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Weight:</span>
                      <span className="font-medium">{form.getValues().currentWeight}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final Exam Weight:</span>
                      <span className="font-medium">{form.getValues().finalWeight}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desired Final Grade:</span>
                      <span className="font-medium">{form.getValues().desiredGrade}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-neutral-900 mb-2">Letter Grade Equivalent</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Required Grade:</span>
                      <span className={`font-medium ${!results.isPossible ? 'text-red-500' : ''}`}>
                        {results.letterGrade}
                      </span>
                    </div>
                    <p className={`${!results.isPossible ? 'text-red-500' : 'text-secondary/80'}`}>
                      <span>{results.feasibilityMessage}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalGradeCalculator;
