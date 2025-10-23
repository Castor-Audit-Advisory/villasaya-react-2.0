import * as React from "react";
import { sanitizeInput } from "../../utils/formValidation";
import { cn } from "./utils";

interface TextareaProps extends Omit<React.ComponentProps<"textarea">, 'onChange'> {
  /**
   * Disable automatic input sanitization (default: false - sanitization is ON)
   * Set to true ONLY for: code editors, markdown content, or pre-formatted text
   * SECURITY: Default sanitization protects against XSS attacks
   */
  disableSanitization?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function Textarea({ className, disableSanitization = false, onChange, ...props }: TextareaProps) {
  // Handle onChange with automatic sanitization by default (secure-by-default)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!disableSanitization) {
      const originalValue = e.target.value;
      const sanitizedValue = sanitizeInput(originalValue);
      e.target.value = sanitizedValue;
    }
    onChange?.(e);
  };

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  );
}

export { Textarea };
