import { type JSX, createEffect, createSignal, createMemo } from "solid-js";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface TextShimmerProps {
	children: JSX.Element;
	as?: keyof JSX.IntrinsicElements;
	class?: string;
	duration?: number;
	spread?: number;
	delay?: number;
}

export function TextShimmer(props: TextShimmerProps) {
	const Component = props.as ?? "p";
	const MotionComponent = motion(Component);
	const [shouldAnimate, setShouldAnimate] = createSignal(props.delay === 0 || props.delay === undefined);
	
	createEffect(() => {
		const delay = props.delay;
		if (delay && delay > 0) {
			const timer = setTimeout(() => {
				setShouldAnimate(true);
			}, delay * 1e3);
			return () => clearTimeout(timer);
		}
	});

	const dynamicSpread = createMemo(() => {
		const children = props.children;
		const spread = props.spread ?? 2;
		if (typeof children === "string") {
			return children.length * spread;
		}
		return 50 * spread;
	});

	return (
		<MotionComponent
			class={cn(
				"relative inline-block bg-[length:250%_100%,auto] bg-clip-text",
				"text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]",
				"[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
				"dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]",
				props.class
			)}
			initial={{ backgroundPosition: "100% center" }}
			animate={shouldAnimate() ? { backgroundPosition: "0% center" } : { backgroundPosition: "100% center" }}
			transition={{
				repeat: shouldAnimate() ? Infinity : 0,
				duration: props.duration ?? 2,
				ease: "linear"
			}}
			style={{
				"--spread": `${dynamicSpread()}px`,
				"background-image": `var(--bg), linear-gradient(var(--base-color), var(--base-color))`
			}}
		>
			{props.children}
		</MotionComponent>
	);
}
