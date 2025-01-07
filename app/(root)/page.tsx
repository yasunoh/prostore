import ProductList from "@/components/shared/product/poduct-list";
// import sampleData from "@/db/sample-data";
import { getLatestProducts } from "@/lib/actions/product.actions";
// const delay = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms))


const Homepage = async() => {
  // console.log(sampleData)
  // await delay(2000)
  const latestProducts = await getLatestProducts()

  return <>
    <ProductList data={latestProducts} title="Newest Arrivals" />
  </>;
}
 
export default Homepage;