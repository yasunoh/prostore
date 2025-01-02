import ProductList from "@/components/shared/product/poduct-list";
import sampleData from "@/db/sample-data";
// const delay = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms))


const Homepage = async() => {
  console.log(sampleData)
  // await delay(2000)
  return <>
    <ProductList data={sampleData.products} title="Newest Arrivals" limit={4} />
  </>;
}
 
export default Homepage;