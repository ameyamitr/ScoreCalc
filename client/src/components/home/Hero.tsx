import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const Hero = () => {
  return (
    <section className="bg-primary/10 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-4">
              Academic Tools for High School Success
            </h2>
            <p className="text-lg text-neutral-700/80 mb-6">
              Your complete toolkit for GPA calculations, grade tracking, college planning, and more.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center">
              <Link href="/#calculators">
                <span>Explore Tools</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8aGlnaCUyMHNjaG9vbCUyMHN0dWRlbnRzJTIwc3R1ZHlpbmd8fDB8fHx8MTcwNDk0MDYxM3wx&auto=format&fit=crop&w=1080&q=80" 
              alt="High school students studying together" 
              className="rounded-lg shadow-md w-full" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
