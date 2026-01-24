import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface QuizOptionProps {
  id: string;
  label: string; 
  text: string;  
  isSelected: boolean;
  onSelect: () => void;
}

export function QuizOption({ id, label, text, isSelected, onSelect }: QuizOptionProps) {
  return (
    <Card 
      onClick={onSelect}
      className={cn(
        "flex items-center p-4 cursor-pointer transition-all duration-200 border-2",
        "hover:shadow-md hover:scale-[1.01]", 
        isSelected 
          ? "border-brand-500 bg-brand-50" 
          : "border-slate-100 hover:border-brand-200 hover:bg-slate-50"
      )}
    >

      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md mr-4 font-bold text-sm transition-colors",
        isSelected
          ? "bg-brand-500 text-white"
          : "bg-slate-100 text-slate-600 group-hover:bg-brand-100"
      )}>
        {label}
      </div>

      <span className={cn(
        "text-lg font-medium",
        isSelected ? "text-brand-700" : "text-slate-700"
      )}>
        {text}
      </span>
    </Card>
  )
}