import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirestore, addDoc, collection } from 'firebase/firestore'

export interface TokenMetadata {
  chainId: string
  description: string
  devAllocation: string
  initialLiquidity: string
  launchDate: Date
  logoUrl: string
  lpAddress: string
  lpAllocation: string
  symbol: string
  tokenAddress: string
  website: string
  name: string
  totalSupply: string
  creatorAddress: string
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

console.log('🔥 Initializing Firebase...')
const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
export const db = getFirestore(app)
console.log('✅ Firebase initialized successfully')

export const saveTokenMetadata = async (tokenData: TokenMetadata) => {
  console.log('Starting saveTokenMetadata with data:', tokenData);
  try {
    const tokensRef = collection(db, 'tokens');
    console.log('Collection reference created');
    
    const docRef = await addDoc(tokensRef, {
      ...tokenData,
      createdAt: new Date()
    });
    console.log('Document written with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving token metadata:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export const uploadLogo = async (file: File, tokenSymbol: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `token-logos/${tokenSymbol.toLowerCase()}.png`)
    const snapshot = await uploadBytes(storageRef, file)
    const url = await getDownloadURL(snapshot.ref)
    return url
  } catch (error) {
    console.error('Error uploading logo:', error)
    throw error
  }
}
