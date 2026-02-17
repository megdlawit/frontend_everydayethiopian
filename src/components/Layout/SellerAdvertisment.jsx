import React from 'react';
import Slider from 'react-slick';
import './SliderComponent.css'; 
import img1 from "../../Assests/images/1 (1).jpg"; 
import img2 from "../../Assests/images/1 (2).jpg"; 
import img3 from "../../Assests/images/1 (3).jpg"; 
import img4 from "../../Assests/images/1 (4).jpg"; 
import img5 from "../../Assests/images/1 (5).jpg"; 
import img6 from "../../Assests/images/1 (8).jpg";
import img7 from "../../Assests/images/1 (9).jpg";
import img8 from "../../Assests/images/1 (6).jpg";

// Custom arrow components for vertical sliding
const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="custom-arrow next" onClick={onClick}>
      &#8595; {/* Down arrow symbol */}
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="custom-arrow prev" onClick={onClick}>
      &#8593; {/* Up arrow symbol */}
    </div>
  );
};

// Categories with sellers and products for Ethiopian youth
const categories = [
  {
    name: 'Beauty & Cosmetics',
    description: 'Discover the best Ethiopian-made beauty products crafted for all skin types. From organic skincare to luxurious makeup, support local businesses and elevate your beauty routine.',
    sellers: [
      { name: 'Nuru Naturals', image: img1 },
      { name: 'Shega Beauty', image: img2 },
      { name: 'Meka Organics', image: img3 },
      { name: 'Addis Wear', image: img4 },
      { name: 'Habesha Trendz', image: img5 },
      { name: 'Ethio Couture', image: img6 },
      { name: 'Habesha Trendz', image: img7 },
      { name: 'Ethio Couture', image: img8 }
      
    ]
  },
  {
    name: 'Fashion & Apparel',
    description: 'Style yourself with modern and traditional Ethiopian fashion. From trendy urban wear to elegant traditional attire, find clothing that reflects your personality.',
    sellers: [
      { name: 'Addis Wear', image: img4 },
      { name: 'Habesha Trendz', image: img5 },
      { name: 'Ethio Couture', image: img6 },
      { name: 'Addis Wear', image: img7 },
      { name: 'Habesha Trendz', image: img1 },
      { name: 'Ethio Couture', image: img2 },
      { name: 'Habesha Trendz', image: img8 },
      { name: 'Ethio Couture', image: img3 }

    ]
  },
  {
    name: 'Handmade Crafts',
    description: 'Explore handmade Ethiopian crafts that tell stories of culture and tradition. Each piece is a work of art, perfect for your home or as a gift.',
    sellers: [
      { name: 'Artisan Creations', image: img3 },
      { name: 'Lalibela Handicrafts', image: img1 },
      { name: 'Tena Crafts', image: img2 },
      { name: 'Addis Wear', image: img4 },
      { name: 'Habesha Trendz', image: img5 },
      { name: 'Ethio Couture', image: img6 },
      { name: 'Habesha Trendz', image: img5 },
      { name: 'Ethio Couture', image: img6 }
    ]
  }
];

const SliderComponent = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />, 
  };

  return (
    <div className="slider-container">
      <div className='col'> 
      <h1 className="main-title">CREATE <span className='highlight'>SHOP</span>  FOR YOUR BUSINESS</h1>
   
      <Slider {...settings}>
        {categories.map((category, index) => (
          <div key={index} className="slider-item">
            <div className="slider-content">
              <div className="slider-text">
                <h2 className="category-title">{category.name}</h2>
                <p className="category-description text-justify">{category.description}</p>
              </div>
              <div className="seller-grid">
                {category.sellers.map((seller, sellerIndex) => (
                  <div key={sellerIndex} className="seller-card">
                    <div className="seller-image-container">
                      <img
                        src={process.env.PUBLIC_URL + seller.image}
                        alt={seller.name}
                        className="seller-image"
                      />
                      <div className="seller-name-overlay">
                        <h3 className="seller-name">{seller.name}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Slider>
      </div>
    </div>
  );
};

export default SliderComponent;
