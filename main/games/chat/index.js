window.apps.push({
    id: 'chat',
    name: 'Pocket Chat',
    thumbnail: './games/chat/assets/chat.png',
    html: `
        <div class="gb-app">
            <div class="gb-title">Pocket Chat</div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60%; color: #666; font-family: 'Jua', sans-serif;">
                <p>Coming Soon...</p>
            </div>
        </div>
    `,
    init: function() {
        console.log('Pocket Chat initialized');
    },
    cleanup: function() {
        console.log('Pocket Chat cleaned up');
    }
});
