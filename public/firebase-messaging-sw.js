importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC6P_gy_ZKyU-GuvisD5wweAVeUhGhrOcg",
  authDomain: "vitascann.firebaseapp.com",
  projectId: "vitascann",
  storageBucket: "vitascann.firebasestorage.app",
  messagingSenderId: "863137345831",
  appId: "1:863137345831:web:caacf5989a7e9c7d947902"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  var title = payload.notification && payload.notification.title ? payload.notification.title : 'VitaScann';
  var body = payload.notification && payload.notification.body ? payload.notification.body : 'Un message de VitaScann';
  self.registration.showNotification(title, {
    body: body,
    icon: '/logo192.png',
    badge: '/logo192.png'
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if ('focus' in clientList[i]) return clientList[i].focus();
      }
      if (clients.openWindow) return clients.openWindow('https://vitascann.vercel.app');
    })
  );
});
