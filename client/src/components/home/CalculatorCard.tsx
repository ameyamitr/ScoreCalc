import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type ColorType = "primary" | "secondary" | "accent" | "supportGreen";

interface CalculatorCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: ColorType;
  href: string;
  buttonText: string;
}

const CalculatorCard = ({ 
  title, 
  description, 
  icon,
  color, 
  href,
  buttonText 
}: CalculatorCardProps) => {
  
  // Map color types to background and text colors
  const colorClassMap = {
    primary: {
      bg: "bg-primary/20",
      iconColor: "text-primary",
      buttonBg: "bg-primary/10 hover:bg-primary/20",
      buttonText: "text-primary"
    },
    secondary: {
      bg: "bg-secondary/20",
      iconColor: "text-secondary",
      buttonBg: "bg-secondary/10 hover:bg-secondary/20",
      buttonText: "text-secondary"
    },
    accent: {
      bg: "bg-accent/20",
      iconColor: "text-accent-foreground",
      buttonBg: "bg-accent/10 hover:bg-accent/20",
      buttonText: "text-accent-foreground"
    },
    supportGreen: {
      bg: "bg-supportGreen/20",
      iconColor: "text-supportGreen",
      buttonBg: "bg-supportGreen/10 hover:bg-supportGreen/20",
      buttonText: "text-supportGreen"
    }
  };
  
  const colorClasses = colorClassMap[color];
  
  return (
    <Card className="calculator-card overflow-hidden hover:shadow-lg border border-gray-100">
      <div className={`h-40 ${colorClasses.bg} flex items-center justify-center`}>
        <div className={colorClasses.iconColor}>
          {icon}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-700/70 text-sm mb-4">{description}</p>
        <Button 
          asChild
          variant="outline" 
          className={`w-full ${colorClasses.buttonBg} ${colorClasses.buttonText} font-medium transition-colors`}
        >
          <Link href={href}>
            {buttonText}
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default CalculatorCard;
