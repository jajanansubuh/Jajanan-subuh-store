import getProduct from "@/actions/get-product";
import getProducts from "@/actions/get-products";
import Gallery from "@/components/gallery";
import Info from "@/components/info";
import ProductList from "@/components/product-list";
import ProductReviews from "@/components/product-reviews";
import Container from "@/components/ui/container";

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
  // Params bisa berupa Promise sesuai tipe yang dihasilkan Next; tunggu sebelum destrukturisasi
  const { productId } = await params;

  // Lanjutkan dengan kode Anda
  const product = await getProduct(productId);

  const suggestedProducts = await getProducts({
    categoryId: product?.category?.id,
  });

  // Tambahkan pengecekan untuk produk yang tidak ditemukan
  if (!product) {
    return null;
    // Atau bisa juga kembalikan komponen 'tidak ditemukan'
  }

  return (
    <div className="bg-white">
      <Container>
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            <Gallery images={product.images} />
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <Info data={product} />
              <ProductReviews productId={product.id} />
            </div>
          </div>
          <hr className="my-10" />
          <ProductList title="Produk Terkait" items={suggestedProducts} />
        </div>
      </Container>
    </div>
  );
};

export default ProductPage;
