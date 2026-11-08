window.PocketDB = (function () {
  const DB_NAME = 'PocketDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'kv';

  let db = null;
  let ready = false;
  let initPromise = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const d = event.target.result;
        if (!d.objectStoreNames.contains(STORE_NAME)) {
          d.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => reject();
    });
  }

  function getAllFromDB() {
    return new Promise((resolve) => {
      if (!db) return resolve([]);
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  function putInDB(key, value) {
    if (!db) return;
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ key, value: String(value) });
    } catch (e) {}
  }

  function delFromDB(key) {
    if (!db) return;
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
    } catch (e) {}
  }

  async function init() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      try {
        db = await openDB();
        const rows = await getAllFromDB();
        rows.forEach(r => {
          try { localStorage.setItem(r.key, r.value); } catch (e) {}
        });
      } catch (e) {
        db = null;
      }
      ready = true;
    })();
    return initPromise;
  }

  function getItem(key) {
    return localStorage.getItem(key);
  }

  function setItem(key, value) {
    const str = String(value);
    try { localStorage.setItem(key, str); } catch (e) {}
    putInDB(key, str);
  }

  function removeItem(key) {
    try { localStorage.removeItem(key); } catch (e) {}
    delFromDB(key);
  }

  function getPref(key) {
    const v = getItem('pocketjs_' + key);
    return v !== null ? v : null;
  }

  function setPref(key, value) {
    setItem('pocketjs_' + key, value);
  }

  function getNotifications() {
    try { return JSON.parse(getItem('pocketjs_notifications')) || []; } catch (e) { return []; }
  }

  function addNotification(n) {
    const notifs = getNotifications();
    notifs.unshift({
      id: n.id || 'notif_' + Date.now(),
      title: n.title || '',
      body: n.body || '',
      appId: n.appId || null,
      thumbnail: n.thumbnail || null,
      timestamp: n.timestamp || Date.now(),
      read: n.read || false,
      buttons: n.buttons || null
    });
    setItem('pocketjs_notifications', JSON.stringify(notifs));
  }

  function removeNotification(id) {
    const notifs = getNotifications().filter(n => n.id !== id);
    setItem('pocketjs_notifications', JSON.stringify(notifs));
  }

  function clearNotifications() {
    setItem('pocketjs_notifications', JSON.stringify([]));
  }

  function getAchievements(appId) {
    const all = getAllAchievements();
    return all[appId] || [];
  }

  function getAllAchievements() {
    try { return JSON.parse(getItem('pocketjs_achievements')) || {}; } catch (e) { return {}; }
  }

  function addAchievement(appId, a) {
    const all = getAllAchievements();
    if (!all[appId]) all[appId] = [];
    if (all[appId].find(x => x.id === a.id || x.achievement_id === a.achievement_id)) return;
    all[appId].push({
      id: a.id || a.achievement_id,
      title: a.title || '',
      description: a.description || '',
      difficulty: a.difficulty || 'normal',
      icon: a.icon || '',
      image: a.image || null,
      trophy: a.trophy || 'bronze',
      unlockedAt: a.unlockedAt || Date.now()
    });
    setItem('pocketjs_achievements', JSON.stringify(all));
  }

  function clearAllAchievements() {
    setItem('pocketjs_achievements', JSON.stringify({}));
  }

  function getPlaytime(appId) {
    const all = getAllPlaytime();
    return all[appId] || 0;
  }

  function addPlaytime(appId, ms) {
    const all = getAllPlaytime();
    all[appId] = (all[appId] || 0) + ms;
    setItem('pocketjs_playtime', JSON.stringify(all));
  }

  function getAllPlaytime() {
    try { return JSON.parse(getItem('pocketjs_playtime')) || {}; } catch (e) { return {}; }
  }

  function getPinnedApps() {
    try { return JSON.parse(getItem('pocketjs_pinned_apps')) || []; } catch (e) { return []; }
  }

  function setPinnedApps(appIds) {
    setItem('pocketjs_pinned_apps', JSON.stringify(appIds));
  }

  return {
    init,
    get ready() { return ready; },
    getItem, setItem, removeItem,
    getPref, setPref,
    getNotifications, addNotification, removeNotification, clearNotifications,
    getAchievements, getAllAchievements, addAchievement, clearAllAchievements,
    getPlaytime, getAllPlaytime, addPlaytime,
    getPinnedApps, setPinnedApps
  };
})();
