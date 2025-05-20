// lib/pocketbase.js
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL); // <-- your actual PocketBase URL

export default pb;
