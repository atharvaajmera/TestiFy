import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function GlassCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <Card className={cn(
            "relative overflow-hidden border-white/40 shadow-xl",
            "bg-primary backdrop-blur-md",
            className
        )}>
            {children}
        </Card>
    )
}