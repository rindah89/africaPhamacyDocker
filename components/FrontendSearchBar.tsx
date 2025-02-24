import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { ChangeEvent, useState } from "react";
import { SearchProduct } from "./global/ShopHeader";
import { useRouter } from "next/navigation";

export default function FrontendSearchBar({
  products,
}: {
  products: SearchProduct[];
}) {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const searchProducts = searchResults.filter((item) => item.type === "prod");
  const searchCategories = searchResults.filter((item) => item.type === "cat");
  const searchBrands = searchResults.filter((item) => item.type === "brand");
  const [query, setQuery] = useState("");
  function onSearch(e: ChangeEvent<HTMLInputElement>) {
    setSearchResults([]);
    const searchTerm = e.target.value.toLowerCase();
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const filteredData = products.filter((item) =>
      Object.values(item).some(
        (value: any) =>
          value &&
          value.toString().toLowerCase().includes(e.target.value.toLowerCase())
      )
    );

    setSearchResults(filteredData);
    setQuery(searchTerm);
  }
  const router = useRouter();
  function handleButtonClick() {
    console.log(query);
    if (!query) {
      return;
    }
    router.push(`/search?query=${query}`);
  }
  return (
    <div>
      <div className="relative w-full z-50 group">
        <div className="relative w-full">
          <input
            onChange={onSearch}
            type="search"
            id="location-search"
            className="peer block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2.5  z-20 text-sm  bg-gray-50 rounded-e-lg   border-gray-300   dark:bg-gray-700 dark:border-s-gray-700 focus:shadow-lg  dark:placeholder-gray-400 dark:text-white "
            placeholder="Search for drugs"
            required
          />
          <button
            onClick={handleButtonClick}
            type="button"
            className="absolute top-0 end-0 h-full p-2.5 text-sm font-medium text-white bg-indigo-700 rounded-e-lg border border-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
          >
            <Search className="w-4 h-4" />

            <span className="sr-only">Search</span>
          </button>
        </div>
        {searchResults && searchResults.length > 0 && (
          <div className="absolute mt-2 w-full overflow-hidden rounded-md bg-white border shadow-lg  ">
            {/* <h2 className="py-2 bg-slate-100 px-3 uppercase font-semibold">
              Suggestions
            </h2>
            <div className="py-2 space-y-1 flex flex-col px-3 text-sm">
              <Link href={"#"}>Laptop</Link>
              <Link href={"#"}>Laptop Power</Link>
              <Link href={"#"}>Laptop Table</Link>
            </div> */}
            {searchProducts && searchProducts.length > 0 && (
              <div className="">
                <h2 className="py-2 bg-slate-100 px-3 uppercase font-semibold">
                  Products
                </h2>
                {searchProducts.map((product) => {
                  return (
                    <Link
                      href={`/product/${product.slug}`}
                      key={product.slug}
                      className="cursor-pointer py-2 px-3 hover:bg-slate-100 flex items-center"
                    >
                      <Image
                        src={product.productThumbnail}
                        width={300}
                        height={300}
                        alt="watch"
                        className="w-10 h-10 rounded-lg"
                      />
                      <p className="text-sm text-gray-600">{product.name}</p>
                    </Link>
                  );
                })}
              </div>
            )}
            {searchCategories && searchCategories.length > 0 && (
              <div className="">
                <h2 className="py-2 bg-slate-100 px-3 uppercase font-semibold">
                  Categories
                </h2>
                {searchCategories.map((product) => {
                  return (
                    <Link
                      href={`/categories/${product.slug}?type=cat`}
                      key={product.slug}
                      className="cursor-pointer py-2 px-3 hover:bg-slate-100 flex items-center"
                    >
                      <Image
                        src={product.productThumbnail}
                        width={300}
                        height={300}
                        alt="watch"
                        className="w-10 h-10 rounded-lg"
                      />
                      <p className="text-sm text-gray-600">{product.name}</p>
                    </Link>
                  );
                })}
              </div>
            )}
            {searchBrands && searchBrands.length > 0 && (
              <div className="">
                <h2 className="py-2 bg-slate-100 px-3 uppercase font-semibold">
                  Brands
                </h2>
                {searchBrands.map((product) => {
                  return (
                    <Link
                      href={`/brands/${product.slug}?id=${product?.id}`}
                      key={product.slug}
                      className="cursor-pointer py-2 px-3 hover:bg-slate-100 flex items-center"
                    >
                      <Image
                        src={product.productThumbnail}
                        width={300}
                        height={300}
                        alt="watch"
                        className="w-10 h-10 rounded-lg"
                      />
                      <p className="text-sm text-gray-600">{product.name}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
