// Ejemplos de código para el frontend (Shopify Liquid)

/*
Ejemplo de cómo consumir la API desde Shopify Liquid usando fetch:

{% javascript %}
  // Obtener favoritos del usuario
  async function getFavoritos() {
    const customerId = {{ customer.id | json }};
    
    if (!customerId) return [];
    
    try {
      const response = await fetch(`https://tu-api.vercel.app/api/favoritos/${customerId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Error:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return [];
    }
  }

  // Agregar producto a favoritos
  async function addToFavorites(productId, productTitle) {
    const customerId = {{ customer.id | json }};
    
    if (!customerId) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }
    
    try {
      const response = await fetch('https://tu-api.vercel.app/api/favoritos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shopify_customer_id: customerId,
          id_producto: productId,
          nombre_producto: productTitle
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Producto agregado a favoritos');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      alert('Error al agregar favorito');
    }
  }
{% endjavascript %}

// Botón para agregar a favoritos en la página de producto
<button 
  onclick="addToFavorites('{{ product.id }}', '{{ product.title | escape }}')"
  class="btn-favorite"
>product.id}}', '{{product.title | escape}}')"
  class="btn-favorite"
>
  Agregar a favoritos
</button>
*/
