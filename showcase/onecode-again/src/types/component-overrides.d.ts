/**
 * Type overrides for component libraries
 * 
 * This file relaxes strict typing for UI components during the migration period.
 * The codebase uses patterns from React/Radix that don't perfectly align with
 * Kobalte's stricter SolidJS types.
 * 
 * TODO: Properly refactor components to use Kobalte's expected API patterns
 */

import "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicAttributes {
      // Allow common props that may not be in strict types
      store?: any;
      delayDuration?: number;
      onValueChange?: (value: any) => void;
      placeholder?: string;
      value?: any;
      item?: any;
      asChild?: boolean;
      side?: string;
      align?: string;
      sideOffset?: number;
      alignOffset?: number;
      avoidCollisions?: boolean;
      collisionBoundary?: any;
      collisionPadding?: any;
      sticky?: string;
      hideWhenDetached?: boolean;
      forceMount?: boolean;
    }
  }
}

// Extend Kobalte Select types to be more permissive
declare module "@kobalte/core/select" {
  interface SelectRootProps {
    onValueChange?: (value: any) => void;
    children?: any;
  }
  
  interface SelectValueProps {
    placeholder?: string;
  }
  
  interface SelectItemProps {
    value?: string;
    children?: any;
  }
}

export {};
