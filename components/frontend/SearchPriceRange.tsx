"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SearchPriceRange() {
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const params = useSearchParams();
  const sort = params.get("sort") ?? "asc";
  const query = params.get("query");
  const router = useRouter();
  const pathname = usePathname();
  async function handleSubmit() {
    console.log(minValue, maxValue);
    if (maxValue && minValue) {
      router.push(
        `/search?query=${query}&&sort=${sort}&&min=${minValue}&&max=${maxValue}`
      );
    } else if (minValue) {
      router.push(`/search?query=${query}&&sort=${sort}&&min=${minValue}`);
    } else if (maxValue) {
      router.push(`/search?query=${query}&&sort=${sort}&&max=${maxValue}`);
    } else {
      return;
    }
  }
  return (
    <div>
      <div className="flex space-x-1 w-full flex-wrap">
        <input
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
          type="text"
          className="w-1/3"
          placeholder="min"
        />
        <input
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
          type="text"
          className="w-1/3"
          placeholder="max"
        />
        <Button onClick={handleSubmit} variant={"outline"}>
          Go
        </Button>
      </div>
    </div>
  );
}
