import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([])

    // pagenation
    const { totalProducts } = useLoaderData();
    // console.log(totalProducts);
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const totalPages = Math.ceil(totalProducts / itemsPerPage)
    const [currentPage, setCurrentPage] = useState(0)
    const options = [5, 10, 15, 20]

    // let pageNumber = [];
    // for (i = 0; i < 10; i++) {
    //     pageNumber.push(i)
    // }

    const pageNumber = [...Array(totalPages).keys()]
    function handleSelectChange(event) {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(0)
    }

    /*
        *** pagenation stape:
    1. need to assume total product number.
    2. Decide the number of items want showing per page.
    3. calculate total number of pages u want. 
    4. 
        a. [...Array(10).keys()]
        a. let pageNumber = [];
            for(i=0; i<10; i++){
                pageNumber.push(i)
            }
        a & a both are same.
    5. Detarmine the Current Page 
    6. 
    */


    // useEffect(() => {
    //     fetch('http://localhost:5000/products')
    //         .then(res => res.json())
    //         .then(data => setProducts(data))
    // }, []);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch(`http://localhost:5000/products?page=${currentPage}&limit=${itemsPerPage}`)
            const data = await response.json()
            setProducts(data)
        }
        fetchData()
    }, [currentPage, itemsPerPage]);


    // load cart data for Showing 
    useEffect(() => {
        const storedCart = getShoppingCart();
        const ids = Object.keys(storedCart)

        fetch('http://localhost:5000/productsByIds', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(ids)
        })
            .then(res => res.json())
            .then(cartProduct => {
                const savedCart = [];
                // step 1: get id of the addedProduct
                for (const id in storedCart) {
                    // step 2: get product from products state by using id
                    const addedProduct = cartProduct.find(product => product._id === id)
                    if (addedProduct) {
                        // step 3: add quantity
                        const quantity = storedCart[id];
                        addedProduct.quantity = quantity;
                        // step 4: add the added product to the saved cart
                        savedCart.push(addedProduct);
                    }
                    // console.log('added Product', addedProduct)
                }
                // step 5: set the cart
                setCart(savedCart);
            })
    }, [])

    const handleAddToCart = (product) => {
        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }

    return (
        <>
            <div className='shop-container'>
                <div className="products-container">
                    {
                        products.map(product => <Product
                            key={product._id}
                            product={product}
                            handleAddToCart={handleAddToCart}
                        ></Product>)
                    }
                </div>
                <div className="cart-container">
                    <Cart
                        cart={cart}
                        handleClearCart={handleClearCart}
                    >
                        <Link className='proceed-link' to="/orders">
                            <button className='btn-proceed'>Review Order</button>
                        </Link>
                    </Cart>
                </div>
            </div>

            {/* Pagenation */}
            <div className="pagenation">
                <p>Current Page : {currentPage} </p>
                {
                    pageNumber.map(number => <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={currentPage === number ? 'selected' : ''}
                    >
                        {number}
                    </button>)
                }

                {/* select */}
                <select value={itemsPerPage} onChange={handleSelectChange}>
                    {
                        options.map(option => (
                            <option
                                key={option}
                                value={option}
                            >
                                {option}
                            </option>
                        ))
                    }
                </select>
            </div>
        </>
    );
};

export default Shop;