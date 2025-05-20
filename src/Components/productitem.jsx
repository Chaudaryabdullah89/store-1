import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../Context/shopcontext';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const Productitem = ({ id, name, price, image }) => {
    const { currency, addtocart } = useContext(ShopContext);
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        // Log the received image prop
        console.log('Received image prop:', image);
        
        // Validate the image URL
        if (!image || typeof image !== 'string') {
            console.error('Invalid image prop:', image);
            setImageError(true);
            setIsLoading(false);
            return;
        }

        // Set the image URL
        setImageUrl(image);
        
        // Check if image exists
        const img = new Image();
        img.onload = () => {
            console.log('Image loaded successfully:', image);
            setIsLoading(false);
            setImageError(false);
        };
        img.onerror = () => {
            console.error('Failed to load image:', image);
            setImageError(true);
            setIsLoading(false);
            setImageUrl('/placeholder.png');
        };
        img.src = image;
    }, [image]);

    const handleImageError = (e) => {
        console.error('Image error handler triggered:', image);
        setImageError(true);
        e.target.onerror = null;
        e.target.src = '/placeholder.png';
    };

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Stop event bubbling
        addtocart(id, 'default');
        toast.success('Item added to cart');
    };

    return (
        <div className='text-gray cursor-pointer'>
            <Link to={`/product/${id}`} className='block'>
                <div className='overflow-hidden relative aspect-square bg-gray-100'>
                    {isLoading && (
                        <div className='w-full h-full flex items-center justify-center bg-gray-200'>
                            <span className='text-gray-500'>Loading...</span>
                        </div>
                    )}
                    {!isLoading && !imageError && imageUrl && (
                        <img 
                            src={imageUrl} 
                            alt={name} 
                            className='w-full h-full object-cover transition-transform duration-300 hover:scale-110'
                            onError={handleImageError}
                            loading="lazy"
                        />
                    )}
                    {!isLoading && (imageError || !imageUrl) && (
                        <div className='w-full h-full flex items-center justify-center bg-gray-200'>
                            <span className='text-gray-500'>Image not available</span>
                        </div>
                    )}
                </div>
                <p className='pt-3 pb-1 text-sm'>{name}</p>
                <p className='text-small font-medium'>{currency}{price}</p>
            </Link>
            <button
                onClick={handleAddToCart}
                className="w-full mt-2 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
                Add to Cart
            </button>
        </div>
    );
}

Productitem.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired
};

export default Productitem;