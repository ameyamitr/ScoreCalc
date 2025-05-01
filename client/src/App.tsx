import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import UcGpaCalculator from "@/pages/UcGpaCalculator";
import FinalGradeCalculator from "@/pages/FinalGradeCalculator";
import UcChancingCalculator from "@/pages/UcChancingCalculator";
import ServiceTracker from "@/pages/ServiceTracker";
import SatActConverter from "@/pages/SatActConverter";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/uc-gpa-calculator" component={UcGpaCalculator} />
          <Route path="/final-grade-calculator" component={FinalGradeCalculator} />
          <Route path="/uc-chancing-calculator" component={UcChancingCalculator} />
          <Route path="/service-tracker" component={ServiceTracker} />
          <Route path="/sat-act-converter" component={SatActConverter} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
