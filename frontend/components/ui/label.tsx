"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-medium text-slate-500 dark:text-slate-400",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
