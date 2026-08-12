self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            data: data.data,
            actions: [
                { action: 'answer', title: 'Accept Call' },
                { action: 'decline', title: 'Decline' }
            ],
            requireInteraction: true
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const action = event.action;
    const callData = event.notification.data;

    // Build the URL to open (usually the root of the app)
    const urlToOpen = new URL('/', self.location.origin).href;

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;
        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url === urlToOpen) {
                matchingClient = windowClient;
                break;
            }
        }

        if (matchingClient) {
            // App is already open. Bring to focus and send message.
            matchingClient.focus();
            matchingClient.postMessage({
                type: 'incoming-call-action',
                action: action,
                data: callData
            });
        } else {
            // App is closed. Open it.
            // We append query params so the app knows a call is pending on startup.
            let launchUrl = urlToOpen + '?incomingCall=1&action=' + action + '&tagId=' + callData.tagId + '&callerId=' + callData.callerId;
            return clients.openWindow(launchUrl);
        }
    });

    event.waitUntil(promiseChain);
});
