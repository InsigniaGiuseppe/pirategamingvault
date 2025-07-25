
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-2 border-black bg-white text-black hover:bg-black hover:text-white",
        destructive:
          "bg-black text-white hover:bg-gray-800",
        outline:
          "border-2 border-black bg-white text-black hover:bg-black hover:text-white",
        secondary:
          "border-2 border-black bg-white text-black hover:bg-black hover:text-white",
        ghost: "hover:bg-gray-100 hover:text-black",
        link: "text-black underline-offset-4 hover:underline",
        tertiary: "bg-gray-100 text-gray-600 hover:bg-gray-200",
        payment: "bg-[#0075FF] text-white hover:bg-blue-700 border-0",
        donation: "bg-[#0075FF] text-white hover:bg-blue-700 border-0",
        subscription: "bg-[#0075FF] text-white hover:bg-blue-700 border-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
