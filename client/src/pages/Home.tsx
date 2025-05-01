import { useRef, useEffect } from "react";
import Hero from "@/components/home/Hero";
import CalculatorCard from "@/components/home/CalculatorCard";
import Testimonials from "@/components/home/Testimonials";
import { 
  Calculator, 
  ChartLine, 
  Building2, 
  HeartHandshake, 
  ArrowRightLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const Home = () => {
  const calculatorsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if the URL has an anchor
    if (window.location.hash === '#calculators' && calculatorsRef.current) {
      setTimeout(() => {
        calculatorsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return (
    <div>
      <Hero />
      
      {/* Calculators Section */}
      <section className="py-12 bg-white" id="calculators" ref={calculatorsRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-3">Academic Tools</h2>
            <p className="text-neutral-700/70 max-w-2xl mx-auto">Everything you need to track your academic progress and plan for college success.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CalculatorCard 
              title="UC GPA Calculator"
              description="Calculate your UC GPA with weighted honors and AP courses for UC applications."
              icon={<Calculator className="w-12 h-12" />}
              color="primary"
              href="/uc-gpa-calculator"
              buttonText="Start Calculating"
            />
            
            <CalculatorCard 
              title="Final Grade Calculator"
              description="Determine what score you need on your final exam to achieve your desired course grade."
              icon={<ChartLine className="w-12 h-12" />}
              color="secondary"
              href="/final-grade-calculator"
              buttonText="Start Calculating"
            />
            
            <CalculatorCard 
              title="UC Chancing Calculator"
              description="Estimate your chances of admission to different UC schools based on your profile."
              icon={<Building2 className="w-12 h-12" />}
              color="supportGreen"
              href="/uc-chancing-calculator"
              buttonText="Start Calculating"
            />
            
            <CalculatorCard 
              title="Service Hour Tracker"
              description="Log and track your community service hours for college applications and scholarships."
              icon={<HeartHandshake className="w-12 h-12" />}
              color="accent"
              href="/service-tracker"
              buttonText="Start Tracking"
            />
            
            <CalculatorCard 
              title="SAT/ACT Conversion"
              description="Convert between SAT and ACT scores to determine which test best showcases your abilities."
              icon={<ArrowRightLeft className="w-12 h-12" />}
              color="primary"
              href="/sat-act-converter"
              buttonText="Start Converting"
            />
          </div>
        </div>
      </section>
      
      <Testimonials />
      
      {/* About Section Preview */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-3">About AcademyHub</h2>
              <p className="text-neutral-700/70">Created by students, for students.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:w-3/5 p-6 md:p-8">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">Our Mission</h3>
                <p className="text-neutral-700/80 mb-4">
                  AcademyHub provides accurate, easy-to-use calculators and trackers that help students stay organized and make informed decisions about their academic future.
                </p>
                <div className="mt-6">
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/about">Learn More About Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
