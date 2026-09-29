"use client";

// 21st.dev: deltacomponents/product-card, restyled to the Ollie look (dark wells, one blue).
import * as React from "react";

import { cn } from "@/lib/utils";

type ProductCardVariant = "default" | "inner";
type ProductCardSize = "sm" | "default" | "lg";

interface ProductCardContextValue {
  variant: ProductCardVariant;
  size: ProductCardSize;
  animated: boolean;
}

const ProductCardContext = React.createContext<ProductCardContextValue | null>(null);

function useProductCardContext() {
  const context = React.useContext(ProductCardContext);
  if (!context) throw new Error("ProductCard compound components must be used within <ProductCard>");
  return context;
}

const cardWidth: Record<ProductCardSize, string> = { sm: "max-w-[200px]", default: "max-w-[320px]", lg: "max-w-[460px]" };
const cardText: Record<ProductCardSize, string> = { sm: "text-xs", default: "text-sm", lg: "text-base" };
const imagePadding: Record<ProductCardSize, string> = { sm: "p-4", default: "p-8", lg: "p-12" };
const imagePaddingInner: Record<ProductCardSize, string> = { sm: "pb-14", default: "pb-20", lg: "pb-24" };
const contentPadding: Record<ProductCardSize, string> = { sm: "px-0.5 py-2", default: "px-1 py-3", lg: "px-2 py-4" };
const contentPaddingInner: Record<ProductCardSize, string> = { sm: "p-2", default: "p-3", lg: "p-4" };
const badgePosition: Record<ProductCardSize, string> = {
  sm: "top-1.5 right-1.5 px-1.5 py-0.5",
  default: "top-2 right-2 px-2 py-1",
  lg: "top-3 right-3 px-3 py-1.5",
};

interface ProductCardProps extends React.ComponentProps<"div"> {
  variant?: ProductCardVariant;
  size?: ProductCardSize;
  animated?: boolean;
}

function ProductCard({ className, variant = "default", size = "default", animated = true, children, ...props }: ProductCardProps) {
  const interactive = Boolean(props.onClick);
  return (
    <ProductCardContext.Provider value={{ variant, size, animated }}>
      <div
        data-slot="product-card"
        className={cn("w-full overflow-hidden rounded-xl", cardText[size], cardWidth[size], interactive && "cursor-pointer", className)}
        {...props}
      >
        {children}
      </div>
    </ProductCardContext.Provider>
  );
}

interface ProductCardImageProps extends React.ComponentProps<"div"> {
  /** Omit for an icon/placeholder well: pass the icon as children. */
  src?: string;
  alt?: string;
  imageClassName?: string;
}

function ProductCardImage({ className, src, alt = "", imageClassName, children, ...props }: ProductCardImageProps) {
  const { variant, size, animated } = useProductCardContext();
  const wellRef = React.useRef<HTMLDivElement>(null);
  const [pressed, setPressed] = React.useState(false);
  React.useEffect(() => {
    if (!pressed) return;
    const release = (event: PointerEvent) => {
      if (!wellRef.current?.contains(event.target as Node)) setPressed(false);
    };
    document.addEventListener("pointerdown", release);
    return () => document.removeEventListener("pointerdown", release);
  }, [pressed]);
  const pressToHold = (event: React.PointerEvent<HTMLDivElement>) => {
    if (animated && event.pointerType === "touch") setPressed(true);
  };

  return (
    <div
      ref={wellRef}
      data-slot="product-card-image"
      data-pressed={pressed || undefined}
      onPointerDown={pressToHold}
      className={cn(
        "group/card-image relative aspect-square w-full overflow-hidden rounded-xl transition-colors",
        "bg-black/35 hover:bg-white/[0.05] active:bg-white/[0.05] data-[pressed]:bg-white/[0.05]",
        className,
      )}
      {...props}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- registry component; product images come from store feeds
        <img
          data-slot="product-card-img"
          src={src}
          alt={alt}
          className={cn(
            "absolute inset-0 h-full w-full object-contain",
            animated && "transition-transform duration-300 group-hover/card-image:-translate-y-2 group-data-[pressed]/card-image:-translate-y-2 motion-reduce:transition-none",
            imagePadding[size],
            variant === "inner" && imagePaddingInner[size],
            imageClassName,
          )}
        />
      )}
      {children}
    </div>
  );
}

interface ProductCardBadgeProps extends React.ComponentProps<"span"> {
  isActive?: boolean;
  icon?: React.ReactNode;
}

// A label, not a control here (the whole card is the button), so it renders a span.
function ProductCardBadge({ className, isActive = false, icon, children, ...props }: ProductCardBadgeProps) {
  const { size } = useProductCardContext();
  return (
    <span
      data-slot="product-card-badge"
      className={cn(
        "absolute flex items-center gap-1 rounded-lg text-[0.85em] font-semibold",
        badgePosition[size],
        isActive ? "bg-(--ollie-cyan) text-black" : "bg-black/70 text-white/80",
        className,
      )}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

function ProductCardContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const { variant, size } = useProductCardContext();
  return (
    <div
      data-slot="product-card-content"
      className={cn(
        "flex items-start justify-between gap-2",
        variant === "default" && contentPadding[size],
        variant === "inner" && ["absolute inset-x-0 bottom-0 items-end", contentPaddingInner[size]],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ProductCardHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="product-card-header" className={cn("min-w-0 flex-1", className)} {...props}>
      {children}
    </div>
  );
}

function ProductCardTitle({ className, children, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 data-slot="product-card-title" className={cn("truncate font-semibold text-white", className)} {...props}>
      {children}
    </h3>
  );
}

function ProductCardSubtitle({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="product-card-subtitle" className={cn("text-white/60", className)} {...props}>
      {children}
    </p>
  );
}

function ProductCardMetric({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="product-card-metric" className={cn("shrink-0 font-semibold text-white", className)} {...props}>
      {children}
    </span>
  );
}

export {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardContent,
  ProductCardHeader,
  ProductCardTitle,
  ProductCardSubtitle,
  ProductCardMetric,
};
