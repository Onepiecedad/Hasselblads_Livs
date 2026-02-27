import { auth } from "./firebase";

export interface WalletBalance {
    balance: string;
    currency: string;
}

/**
 * Fetches the wallet balance for the currently logged-in Firebase user from the secure Netlify proxy.
 * Ensure the user is authenticated before calling this function.
 */
export async function fetchWalletBalance(): Promise<WalletBalance | null> {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("fetchWalletBalance: No authenticated user found.");
            return null;
        }

        // 1. Get the Firebase ID token for the current user
        const idToken = await user.getIdToken();

        // 2. Call our secure Netlify serverless function, passing the token in the header
        const response = await fetch('/.netlify/functions/get-wallet-balance', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Failed to fetch wallet balance:", response.status, errorData);
            return null;
        }

        const data: WalletBalance = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        return null;
    }
}
