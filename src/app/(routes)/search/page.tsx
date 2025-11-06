import getProducts from "@/actions/get-products";
import ProductListWithSort from "@/components/product-list-with-sort";
import Container from "@/components/ui/container";
import { Product } from "@/types";
export const dynamic = 'auto';
export const revalidate = 3600; // Revalidate every hour

type SearchParams = { [key: string]: string | string[] | undefined };

const SearchPage = async (props: unknown) => {
  const searchParams: SearchParams | undefined = (props as { searchParams?: SearchParams })?.searchParams;
  const qRaw = Array.isArray(searchParams?.q)
    ? searchParams.q[0]
    : searchParams?.q;
  const q = String(qRaw ?? "").trim();

  let products: Product[] = [];
  try {
    if (q) {
      products = await getProducts({ q });
    } else {
      products = await getProducts({ isFeatured: true });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Continue with empty products array
  }

  return (
    <Container>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <ProductListWithSort
            title={q ? `Hasil untuk \"${q}\"` : "Produk Unggulan"}
            items={products}
          />
        </div>
      </div>
    </Container>
  );
};

export default SearchPage;
