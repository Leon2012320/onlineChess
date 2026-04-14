// ============================================
// Online-Präsenz mit Firebase Realtime Database
// ============================================

(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyD-wENnM1oJL6xXf-tk6XEODqU3dfuVA7w",
        authDomain: "onlinechess-e2918.firebaseapp.com",
        databaseURL: "https://onlinechess-e2918-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "onlinechess-e2918",
        storageBucket: "onlinechess-e2918.firebasestorage.app",
        messagingSenderId: "522168409644",
        appId: "1:522168409644:web:43dd4240ebc8c9e005bb89",
    };

    // Firebase compat SDK (loaded from CDN in index.html)
    if (typeof firebase === 'undefined') return;

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // Anonyme Auth für Presence
    firebase.auth().signInAnonymously().catch(function (err) {
        console.warn('Firebase Auth fehlgeschlagen:', err.message);
    });

    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) return;

        const uid = user.uid;
        const userRef = db.ref('presence/' + uid);
        const connRef = db.ref('.info/connected');

        connRef.on('value', function (snap) {
            if (snap.val() === true) {
                // Verbunden: aufräumen wenn Tab geschlossen
                userRef.onDisconnect().remove();
                // Präsenz setzen
                userRef.set(true);
            }
        });

        // Online-Zähler lauschen
        db.ref('presence').on('value', function (snap) {
            const count = snap.numChildren();
            const el = document.getElementById('online-count');
            if (el) el.textContent = count;
        }, function (err) {
            console.warn('Presence read error:', err.message);
            // Fallback: mindestens sich selbst zählen
            var el = document.getElementById('online-count');
            if (el) el.textContent = '1';
        });
    });
})();
