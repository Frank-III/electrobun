import { cva, type VariantProps } from "class-variance-authority";
import { splitProps, type ParentComponent, type JSX } from "solid-js";
import { cn } from "../../lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2 py-[1px] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
export interface BadgeProps extends JSX.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
const Badge: ParentComponent<BadgeProps> = (props) => {
	const [local, others] = splitProps(props, [
		"class",
		"variant",
		"children"
	]);
	return <div class={cn(badgeVariants({ variant: local.variant }), local.class)} {...others}>
      {local.children}
    </div>;
};
export { Badge, badgeVariants };
