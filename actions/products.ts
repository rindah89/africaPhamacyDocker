"use server";



import {

  CategoryProps,

  ExcelCategoryProps,

  ProductProps,

  ProductResult,

} from "@/types/types";

import prisma from "@/lib/db";

import { revalidatePath } from "next/cache";

import { Product, Review, SubCategory, Category, Brand } from "@prisma/client";

import { SearchProduct } from "@/components/global/ShopHeader";

import { ProductWithReviews } from "@/components/frontend/listings/ProductListing";

import { ipcRenderer } from 'electron';



export interface GroupedProducts {

  subCategory: SubCategory;

  products: ProductWithReviews[];

}

export async function createProduct(data: ProductProps) {

  const slug = data.slug;

  try {

    const existingProduct = await prisma.product.findUnique({

      where: {

        slug,

      },

    });

    if (existingProduct) {

      return {

        error: "This product already exists",

        data: existingProduct,

        success: false,

      };

    }

    const newProduct = await prisma.product.create({

      data,

    });

    // console.log(newProduct);

    revalidatePath("/dashboard/inventory/products");

    return {

      error: null,

      data: newProduct,

      success: true,

    };

  } catch (error) {

    console.log(error);

    return {

      error,

      data: null,

      success: false,

    };

  }

}

export async function getAllProducts() {

  try {

    const products = await prisma.product.findMany({

      orderBy: {

        createdAt: "desc",

      },

      include: {

        subCategory: true,

        reviews: {

          select: {

            id: true,

            rating: true,

          }

        },

        batches: {

          where: {

            status: true

          },

          select: {

            id: true,

            quantity: true,

            costPerUnit: true,

          }

        }

      },

    });



    return products;

  } catch (error) {

    console.log(error);

    return null;

  }

}

export async function getAllProductsNoLimit() {
  try {
    console.log('Fetching all products...');
    
    // First, let's check if there are any products at all
    const count = await prisma.product.count();
    console.log('Total number of products in database:', count);

    if (count === 0) {
      console.log('No products found in the database');
      return [];
    }

    // If we have products, fetch them with their relations
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subCategory: {
          include: {
            category: true
          }
        }
      },
    });

    console.log('Products fetched successfully:', products.length);
    if (products.length > 0) {
      console.log('Sample product:', {
        id: products[0].id,
        name: products[0].name,
        stockQty: products[0].stockQty
      });
    }

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return null;
  }
}

export async function getProductsWithSales() {

  try {

    const products = await prisma.product.findMany({

      orderBy: {

        createdAt: "desc",

      },

      include: {

        subCategory: true,

        sales: true,

        purchaseOrders: true,

      },

    });



    return products;

  } catch (error) {

    console.log(error);

    return null;

  }

}

export async function getSearchProducts() {

  try {

    // Get products with basic filtering and limit

    const allProducts = await prisma.product.findMany({

      where: {

        AND: [

          { status: true },  // Only active products

          { stockQty: { gt: 0 } }  // Only products in stock

        ]

      },

      take: 50, // Limit results

      orderBy: {

        name: 'asc'

      },

      select: {

        name: true,

        slug: true,

        productThumbnail: true,

        stockQty: true,

      },

    });



    if (!allProducts || allProducts.length === 0) {

      return [];

    }



    const products = allProducts.map((item: Product) => ({

      name: item.name,

      slug: item.slug,

      productThumbnail: item.productThumbnail,

      type: "prod",

    }));



    // Get categories

    const allCategories = await prisma.category.findMany({

      where: {

        status: true  // Only active categories

      },

      take: 20,

      orderBy: {

        title: 'asc'

      },

      select: {

        title: true,

        slug: true,

        imageUrl: true,

      },

    });



    // Get brands

    const allBrands = await prisma.brand.findMany({

      where: {

        status: true  // Only active brands

      },

      take: 20,

      orderBy: {

        title: 'asc'

      },

      select: {

        title: true,

        slug: true,

        logo: true,

        id: true,

      },

    });



    const categories = allCategories.map((item: Category) => ({

      name: item.title,

      slug: item.slug,

      productThumbnail: item.imageUrl,

      type: "cat",

    }));



    const brands = allBrands.map((item: Brand) => ({

      name: item.title,

      slug: item.slug,

      productThumbnail: item.logo,

      type: "brand",

      id: item.id,

    }));



    // Combine and return results

    const results = [...products, ...categories, ...brands];

    return results as SearchProduct[];

  } catch (error) {

    console.error("Search error:", error);

    return [];  // Return empty array instead of null

  }

}

