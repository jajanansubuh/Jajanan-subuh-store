import getProducts from "@/actions/get-products";
import ProductListWithSort from "@/components/product-list-with-sort";
import Container from "@/components/ui/container";

interface SearchPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SearchPage = async (props: SearchPageProps) => {
  const searchParams = props.searchParams
    ? await props.searchParams
    : undefined;
  const qRaw = Array.isArray(searchParams?.q)
    ? searchParams?.q[0]
    : searchParams?.q;
  const q = String(qRaw ?? "").trim();

  let products = [];
  if (q) {
    // reuse server action when possible
    // server-side fetch requires absolute URL in Node, but here we rely on getProducts to fetch featured.
    // For search, call the internal search API.
    const port = process.env.PORT || "3000";
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      `http://localhost:${port}`;
    const url = `${base.replace(/\/$/, "")}/api/search?q=${encodeURIComponent(
      q
    )}`;
    const res = await fetch(url, { cache: "no-store" });
    products = res.ok ? await res.json() : [];
  } else {
    products = await getProducts({ isFeatured: true });
  }

  return (
    <Container>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <ProductListWithSort
            title={q ? `Hasil untuk \"${q}\"` : "Produk"}
            items={products}
          />
        </div>
      </div>
    </Container>
  );
};

export default SearchPage;
