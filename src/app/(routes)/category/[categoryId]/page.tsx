import getCategory from "@/actions/get-category";
import getProducts from "@/actions/get-products";
import Banner from "@/components/banner";
import Container from "@/components/ui/container";
// ...existing code...
import ProductListWithSort from "@/components/product-list-with-sort";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) => {
  const { categoryId } = await params;
  const products = await getProducts({
    categoryId: categoryId,
  });

  const category = await getCategory(categoryId);
  return (
    <div className="bg-white">
      <Container>
        <Banner data={category.banner} />
        <div className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="mt-6 lg:col-span-4 lg:mt-0">
            <ProductListWithSort title={category.name} items={products} />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CategoryPage;
