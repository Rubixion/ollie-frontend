"use client";

// 21st.dev: diceui/compare-slider. Its four tiny util hooks are inlined below instead of separate files.
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);
  if (ref.current === null) ref.current = fn();
  return ref as React.RefObject<T>;
}

function useAsRef<T>(value: T) {
  const ref = React.useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

const ROOT_NAME = "CompareSlider";
const ARROW_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

interface Store {
  subscribe: (cb: () => void) => () => void;
  getState: () => { value: number };
  setValue: (value: number) => void;
}

const StoreContext = React.createContext<Store | null>(null);

function useValue(store?: Store | null) {
  const ctx = React.useContext(StoreContext);
  const s = store ?? ctx;
  if (!s) throw new Error(`\`useValue\` must be used within \`${ROOT_NAME}\``);
  const get = React.useCallback(() => s.getState().value, [s]);
  return React.useSyncExternalStore(s.subscribe, get, get);
}

interface CompareSliderProps extends DivProps {
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  step?: number;
}

function CompareSlider({ defaultValue = 50, onValueChange, step = 1, className, children, ref, asChild, ...rootProps }: CompareSliderProps) {
  const stateRef = useLazyRef(() => ({ value: clamp(defaultValue, 0, 100) }));
  const listeners = useLazyRef(() => new Set<() => void>());
  const onChange = useAsRef(onValueChange);
  const store = React.useMemo<Store>(
    () => ({
      subscribe: (cb) => {
        listeners.current.add(cb);
        return () => listeners.current.delete(cb);
      },
      getState: () => stateRef.current,
      setValue: (value) => {
        if (stateRef.current.value === value) return;
        stateRef.current = { value };
        onChange.current?.(value);
        for (const cb of listeners.current) cb();
      },
    }),
    [listeners, stateRef, onChange],
  );
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const composedRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const dragging = React.useRef(false);
  const value = useValue(store);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    store.setValue(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100));
  };

  const Root = asChild ? SlotPrimitive.Slot : "div";
  return (
    <StoreContext.Provider value={store}>
      <Root
        role="slider"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(value)}
        data-slot="compare-slider"
        {...rootProps}
        ref={composedRef}
        tabIndex={0}
        className={cn(
          "relative isolate w-full touch-none select-none overflow-hidden outline-none focus-visible:ring-[3px] focus-visible:ring-(--ollie-cyan)/50",
          className,
        )}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          dragging.current = false;
        }}
        onPointerCancel={() => (dragging.current = false)}
        onKeyDown={(e) => {
          if (e.key === "Home") store.setValue(0);
          else if (e.key === "End") store.setValue(100);
          else if (ARROW_KEYS.includes(e.key)) {
            const dir = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
            store.setValue(clamp(store.getState().value + dir * step * (e.shiftKey ? 10 : 1), 0, 100));
          } else return;
          e.preventDefault();
        }}
      >
        {children}
      </Root>
    </StoreContext.Provider>
  );
}

function Side({ side, className, children, style, label, ...props }: DivProps & { side: "before" | "after"; label?: string }) {
  const value = useValue();
  const clipPath = side === "before" ? `inset(0 0 0 ${value}%)` : `inset(0 ${100 - value}% 0 0)`;
  return (
    <div data-slot={`compare-slider-${side}`} {...props} className={cn("absolute inset-0 h-full w-full", className)} style={{ clipPath, ...style }}>
      {children}
      {label && (
        <div
          className={cn(
            "absolute top-2 z-20 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm",
            side === "before" ? "right-2" : "left-2",
          )}
        >
          {label}
        </div>
      )}
    </div>
  );
}

const CompareSliderBefore = (props: DivProps & { label?: string }) => <Side side="before" {...props} />;
const CompareSliderAfter = (props: DivProps & { label?: string }) => <Side side="after" {...props} />;

function CompareSliderHandle({ className }: { className?: string }) {
  const value = useValue();
  return (
    <div
      aria-hidden="true"
      data-slot="compare-slider-handle"
      className={cn("absolute top-0 z-50 flex h-full w-10 -translate-x-1/2 cursor-grab items-center justify-center active:cursor-grabbing", className)}
      style={{ left: `${value}%` }}
    >
      <div className="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-white/90" />
      <div className="z-50 flex size-10 items-center justify-center rounded-full bg-white text-black shadow-lg [&_svg]:size-4">
        <ChevronLeftIcon />
        <ChevronRightIcon />
      </div>
    </div>
  );
}

export { CompareSlider, CompareSliderAfter, CompareSliderBefore, CompareSliderHandle };