export async function getProductsByCategoryId(catId: string) {

  try {

    if (catId === "all") {

      const products = await prisma.product.findMany({

        where: {

          stockQty: {

            gt: 0

          }

        },

        select: {

          id: true,

          name: true,

          content: true,

          productCode: true,

          stockQty: true,

          productPrice: true,

          productThumbnail: true,

          status: true,

          slug: true,

          createdAt: true,

          updatedAt: true,

          productCost: true,

          productDetails: true,

          productImages: true,

          supplierId: true,

          supplierPrice: true,

          alertQty: true,

          productTax: true,

          taxMethod: true,

          brandId: true,

          subCategoryId: true,

          unitId: true,

          isFeatured: true,

          supplier: {

            select: {

              name: true

            }

          }

        }

      });

      return products;

    } else {

      const products = await prisma.product.findMany({

        where: {

          AND: [

            {

              subCategory: {

                categoryId: catId,

              }

            },

            {

              stockQty: {

                gt: 0

              }

            }

          ]

        },

        select: {

          id: true,

          name: true,

          content: true,

          productCode: true,

          stockQty: true,

          productPrice: true,

          productThumbnail: true,

          status: true,

          slug: true,

          createdAt: true,

          updatedAt: true,

          productCost: true,

          productDetails: true,

          productImages: true,

          supplierId: true,

          supplierPrice: true,

          alertQty: true,

          productTax: true,

          taxMethod: true,

          brandId: true,

          subCategoryId: true,

          unitId: true,

          isFeatured: true,

          supplier: {

            select: {

              name: true

            }

          }

        }

      });

      return products;

    }

  } catch (error) {

    console.log(error);

    return null;

  }

}

export async function getProductsByBrandId(brandId: string) {

  try {

    const products = await prisma.product.findMany({

      where: {

        brandId,

      },

    });

    return products;

  } catch (error) {

    console.log(error);

    return null;

  }

}

export async function getGroupedProductsByBrandId(brandId: string) {

  try {

    const products = await prisma.product.findMany({

      where: {

        brandId,

      },

      include: {

        subCategory: true,

        reviews: true,

      },

    });

    const groupedProducts = products.reduce((acc: Record<string, GroupedProducts>, product: Product & { subCategory: SubCategory; reviews: Review[] }) => {
      const subCategory = product.subCategory;
      if (!acc[subCategory.id]) {
        acc[subCategory.id] = {
          subCategory,
          products: [],
        };
      }
      acc[subCategory.id].products.push(product);
      return acc;
    }, {} as Record<string, GroupedProducts>);



    return Object.values(groupedProducts);

  } catch (error) {

    console.log(error);

    return null;

  }

}



export async function createBulkProducts(products: ProductProps[]) {

  try {

    for (const product of products) {

      await createProduct(product);

    }

  } catch (error) {

    console.log(error);

  }

}

export async function getProductById(id: string) {

  try {

    const product = await prisma.product.findUnique({

      where: {

        id,

      },

    });

    return product;

  } catch (error) {

    console.log(error);

  }

}

export async function getProductBySlug(slug: string) {

  try {

    const product = await prisma.product.findUnique({

      where: {

        slug,

      },

      include: {

        subCategory: {

          include: {

            category: {

              include: {

                mainCategory: true,

              },

            },

          },

        },

        brand: true,

      },

    });

    return product;

  } catch (error) {

    console.log(error);

  }

}

