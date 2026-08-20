self.addEventListener('push', function(event) {
    if (!event.data) return;
    
    try {
        const data = event.data.json();
        let options = {
            body: data.body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            data: data.data
        };

        if (data.type === 'CALL') {
            options.vibrate = [200, 100, 200, 100, 200, 100, 200];
            options.actions = [
                { action: 'answer', title: 'Accept Call' },
                { action: 'decline', title: 'Decline' }
            ];
            options.requireInteraction = true;
            options.tag = 'incoming-call';
        } else if (data.type === 'MESSAGE') {
            options.tag = `msg-${data.data?.conversationId}`;
        }

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch(e) {
        console.error("Error parsing push notification data", e);
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
