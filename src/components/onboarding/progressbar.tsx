import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const progress = ((currentStep ) / totalSteps) * 100;

    return (
        <div className="w-full max-w-md mb-8">
            <Progress value={progress} className="h-3" />
            <div className="text-center text-sm text-gray-600 mt-3 ">
                Step {currentStep + 1} of {totalSteps}
            </div>
        </div>
    );
}