export async function getProductDetails(id: string) {

  try {

    const product = await prisma.product.findUnique({

      where: {

        id,

      },

      include: {

        subCategory: {

          include: {

            category: {

              include: {

                mainCategory: true,

              },

            },

          },

        },

        brand: true,

      },

    });

    return product;

  } catch (error) {

    console.log(error);

  }

}

export async function updateProductById(id: string, data: ProductProps) {

  try {

    const updatedProduct = await prisma.product.update({

      where: {

        id,

      },

      data,

    });

    revalidatePath("/dashboard/inventory/products");

    return updatedProduct;

  } catch (error) {

    console.log(error);

  }

}

export async function getSimilarProducts(

  subCategoryId: string | undefined,

  productId: string | undefined

) {

  if (subCategoryId && productId) {

    try {

      const similarProducts = await prisma.product.findMany({

        where: {

          subCategoryId,

          id: {

            not: productId,

          },

        },

        take: 6,

        include: {

          reviews: true,

        },

      });



      return similarProducts;

    } catch (error) {

      console.log(error);

    }

  }

}



export async function deleteProduct(id: string) {

  try {

    const deletedProduct = await prisma.product.delete({

      where: {

        id,

      },

    });



    return {

      ok: true,

      data: deletedProduct,

    };

  } catch (error) {

    console.log(error);

  }

}



// GET PRODUCTS BY CAT SLUG

type BriefCategory = {

  title: string;

  slug: string;

  type: string;

};



// export async function getProductsByCategorySlug(

//   slug: string,

//   type: string,

//   page: number,

//   sort?: "asc" | "desc",

//   min?: number,

//   max?: number

// ) {

//   console.log(page);

//   let products: Product[] = [];

//   let categories: BriefCategory[] = [];

//   const pageSize = 5;

//   let totalCount = 0;

//   try {

//     if (type === "main") {

//       const productsInMainCategory = await prisma.mainCategory.findUnique({

//         where: { slug },

//         include: {

//           categories: {

//             include: {

//               subCategories: {

//                 include: {

//                   products: sort

//                     ? {

//                         orderBy: {

//                           productPrice: sort,

//                         },

//                         where: {

//                           productPrice: {

//                             gte: min || 0,

//                             lte: max || Number.MAX_SAFE_INTEGER,

//                           },

//                         },

//                         skip: (page - 1) * pageSize,

//                         take: pageSize,

//                       }

//                     : {

//                         where: {

//                           productPrice: {

//                             gte: min || 0,

//                             lte: max || Number.MAX_SAFE_INTEGER,

//                           },

//                         },

//                         skip: (page - 1) * pageSize,

//                         take: pageSize,

//                       },

//                 },

//               },

//             },

//           },

//         },

//       });

//       if (productsInMainCategory) {

//         products = productsInMainCategory.categories.flatMap((category) =>

//           category.subCategories.flatMap((subCategory) => subCategory.products)

//         );

//         totalCount = await prisma.product.count({

//           where: {

//             subCategory: {

//               category: {

//                 mainCategoryId: productsInMainCategory.id,

//               },

//             },

//             productPrice: {

//               gte: min || 0,

//               lte: max || Number.MAX_SAFE_INTEGER,

//             },

//           },

//         });

//         categories = productsInMainCategory.categories.map((cat) => {

//           return {

//             title: cat.title,

//             slug: cat.slug,

//             type: "cat",

//           };

//         });

//       }

//     } else if (type === "cat") {

//       const productsInCategory = await prisma.category.findUnique({

//         where: { slug },

//         include: {

//           subCategories: {

//             include: {

//               products: sort

//                 ? {

//                     orderBy: {

//                       productPrice: sort,

//                     },

//                     where: {

//                       productPrice: {

//                         gte: min || 0,

//                         lte: max || Number.MAX_SAFE_INTEGER,

//                       },

//                     },

//                     skip: (page - 1) * pageSize,

//                     take: pageSize,

//                   }

//                 : {

//                     where: {

//                       productPrice: {

