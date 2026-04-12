// Força o TypeScript a entender que este arquivo é um Service Worker
export default null;
declare var self: any;

// Ouve o sinal de Push vindo do servidor
self.addEventListener("push", (event: any) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      badge: "/icon-light-32x32.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "1",
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Abre o app ao clicar na notificação
self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});
