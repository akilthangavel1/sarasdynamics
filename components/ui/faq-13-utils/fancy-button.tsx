"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FancyButtonProps extends ButtonProps {}

export const FancyButton = React.forwardRef<HTMLButtonElement, FancyButtonProps>(
  ({ className, children, size = "lg", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          "rounded-full px-6 font-medium shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
FancyButton.displayName = "FancyButton";

export default FancyButton;
