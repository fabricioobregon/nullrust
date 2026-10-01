import { FieldOption } from "@/lib/aspects/types";

const WEIGHT_CLASSES: Record<NonNullable<FieldOption["weight"]>, string> = {
  xl: "text-3xl sm:text-4xl",
  lg: "text-2xl sm:text-3xl",
  md: "text-xl sm:text-2xl",
  sm: "text-base sm:text-lg",
};

// Deterministic (not random) so the layout never shifts between renders —
// cycling through a small set of tilts is what gives the "scattered" feel.
const ROTATIONS = ["-rotate-3", "rotate-2", "rotate-0", "-rotate-1", "rotate-3", "rotate-1", "-rotate-2"];

export function OptionCloud({
  options,
  selected,
  fieldId,
  inputType,
}: {
  options: FieldOption[];
  selected: Set<string>;
  fieldId: string;
  inputType: "radio" | "checkbox";
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-3 px-4 py-8">
      {options.map((opt, i) => {
        const isSelected = selected.has(opt.value);
        return (
          <label
            key={opt.value}
            title={opt.description}
            className={[
              "relative inline-block cursor-pointer select-none rounded-md px-1 font-semibold transition-all duration-200 ease-out",
              WEIGHT_CLASSES[opt.weight ?? "md"],
              ROTATIONS[i % ROTATIONS.length],
              isSelected
                ? "text-indigo-700 underline underline-offset-4"
                : "text-slate-400 hover:text-indigo-600",
              "hover:z-10 hover:scale-125 hover:rotate-0",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-400 has-[:focus-visible]:ring-offset-2",
            ].join(" ")}
          >
            <input
              type={inputType}
              name={fieldId}
              value={opt.value}
              defaultChecked={isSelected}
              className="sr-only"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