//                         gte: min || 0,

//                         lte: max || Number.MAX_SAFE_INTEGER,

//                       },

//                     },

//                     skip: (page - 1) * pageSize,

//                     take: pageSize,

//                   },

//             },

//           },

//         },

//       });



//       if (productsInCategory) {

//         products = productsInCategory.subCategories.flatMap(

//           (subCategory) => subCategory.products

//         );

//         totalCount = await prisma.product.count({

//           where: {

//             subCategory: {

//               categoryId: productsInCategory.id,

//             },

//             productPrice: {

//               gte: min || 0,

//               lte: max || Number.MAX_SAFE_INTEGER,

//             },

//           },

//         });

//         categories = productsInCategory.subCategories.map((cat) => {

//           return {

//             title: cat.title,

//             slug: cat.slug,

//             type: "sub",

//           };

//         });

//       }

//     } else if (type === "sub") {

//       const productsInSubCategory = await prisma.subCategory.findUnique({

//         where: { slug },

//         include: {

//           products: sort

//             ? {

//                 orderBy: {

//                   productPrice: sort,

//                 },

//                 where: {

//                   productPrice: {

//                     gte: min || 0,

//                     lte: max || Number.MAX_SAFE_INTEGER,

//                   },

//                 },

//                 skip: (page - 1) * pageSize,

//                 take: pageSize,

//               }

//             : {

//                 where: {

//                   productPrice: {

//                     gte: min || 0,

//                     lte: max || Number.MAX_SAFE_INTEGER,

//                   },

//                 },

//                 skip: (page - 1) * pageSize,

//                 take: pageSize,

//               },

//         },

//       });



//       if (productsInSubCategory) {

//         products = productsInSubCategory.products;

//         totalCount = await prisma.product.count({

//           where: {

//             subCategoryId: productsInSubCategory.id,

//             productPrice: {

//               gte: min || 0,

//               lte: max || Number.MAX_SAFE_INTEGER,

//             },

//           },

//         });

//         categories = [];

//       }

//     }



//     return {

//       products,

//       categories,

//       totalPages: Math.ceil(totalCount / pageSize),

//     };

//   } catch (error) {

//     console.log(error);

//     return null;

//   }

// }

export async function getProductsByCategorySlug(

  slug: string,

  type: string,

  page: number,

  pageSize: number,

  sort?: "asc" | "desc",

  min?: number,

  max?: number

) {

  let products: Product[] = [];

  let categories: BriefCategory[] = [];

  let totalCount = 0;



  const priceFilter = {

    gte: min || 0,

    lte: max || Number.MAX_SAFE_INTEGER,

  };



  try {

    if (type === "main") {

      const mainCategory = await prisma.mainCategory.findUnique({

        where: { slug },

        include: {

          categories: true,

        },

      });



      if (mainCategory) {

        totalCount = await prisma.product.count({

          where: {

            subCategory: {

              category: {

                mainCategoryId: mainCategory.id,

              },

            },

            productPrice: priceFilter,

          },

        });



        products = await prisma.product.findMany({

          where: {

            subCategory: {

              category: {

                mainCategoryId: mainCategory.id,

              },

            },

            productPrice: priceFilter,

          },

          orderBy: sort ? { productPrice: sort } : undefined,

          skip: (page - 1) * pageSize,

          take: pageSize,

        });



        categories = mainCategory.categories.map((cat: Category) => ({

          title: cat.title,

          slug: cat.slug,

          type: "cat",

        }));

      }

    } else if (type === "cat") {

      const category = await prisma.category.findUnique({

        where: { slug },

        include: {

          subCategories: true,

        },

      });



      if (category) {

        totalCount = await prisma.product.count({

          where: {

            subCategory: {

              categoryId: category.id,

            },

            productPrice: priceFilter,

          },

        });



        products = await prisma.product.findMany({

          where: {

            subCategory: {

              categoryId: category.id,

            },

            productPrice: priceFilter,

          },

          orderBy: sort ? { productPrice: sort } : undefined,

          skip: (page - 1) * pageSize,

          take: pageSize,

        });



        categories = category.subCategories.map((subCat: SubCategory) => ({

          title: subCat.title,

          slug: subCat.slug,

          type: "sub",

        }));

      }

    } else if (type === "sub") {

      const subCategory = await prisma.subCategory.findUnique({

        where: { slug },

      });



      if (subCategory) {

        totalCount = await prisma.product.count({

          where: {

            subCategoryId: subCategory.id,

            productPrice: priceFilter,

          },

        });



        products = await prisma.product.findMany({

          where: {

            subCategoryId: subCategory.id,

            productPrice: priceFilter,

          },

          orderBy: sort ? { productPrice: sort } : undefined,

          skip: (page - 1) * pageSize,

          take: pageSize,

        });



        categories = [];

      }

    }



    return {

      products,

      categories,

      totalCount,

    };

  } catch (error) {

    console.log(error);

    return null;

  }

}

