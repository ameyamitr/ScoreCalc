import { Star } from "lucide-react";

// Testimonial data
const testimonials = [
  {
    id: 1,
    text: "The UC GPA calculator helped me understand exactly what I needed to focus on to improve my chances. I got into UC Berkeley!",
    name: "Jamie L.",
    className: "Class of 2023",
    initials: "JL",
    color: "primary"
  },
  {
    id: 2,
    text: "The service hour tracker made it so easy to keep up with my volunteer work. It was a huge help when filling out college applications.",
    name: "Michael T.",
    className: "Class of 2022",
    initials: "MT",
    color: "secondary"
  },
  {
    id: 3,
    text: "The final grade calculator saved me during finals week! I knew exactly what scores I needed to maintain my GPA.",
    name: "Aisha K.",
    className: "Class of 2024",
    initials: "AK",
    color: "supportGreen"
  }
];

// Helper function to render star rating
const StarRating = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="flex items-center mb-4 text-primary">
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
      {count < 5 && (
        <Star className="h-4 w-4 fill-current stroke-primary" />
      )}
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-3">
            Student Success Stories
          </h2>
          <p className="text-neutral-700/70 max-w-2xl mx-auto">
            See how AcademyHub has helped students achieve their academic goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => {
            const bgColorClass = testimonial.color === "primary" 
              ? "bg-primary/20" 
              : testimonial.color === "secondary" 
                ? "bg-secondary/20" 
                : "bg-supportGreen/20";
                
            const textColorClass = testimonial.color === "primary" 
              ? "text-primary" 
              : testimonial.color === "secondary" 
                ? "text-secondary" 
                : "text-supportGreen";
            
            return (
              <div key={testimonial.id} className="bg-neutral-50 p-6 rounded-lg">
                <StarRating />
                <p className="text-neutral-800/80 mb-4">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${bgColorClass} rounded-full flex items-center justify-center ${textColorClass} font-semibold mr-3`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">{testimonial.name}</h4>
                    <p className="text-xs text-neutral-600">{testimonial.className}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
