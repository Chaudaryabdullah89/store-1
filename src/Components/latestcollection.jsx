import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/shopcontext";
import Productitem from "./productitem";
import Title from "./Title";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestproducts, setlatestproducts] = useState([]); // Fix useState initialization

  useEffect(() => {
    setlatestproducts(products.slice(0, 10));
  }, [products]);

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"latest"} text2={"Collection"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iste
          inventore corporis similique aspernatur, dolore aliquid atque eveniet
        </p>
      </div>
      {/* rendring the product  */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {
        latestproducts.map((item, index) => (
          <Productitem key={index} id={item._id} name={item.name} price={item.price} image={item.image[0]} />
        ))    

    }

      </div>
    </div>
  );
};

export default LatestCollection;
