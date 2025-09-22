import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  viewTransitionName?: string;
}

export function PageHeader({
  title,
  subtitle,
  backHref = "/",
  backLabel = "Back to Home",
  viewTransitionName
}: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container px-4 py-2 md:py-4 md:mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={backHref} className="flex items-center">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline ml-2">{backLabel}</span>
            </Link>
          </Button>
          {(title || subtitle) && (
            <div className="flex-1">
              {title && <h1 className="text-base md:text-lg font-semibold" style={viewTransitionName ? { viewTransitionName } : undefined}>{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}