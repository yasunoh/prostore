import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllProducts, getAllCategories } from "@/lib/actions/product.actions";
import Link from "next/link";

const prices = [
  {
    name: '$1 to $50',
    value: '1-50'
  },
  {
    name: '$51 to $100',
    value: '51-100'
  },
  {
    name: '$101 to $200',
    value: '101-200'
  },
  {
    name: '$201 to $500',
    value: '201-500'
  },
  {
    name: '$501 to $1000',
    value: '501-1000'
  },
];

const ratings = [4, 3, 2, 1];

const sortOrders = ['newest', 'lowest', 'highest', 'rating'];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    price: string;
    rating: string;
  }>
}) {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
  } = await props.searchParams;

  const isQuerySet = q && q !== 'all' && q.trim() !== '';
  const isCategorySet = category && category !== 'all' && category.trim() !== '';
  const isPriceSet = price && price !== 'all' && price.trim() !== '';
  const isRatingSet = rating && rating !== 'all' && rating.trim() !== '';

  if(isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `
      Search ${isQuerySet ? q: ''} 
      ${isCategorySet ? `: Category ${category}` : ''}
      ${isPriceSet ? `: Price ${price}` : ''}
      ${isRatingSet ? `: Rating ${rating}` : ''}
      `
    }
  } else {
    return {
      title: 'Search',
    }
  }
}

const SearchPage = async(props: {
  searchParams: Promise<{
    q?:string;
    category?:string;
    price?:string;
    rating?:string;
    sort?:string;
    page?:string;
  }>
}) => {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
    sort = 'newest',
    page = '1',
  } = await props.searchParams;

  // Construct filter url
  const getFilterUrl = ({
    c,
    p,
    s,
    r,
    pg
  }: {
    c?: string;
    p?: string;
    s?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = {q,category, price, rating, sort, page};

    if(c) params.category = c;
    if(p) params.price = p;
    if(s) params.sort = s;
    if(r) params.rating = r;
    if(pg) params.page = pg;

    return `/search?${new URLSearchParams(params).toString()}`
  }

  const categories = await getAllCategories();

  // console.log(q, category, price, rating, sort, page);
  const products = await getAllProducts({
    query:q,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });

  return ( <div className="grid md:grid-cols-5 md:gap-5">
    <div className="filter-links">
      {/* Category links */}
      <div className="text-xl mb-2 mt-3">Department</div>
      <div>
        <ul className="space-y-1">
          <li>
            <Link className={`${(category === 'all' || category === '') && 'font-bold'}`}
            href={getFilterUrl({c:'all'})}>
              Any
            </Link>
          </li>
          {categories.map((x) => (
            <li key={x.category}>
              <Link className={`${category === x.category && 'font-bold'}`} 
              href={getFilterUrl({c:x.category})}
            >
              {x.category}
            </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Price links */}
      <div className="text-xl mb-2 mt-3">Price</div>
      <div>
        <ul className="space-y-1">
          <li>
            <Link className={`${price === 'all' && 'font-bold'}`}
            href={getFilterUrl({p:'all'})}>
              Any
            </Link>
          </li>
          {prices.map((p) => (
            <li key={p.value}>
              <Link className={`${price === p.value && 'font-bold'}`} 
              href={getFilterUrl({p:p.value})}
            >
              {p.name}
            </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Rating links */}
      <div className="text-xl mb-2 mt-3">Customer Ratings</div>
      <div>
        <ul className="space-y-1">
          <li>
            <Link className={`${rating === 'all' && 'font-bold'}`}
            href={getFilterUrl({r:'all'})}>
              Any
            </Link>
          </li>
          {ratings.map((r) => (
            <li key={r}>
              <Link className={`${rating === r.toString() && 'font-bold'}`} 
                href={getFilterUrl({r:`${r}`})}
              >
                {`${r} stars & up`}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
    
    <div className="md:col-span-4 space-y-4">
      <div className="flex-between flex-col md:flex-row my-4">
        <div className="flex items-center">
          {q !== 'all' && q !== '' && 'Query: ' + q}
          {category !== 'all' && category !== '' && ' Category: ' + category}
          {price !== 'all' && ' Price: ' + price}
          {rating !== 'all' && ' Rating: ' + rating + ' stars & up'}
          &nbsp;
          {
            (q !== 'all' && q !== '') || 
            (category !== 'all' && category !== '') || 
            rating !== 'all' ||
            price !== 'all' ? (
              <Button variant='link' asChild>
                <Link href='/search'>Clear</Link>
              </Button>
            ):null

          }
        </div>
        <div>
          Sort by{' '}
          { sortOrders.map((s) => (
            <Link key={s} className={`mx-2 ${sort === s && 'font-bold'}`}
             href={getFilterUrl({s})}>
              {s}
             </Link>
          )) }
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {products.data.length === 0 && <div>No products found</div>}
        {products.data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  </div> );
}
 
export default SearchPage;