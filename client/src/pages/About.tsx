import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

const About = () => {
  return (
    <div className="py-12 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-semibold text-neutral-900 mb-3">About AcademyHub</h1>
            <p className="text-neutral-700">Created by students, for students.</p>
          </div>

          <Card className="overflow-hidden shadow-md mb-12">
            <div className="md:flex">
              <div className="md:w-3/5 p-6 md:p-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Our Mission</h2>
                <p className="text-neutral-700 mb-4">
                  AcademyHub was created by a team of college students who wanted to simplify 
                  the academic planning and college application process for high school students.
                </p>
                <p className="text-neutral-700 mb-4">
                  We developed these tools based on our own experiences navigating high school grades, 
                  college applications, and the UC system.
                </p>
                <p className="text-neutral-700">
                  Our goal is to provide accurate, easy-to-use calculators and trackers that help students 
                  stay organized and make informed decisions about their academic future.
                </p>
              </div>
              <div className="md:w-2/5 bg-primary/10 flex items-center justify-center p-8">
                <div className="text-center">
                  <GraduationCap className="h-20 w-20 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900">Supporting Student Success</h3>
                </div>
              </div>
            </div>
          </Card>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Our Tools</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">UC GPA Calculator</h3>
                  <p className="text-neutral-700 text-sm">
                    Calculates your UC GPA by factoring in course rigor and extra points for UC-approved 
                    honors, AP, and IB courses, following the official UC capped weighted GPA calculation method.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Final Grade Calculator</h3>
                  <p className="text-neutral-700 text-sm">
                    Helps you determine the exact score needed on your final exam to achieve your desired 
                    overall course grade, taking into account current grades and assignment weights.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">UC Chancing Calculator</h3>
                  <p className="text-neutral-700 text-sm">
                    Provides an estimate of your admission chances at different UC campuses based on 
                    academic performance, extracurricular involvement, and personal statements.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Service Hour Tracker</h3>
                  <p className="text-neutral-700 text-sm">
                    Allows you to record and organize your community service activities, making it easy to 
                    report your involvement when applying for colleges and scholarships.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">SAT/ACT Conversion</h3>
                  <p className="text-neutral-700 text-sm">
                    Uses official concordance tables to convert between SAT and ACT scores, helping you 
                    understand how your scores compare and which test might better showcase your abilities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Our Team</h2>
            
            <p className="text-neutral-700 mb-6">
              AcademyHub was founded by a group of recent college graduates who experienced firsthand 
              the challenges of navigating high school academics and the college application process.
            </p>
            
            <p className="text-neutral-700 mb-6">
              Our team includes graduates from various UC campuses who are passionate about making 
              college preparation more accessible and less stressful for high school students.
            </p>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Our Values</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-900">Accuracy</h4>
                    <p className="text-neutral-700 text-sm">
                      Our tools use verified formulas and methodologies to ensure reliable results.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-neutral-900">Accessibility</h4>
                    <p className="text-neutral-700 text-sm">
                      We believe college preparation resources should be available to all students regardless of background.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-neutral-900">Simplicity</h4>
                    <p className="text-neutral-700 text-sm">
                      We design our tools to be intuitive and easy to use, eliminating unnecessary complexity.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-neutral-900">Empowerment</h4>
                    <p className="text-neutral-700 text-sm">
                      We aim to give students the information they need to make confident decisions about their academic future.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
