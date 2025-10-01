import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-accent shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-muted/20 dark:border-muted/50 dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-[#fc83f5] hover:bg-[#fb6ef2] text-black font-medium relative overflow-hidden",
        trial:
          "bg-[#00b9ff] hover:bg-[#00a8e6] text-black font-medium text-sm tracking-normal leading-normal",
        final:
          "bg-[#2a5bfe] hover:bg-[#2a5bfe]/90 text-white font-medium relative overflow-hidden",
        "primary-action": "bg-blue-600 text-white hover:bg-blue-700",
        "secondary-action":
          "bg-white border-blue-600 text-blue-600 hover:bg-blue-50 border",
        yellow: "bg-[#f7cf1d] hover:bg-[#f7cf1d]/90 text-black font-medium",
        pink: "bg-[#fc83f5] hover:bg-[#fc83f5]/90 text-black font-medium",
        blue: "bg-[#00b9ff] hover:bg-[#00b9ff]/90 text-black font-medium",
      },
      size: {
        default: "h-[42px] rounded-[46px] px-6 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        hero: "h-auto rounded-[46px] px-6 py-3.5 text-base",
        cta: "h-auto px-5 py-2.5 rounded-lg text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
