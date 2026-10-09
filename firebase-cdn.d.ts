// Firebase wird per CDN-URL geladen (siehe services/firebase.ts); ohne diese Deklaration kennt TypeScript die Module nicht.
declare module 'https://www.gstatic.com/firebasejs/*';
