import ProductList from "@/components/shared/product/poduct-list";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";
// import sampleData from "@/db/sample-data";
import { getFeaturedProducts, getLatestProducts } from "@/lib/actions/product.actions";
// const delay = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms))


const Homepage = async() => {
  // console.log(sampleData)
  // await delay(2000)
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  

  return <>
    {featuredProducts.length > 0 && <ProductCarousel data={featuredProducts} />}
    <ProductList data={latestProducts} title="Newest Arrivals" />
    <ViewAllProductsButton />
  </>;
}
 
export default Homepage;