'use client';

import { useEffect, useState } from 'react';
import { getAllMainCategories } from "@/actions/main-category";
import CategoryForm from "@/components/dashboard/Forms/CategoryForm";

interface CategoryOption {
  label: string;
  value: string;
}

export default function NewCategoryPage() {
  const [mainCategories, setMainCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    // Handle electron IPC
    if (window.electron) {
      window.electron.ipcRenderer.send('new-category-page-loaded');
    }

    // Fetch main categories
    const fetchCategories = async () => {
      const allMainCategories = await getAllMainCategories() || [];
      const formattedCategories: CategoryOption[] = allMainCategories.map((item) => ({
        label: item.title,
        value: item.id,
      }));
      setMainCategories(formattedCategories);
    };

    fetchCategories();
  }, []);

  return <CategoryForm mainCategories={mainCategories} />;
}