// export async function getProductsBySearchQuery(

//   query: string,

//   sort?: "asc" | "desc",

//   min?: number,

//   max?: number

// ) {

//   const categories = await prisma.category.findMany({

//     where: {

//       OR: [

//         { title: { contains: query, mode: "insensitive" } },

//         { description: { contains: query, mode: "insensitive" } },

//       ],

//     },

//   });

//   const brands = await prisma.brand.findMany({

//     where: {

//       OR: [

//         { title: { contains: query, mode: "insensitive" } },

//         { slug: { contains: query, mode: "insensitive" } },

//       ],

//     },

//   });



//   const products = await prisma.product.findMany({

//     where: {

//       OR: [

//         { name: { contains: query, mode: "insensitive" } },

//         { productDetails: { contains: query, mode: "insensitive" } },

//       ],

//       AND: [

//         min ? { productPrice: { gte: min } } : {},

//         max ? { productPrice: { lte: max } } : {},

//       ],

//     },

//     select: {

//       id: true,

//       name: true,

//       slug: true,

//       stockQty: true,

//       productCost: true,

//       productPrice: true,

//       productThumbnail: true,

//       subCategoryId: true,

//       brandId: true,

//     },

//     orderBy: {

//       productPrice: sort,

//     },

//   });



//   const allProducts = await prisma.product.findMany({

//     select: {

//       id: true,

//       name: true,

//       slug: true,

//       stockQty: true,

//       productCost: true,

//       productPrice: true,

//       productThumbnail: true,

//       subCategoryId: true,

//       brandId: true,

//     },

//   });



//   // Filter products based on the found categories and brands

//   const categoryIds = categories.map((category) => category.id);

//   const brandIds = brands.map((brand) => brand.id);



//   const filteredProducts = allProducts.filter((product) => {

//     return (

//       categoryIds.includes(product.subCategoryId) ||

//       brandIds.includes(product.brandId)

//     );

//   });



//   const resultingProducts = [...products, ...filteredProducts];

//   // Remove duplicate products

//   const uniqueProductIds = new Set();

//   const uniqueProducts = resultingProducts.filter((product) => {

//     if (!uniqueProductIds.has(product.id)) {

//       uniqueProductIds.add(product.id);

//       return true;

//     }

//     return false;

//   });



//   return uniqueProducts as Product[];

// }

