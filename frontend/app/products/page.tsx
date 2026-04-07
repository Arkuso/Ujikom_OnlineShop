import { redirect } from "next/navigation";

type ProductsPageProps = {
  searchParams?: {
    category?: string;
  };
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const category = searchParams?.category;
  if (category) {
    redirect(`/sale?category=${encodeURIComponent(category)}`);
  }

  redirect("/sale");
}