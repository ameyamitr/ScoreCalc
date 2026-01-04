import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the form schema
const formSchema = z.object({
  gpa: z.number().min(2.0, "GPA must be at least 2.0").max(5.0, "GPA cannot exceed 5.0"),
  activities: z.number().min(1, "Activities score must be at least 1").max(5, "Activities score cannot exceed 5"),
  essays: z.number().min(1, "Essay score must be at least 1").max(5, "Essay score cannot exceed 5"),
  satScore: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ChanceResult {
  campus: string;
  chance: number;
  tier: "Likely" | "Target" | "Reach";
}

interface ChancingResults {
  results: ChanceResult[];
  overallAssessment: string;
}

const UcChancingCalculator = () => {
  const [results, setResults] = useState<ChancingResults | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gpa: 3.5,
      activities: 3,
      essays: 3,
      satScore: undefined,
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/calculate/uc-chance", data);
      return response.json();
    },
    onSuccess: (data: ChancingResults) => {
      setResults(data);
      toast({
        title: "Chances Calculated",
        description: "Your UC admission chances have been estimated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate admission chances. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    calculateMutation.mutate(data);
  };

  // Helper function to get color based on chance
  const getChanceColor = (chance: number) => {
    if (chance >= 70) return "text-green-600";
    if (chance >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="py-12 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-4">UC Chancing Calculator</h1>
          <p className="text-neutral-700 mb-6">
            Estimate your chances of admission to different UC schools based on your academic profile and extracurricular activities.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <InfoIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 text-sm">
                  <strong>Important Note:</strong> This tool provides estimates only and should not be considered a guarantee 
                  of admission or rejection. Many factors influence UC admissions decisions, including 
                  personal insight questions, extracurricular activities, and the overall applicant pool.
                </p>
              </div>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="gpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UC GPA</FormLabel>
                        <FormDescription>
                          Enter your UC capped weighted GPA (calculated from 10th and 11th grade UC-approved courses).
                        </FormDescription>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="2.0"
                            max="5.0"
                            placeholder="3.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="activities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extracurricular Activities Strength (1-5)</FormLabel>
                        <FormDescription>
                          Rate the depth and quality of your extracurricular activities, leadership positions, and achievements.
                        </FormDescription>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="py-4"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-neutral-600">
                          <span>1 - Limited</span>
                          <span>3 - Moderate</span>
                          <span>5 - Exceptional</span>
                        </div>
                        <div className="mt-2 text-center font-medium">
                          Current: {field.value}
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="essays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Insight Questions Strength (1-5)</FormLabel>
                        <FormDescription>
                          Rate the quality and authenticity of your responses to the UC Personal Insight Questions.
                        </FormDescription>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="py-4"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-neutral-600">
                          <span>1 - Basic</span>
                          <span>3 - Good</span>
                          <span>5 - Outstanding</span>
                        </div>
                        <div className="mt-2 text-center font-medium">
                          Current: {field.value}
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="satScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SAT Score (Optional)</FormLabel>
                        <FormDescription>
                          Some UC campuses consider SAT/ACT scores for course placement but not for admission decisions.
                        </FormDescription>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 1400" 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      disabled={calculateMutation.isPending}
                    >
                      {calculateMutation.isPending ? "Calculating..." : "Calculate Chances"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {results && (
            <div className="result-container mt-8 p-6 bg-supportGreen/5 rounded-lg">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Your UC Admission Chances</h3>
              
              <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-neutral-900 mb-2">Overall Assessment</h4>
                <p className="text-neutral-700">{results.overallAssessment}</p>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campus</TableHead>
                      <TableHead>Chance</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="hidden sm:table-cell">Visualization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.results.sort((a, b) => b.chance - a.chance).map((result) => (
                      <TableRow key={result.campus}>
                        <TableCell className="font-medium">{result.campus}</TableCell>
                        <TableCell className={getChanceColor(result.chance)}>
                          {result.chance}%
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium
                            ${result.tier === "Likely" ? "bg-green-100 text-green-800" : 
                              result.tier === "Target" ? "bg-yellow-100 text-yellow-800" : 
                              "bg-red-100 text-red-800"}`}>
                            {result.tier}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Progress value={result.chance} className="h-2" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 text-sm text-neutral-500">
                <p><strong>Likely</strong>: 70%+ chance of admission</p>
                <p><strong>Target</strong>: 40-69% chance of admission</p>
                <p><strong>Reach</strong>: Below 40% chance of admission</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UcChancingCalculator;
