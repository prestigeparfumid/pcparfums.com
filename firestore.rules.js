rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función de seguridad global para validar administradores activos
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.active == true;
    }

    // Colección: settings (Configuración global de la tienda)
    // - Público: Solo lectura para consumir logos, redes, etc.
    // - Admin: Lectura y escritura.
    match /settings/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Colección: banners
    // - Público: Solo lectura de banners.
    // - Admin: Lectura y escritura total.
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Colección: products
    // - Público: Lectura general (las queries se filtran en el frontend por "activo").
    // - Admin: Lectura, creación, actualización, eliminación.
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Colección: orders
    // - Público: DENEGADO. La creación se hace mediante el Backend Serverless (Firebase Admin SDK).
    //            El rastreo y lectura de clientes también se hace mediante el Backend validando identidad.
    // - Admin: Lectura y escritura total.
    match /orders/{orderId} {
      allow read, write: if isAdmin();
    }

    // Colección: adminUsers
    // - Usuario logueado: Solo puede leer su propio documento para verificar su rol.
    // - Escritura: Bloqueada. La creación de admins se debe hacer manualmente en Firebase Console 
    //   o mediante un script seguro del servidor para evitar escalada de privilegios.
    match /adminUsers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; 
    }
  }
}