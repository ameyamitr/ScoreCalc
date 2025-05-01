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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRightLeft, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// SAT/ACT conversion schema
const formSchema = z.object({
  testType: z.enum(["SAT", "ACT"], {
    required_error: "Please select a test type",
  }),
  score: z.number({
    required_error: "Please enter a score",
    invalid_type_error: "Score must be a number",
  })
    .refine(val => !isNaN(val), {
      message: "Score must be a valid number",
    })
    .refine((score, ctx) => {
      if (ctx.data.testType === "SAT") {
        return score >= 400 && score <= 1600;
      } else {
        return score >= 1 && score <= 36;
      }
    }, {
      message: ctx => `${ctx.data.testType === "SAT" ? "SAT score must be between 400 and 1600" : "ACT score must be between 1 and 36"}`,
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface ConversionResult {
  originalTestType: "SAT" | "ACT";
  originalScore: number;
  convertedTestType: "SAT" | "ACT";
  convertedScore: number;
}

const SatActConverter = () => {
  const [results, setResults] = useState<ConversionResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testType: "SAT",
      score: undefined,
    },
  });

  const watchTestType = form.watch("testType");

  const convertMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/calculate/sat-act", data);
      return response.json();
    },
    onSuccess: (data: ConversionResult) => {
      setResults(data);
      toast({
        title: "Score Converted",
        description: `Your ${data.originalTestType} score has been converted to an equivalent ${data.convertedTestType} score.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Conversion Error",
        description: error instanceof Error ? error.message : "Failed to convert score. Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    convertMutation.mutate(data);
  };

  const getPlaceholder = () => {
    return watchTestType === "SAT" ? "e.g., 1350" : "e.g., 28";
  };

  return (
    <div className="py-12 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-4">SAT/ACT Score Converter</h1>
          <p className="text-neutral-700 mb-6">
            Convert between SAT and ACT scores to determine which test best showcases your abilities.
          </p>

          <Alert className="bg-blue-50 border-blue-200 mb-6">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-neutral-700">
              This converter uses official concordance tables to provide equivalent scores. Different colleges may have slightly different conversion methods.
            </AlertDescription>
          </Alert>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="testType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Test Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="SAT" id="SAT" />
                              <FormLabel htmlFor="SAT" className="font-normal cursor-pointer">
                                SAT
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="ACT" id="ACT" />
                              <FormLabel htmlFor="ACT" className="font-normal cursor-pointer">
                                ACT
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{watchTestType} Score</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={getPlaceholder()}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        {watchTestType === "SAT" ? (
                          <p className="text-xs text-neutral-500 mt-1">Enter a score between 400 and 1600</p>
                        ) : (
                          <p className="text-xs text-neutral-500 mt-1">Enter a score between 1 and 36</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      disabled={convertMutation.isPending}
                    >
                      {convertMutation.isPending ? "Converting..." : "Convert Score"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {results && (
            <div className="result-container mt-8 p-6 bg-primary/5 rounded-lg">
              <h3 className="text-xl font-semibold text-neutral-900 mb-6">Conversion Results</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">{results.originalTestType} Score</h4>
                  <div className="text-3xl font-bold text-primary">{results.originalScore}</div>
                </div>

                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">{results.convertedTestType} Score</h4>
                  <div className="text-3xl font-bold text-primary">{results.convertedScore}</div>
                </div>
              </div>

              <div className="mt-8 bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-neutral-900 mb-2">What This Means</h4>
                <p className="text-neutral-700 text-sm">
                  Your {results.originalTestType} score of {results.originalScore} is approximately equivalent to 
                  a {results.convertedTestType} score of {results.convertedScore}.
                </p>
                <p className="text-neutral-700 text-sm mt-2">
                  {results.convertedTestType === "SAT" ? (
                    <>
                      The SAT has a score range of 400-1600 and tests reading, writing, and math.
                    </>
                  ) : (
                    <>
                      The ACT has a score range of 1-36 and tests English, math, reading, and science.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SatActConverter;
