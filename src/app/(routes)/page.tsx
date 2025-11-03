import getBanners from "@/actions/get-banners";
import getProducts from "@/actions/get-products";
import MainCarousel from "@/components/main-carousel";
import ProductListWithSort from "@/components/product-list-with-sort";
import Container from "@/components/ui/container";

export const revalidate = 0;

interface HomeProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const HomePage = async (props: HomeProps) => {
  const { searchParams } = props;
  const searchParamsResolved = searchParams ? await searchParams : undefined;

  const qRaw = Array.isArray(searchParamsResolved?.q)
    ? searchParamsResolved?.q[0]
    : searchParamsResolved?.q;
  const q = String(qRaw ?? "").trim();

  let products = [];
  if (q) {
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
  {
  }

  const storeId = "cb4cc43a-7c67-4c59-a893-39ff007e72e4";
  const banners = await getBanners(storeId);

  return (
    <Container>
      <div className="space-y-10 pb-10">
        <div className="px-4 md:px-8">
          <MainCarousel images={banners} />
        </div>
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <ProductListWithSort
            title={q ? `Hasil untuk "${q}"` : "Semua Menu:"}
            items={products}
          />
        </div>
      </div>
    </Container>
  );
};

export default HomePage;
