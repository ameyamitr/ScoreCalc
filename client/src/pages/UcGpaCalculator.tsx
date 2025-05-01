import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ucGpaInputSchema } from "@shared/schema";

type FormValues = z.infer<typeof ucGpaInputSchema>;

interface GpaResults {
  unweightedGPA: number;
  weightedGPA: number;
  weightedPoints: number;
  honorsCount: number;
  totalCourses: number;
}

const UcGpaCalculator = () => {
  const [results, setResults] = useState<GpaResults | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(ucGpaInputSchema),
    defaultValues: {
      gradeA: 0,
      gradeB: 0,
      gradeC: 0,
      gradeD: 0,
      gradeF: 0,
      honorsCount: 0,
      academicSystem: "semester",
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/calculate/uc-gpa", data);
      return response.json();
    },
    onSuccess: (data: GpaResults) => {
      setResults(data);
      toast({
        title: "GPA Calculated",
        description: "Your UC GPA has been calculated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate GPA. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    calculateMutation.mutate(data);
  };

  return (
    <div className="py-12 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-4">UC GPA Calculator</h1>
          <p className="text-neutral-700 mb-6">
            Calculate your UC GPA for admission applications based on the official UC GPA calculation method.
            The UC GPA uses your A-G courses from 10th and 11th grade, with extra points for UC-approved honors, AP, and IB courses.
          </p>

          <Alert className="bg-blue-50 border-blue-200 mb-6">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-neutral-700">
              UC awards an extra grade point for UC-approved honors, AP, and IB courses, up to a maximum of 8 semesters or 12 trimesters.
              Only grades of A, B, or C in honors courses receive the extra point.
            </AlertDescription>
          </Alert>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-neutral-900 mb-4">Enter your grades and honors courses</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="academicSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Academic System</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select academic system" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="semester">Semester System</SelectItem>
                                <SelectItem value="trimester">Trimester System</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select semester for traditional two-term academic years or trimester for three-term academic years
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="gradeA"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of A grades</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gradeB"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of B grades</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gradeC"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of C grades</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gradeD"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of D grades</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gradeF"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of F grades</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="honorsCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Honors/AP/IB courses</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  min={0}
                                />
                              </FormControl>
                              <FormDescription>
                                Count only courses where you earned an A, B, or C
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90"
                      disabled={calculateMutation.isPending}
                    >
                      {calculateMutation.isPending ? "Calculating..." : "Calculate UC GPA"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {results && (
            <div className="result-container mt-8 p-6 bg-primary/5 rounded-lg">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Your UC GPA Results</h3>
              
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{results.weightedGPA.toFixed(2)}</div>
                  <div className="text-neutral-700">UC Capped Weighted GPA</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-neutral-900 mb-2">GPA Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Unweighted GPA:</span>
                      <span className="font-medium">{results.unweightedGPA.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weighted Points:</span>
                      <span className="font-medium">+{results.weightedPoints.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Honors Courses (counted):</span>
                      <span className="font-medium">{results.honorsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Courses:</span>
                      <span className="font-medium">{results.totalCourses}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-neutral-900 mb-2">UC Context</h4>
                  <div className="space-y-2 text-sm">
                    <p>UC campuses report the median GPA for admitted freshmen typically ranges from 3.7-4.2 depending on campus.</p>
                    <p className="text-primary font-medium">
                      {results.weightedGPA >= 4.0 
                        ? "Your GPA is competitive for most UC campuses." 
                        : results.weightedGPA >= 3.7 
                        ? "Your GPA is within the typical admitted range for many UC campuses." 
                        : "Consider focusing on other aspects of your application to strengthen your candidacy."}
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

export default UcGpaCalculator;