export async function getProductsBySearchQuery(

  query: string,

  sort?: "asc" | "desc",

  min?: number,

  max?: number

) {

  const categories = await prisma.category.findMany({

    where: {

      OR: [

        { title: { contains: query, mode: "insensitive" } },

        { description: { contains: query, mode: "insensitive" } },

      ],

    },

  });



  const brands = await prisma.brand.findMany({

    where: {

      OR: [

        { title: { contains: query, mode: "insensitive" } },

        { slug: { contains: query, mode: "insensitive" } },

      ],

    },

  });



  const products = await prisma.product.findMany({

    where: {

      OR: [

        { name: { contains: query, mode: "insensitive" } },

        { productDetails: { contains: query, mode: "insensitive" } },

      ],

      AND: [

        min ? { productPrice: { gte: min } } : {},

        max ? { productPrice: { lte: max } } : {},

      ],

    },

    select: {

      id: true,

      name: true,

      slug: true,

      stockQty: true,

      productCost: true,

      productPrice: true,

      productThumbnail: true,

      subCategoryId: true,

      brandId: true,

    },

    orderBy: {

      productPrice: sort,

    },

  });



  const allProducts = await prisma.product.findMany({

    select: {

      id: true,

      name: true,

      slug: true,

      stockQty: true,

      productCost: true,

      productPrice: true,

      productThumbnail: true,

      subCategoryId: true,

      brandId: true,

    },

  });



  // Filter products based on the found categories and brands, and apply min, max, and sort

  const categoryIds = categories.map((category: Category) => category.id);

  const brandIds = brands.map((brand: Brand) => brand.id);



  let filteredProducts = allProducts.filter((product: Product) => {

    return (

      categoryIds.includes(product.subCategoryId) ||

      brandIds.includes(product.brandId)

    );

  });



  // Apply min and max price filters to the filtered products

  filteredProducts = filteredProducts.filter((product: Product) => {

    const meetsMinCondition = min ? product.productPrice >= min : true;

    const meetsMaxCondition = max ? product.productPrice <= max : true;

    return meetsMinCondition && meetsMaxCondition;

  });



  // Sort the filtered products if sort is provided

  if (sort) {

    filteredProducts.sort((a: Product, b: Product) => {

      if (sort === "asc") {

        return a.productPrice - b.productPrice;

      } else {

        return b.productPrice - a.productPrice;

      }

    });

  }



  const resultingProducts = [...products, ...filteredProducts];



  // Remove duplicate products

  const uniqueProductIds = new Set();

  const uniqueProducts = resultingProducts.filter((product) => {

    if (!uniqueProductIds.has(product.id)) {

      uniqueProductIds.add(product.id);

      return true;

    }

    return false;

  });



  return uniqueProducts as Product[];

}



export async function getBestSellingProducts(productCount: number) {
  try {
    const topSellingProducts = await prisma.product.findMany({
      take: productCount,
      where: {
        status: true, // Only include active products
      },
      orderBy: {
        sales: {
          _count: "desc",
        },
      },
      include: {
        sales: {
          select: {
            id: true,
            qty: true,
            salePrice: true,
            productName: true,
            productImage: true,
            customerName: true,
            customerEmail: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });
    
    if (!topSellingProducts) {
      console.error("No products found");
      return [];
    }
    
    return topSellingProducts;
  } catch (error) {
    console.error("Error in getBestSellingProducts:", error);
    return [];
  }
}

export async function searchPOSProducts(searchQuery: string) {
  console.log('searchPOSProducts called with query:', searchQuery);
  
  try {
    if (!searchQuery || searchQuery.trim() === '') {
      console.log('Empty search query, returning empty array');
      return [];
    }

    console.log('Building search query with filters');
    const searchConditions = {
      where: {
        AND: [
          {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { productCode: { contains: searchQuery, mode: 'insensitive' } }
            ]
          },
          { stockQty: { gt: 0 } },  // Only in-stock products
          { status: true }  // Only active products
        ]
      },
      select: {
        id: true,
        name: true,
        productCode: true,
        stockQty: true,
        productPrice: true,
        productThumbnail: true,
        productImages: true,
        productDetails: true,
        status: true,
        productTax: true,
        taxMethod: true
      },
      orderBy: {
        name: 'asc'
      },
      take: 20  // Limit results for better performance
    };

    console.log('Executing Prisma query with conditions:', JSON.stringify(searchConditions, null, 2));
    const products = await prisma.product.findMany(searchConditions);
    
    console.log(`Search complete. Found ${products.length} products`);
    console.log('First product in results:', products[0]);
    
    return products;
  } catch (error) {
    console.error("POS search error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return [];
  }
}




