"use client";

import { useState } from "react";

import { X } from "lucide-react";
import { Command, CommandGroup, CommandInput, CommandItem } from "../command";
import { Badge } from "../badge";
import { SubcategoryType } from "@/types/next-utils";

interface MultiSelectProps {
  placeholder: string;
  categories: SubcategoryType[];
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}

export default function MultiSelect({
  placeholder,
  categories,
  value,
  onChange,
  onRemove,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const selected =
    value.length === 0
      ? []
      : value
          .map((id) => categories.find((category) => category._id === id))
          .filter(
            (category): category is SubcategoryType => category !== undefined,
          );

  const selectable = categories.filter(
    (category) =>
      !selected.some(
        (selectedCategory) => selectedCategory._id === category._id,
      ),
  );

  return (
    <Command className="overflow-visible bg-white">
      <div className="flex flex-wrap gap-1 rounded-md border border-gray-1/25">
        {selected.map((collection: SubcategoryType) => (
          <Badge key={collection?._id}>
            {collection?.name}
            <button
              type="button"
              className="ml-1 rounded-full transition-colors duration-200 hover:bg-red-1"
              onClick={() => onRemove(collection?._id)}
            >
              <X className="size-3 text-red-1 transition-colors duration-300 hover:text-white" />
            </button>
          </Badge>
        ))}

        <CommandInput
          placeholder={placeholder}
          value={inputValue}
          onValueChange={setInputValue}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
        />
      </div>

      <div className="relative mt-2">
        {open && (
          <CommandGroup className="absolute top-0 z-30 w-full overflow-auto rounded-md border border-gray-1/25 bg-white shadow-md">
            {selectable.map((category: SubcategoryType) => (
              <CommandItem
                key={category._id}
                onMouseDown={(e) => e.preventDefault()}
                onSelect={() => {
                  onChange(category._id);
                  setInputValue("");
                }}
                className="cursor-pointer hover:bg-gray-2"
              >
                {category.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </div>
    </Command>
  );
}
