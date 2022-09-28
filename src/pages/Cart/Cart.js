import "./Cart.styles.css"
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartProvider";
import { Link } from "react-router-dom"; 
import { collection, addDoc, getFirestore, updateDoc, doc } from "firebase/firestore";
import moment from "moment";


const Cart = () => {

     const { cart, removeItem, clear } = useContext(CartContext);
     const [exito, setExito] = useState(false);
    
  useEffect(() => {
    return () => {
      setExito(false);
    }
  }, [])
  
      const createOrder = () => {
        let formulario = [document.getElementById("name"), document.getElementById("phone"), document.getElementById("email")];
        if (formulario.some(element => element.value == "")){
          return alert("No debe haber campos vacíos en el formulario");
        }
        const order = {
          buyer:{
            name: formulario[0].value,
            phone: formulario[1].value,
            email: formulario[2].value,
          },
          items: cart.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
        })),
          total: cart.reduce((valorPasado, valorActual) => valorPasado + (valorActual.price*valorActual.quantity), 0),
          date: moment().format(),
        };
        const db = getFirestore();
        const query = collection(db, 'orders');

        addDoc(query, order)
        .then((response) => {
          console.log(response);
          return updateStock()})
        .then((response) => {
          clear();
          setExito(true);
          return alert("Felicidades por su compra")})
        .catch((error) => alert("Su compra no pudo realizarse"))
    };

    const updateStock = () => {
      cart.forEach(element => {
        const stock = {
          stock: element.stock - element.quantity 
        }
        const db = getFirestore();
        const queryUpdate = doc(db, 'items', element.id);
        updateDoc(queryUpdate, stock)
        .then((response) =>{console.log(response);})
        .catch((err) => {console.log(err);})
      });
    }

    return (
    <div className="cart__container">
    <h1>Carrito</h1>

    { exito && <h2>¡Felicidades por su compra!</h2> }

    { (cart.length > 0) ? 

    (cart.map((item)=>(
        <div key={item.id} className="cart__card">
            <img className="cart__card--img" src={item.image}></img>
            <div className="cart__card--content">
              <h2>{item.title}</h2>
              <p>Precio unit.: $ {item.price}.-</p>
            </div>  
            <div className="cart__card--total">
              <p>Cantidad: {item.quantity}</p>
              <h4>Subtotal: $ {item.quantity*item.price}.-</h4>
            </div>
            <div className="cart__card--eliminar">
              <button onClick={() => removeItem(item)} className="cart__card--finalizar--boton">Eliminar del carrito</button>
            </div>
        </div>      ))) :

        (<><p>El carrito está vacío...🪰</p><Link to="/" className="cart__card--finalizar--boton">Continuar comprando</Link></>)}
    
    { (cart.length > 0) && 
        <div className="cart__card--finalizar">
          <h4>Total: $ {cart.reduce((valorPasado, valorActual) => valorPasado + (valorActual.price*valorActual.quantity), 0).toFixed(2)}</h4>
          <button onClick={clear} className="cart__card--finalizar--boton">Vaciar carrito</button>
          <div className="cart__card--send">            
            <p>Nombre: <input type="text" id="name" ></input></p>
            <p>Teléfono: <input type="tel" id="phone" ></input></p>
            <p>E-mail: <input type="email" id="email" ></input></p>
            <br></br>
            <button onClick={createOrder} className="cart__card--finalizar--boton">Finalizar compra</button>
          </div>
        </div>}

    </div>
  )
}

export default Cart