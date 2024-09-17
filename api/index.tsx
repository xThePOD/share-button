import { Frog, Button } from 'frog';  // Import Frog and Button
import { devtools } from 'frog/dev';  // Import devtools
import { serveStatic } from 'frog/serve-static';  // Import serveStatic
import { handle } from 'frog/vercel';  // Import handle for routing on Vercel
import axios from 'axios';

// Neynar API base URL and your API key
const apiKey = '63FC33FA-82AF-466A-B548-B3D906ED2314';  // Replace this with your actual Neynar API key
const apiBaseUrl = 'https://api.neynar.xyz/v2';  // Neynar API base URL

// Replace with the actual cast hash for the post you want to verify
const castHash = '0x83faf84b';  // Replace with the actual cast hash you are verifying

// Replace with your FID (Farcaster ID) so we know who the user should follow
const yourFID = '14871';  // Replace this with your actual FID (Farcaster ID)

// Initialize Frog App
const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Verification Frame App',
});

// Function to automatically get the current user's FID from the Neynar API
const getCurrentUserFID = async () => {
  try {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };
    
    // Call to fetch the logged-in user's FID
    const response = await axios.get(`${apiBaseUrl}/me`, { headers });
    
    return response.data.result.fid; // Return the FID of the logged-in user
  } catch (error: any) {
    console.error('Failed to fetch current user FID:', error.response?.data || error.message);
    return null;
  }
};

// Function to verify if the user has liked, recasted, and followed
const verifyUserStatus = async (fid: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    // API call to check if user has liked, recasted, and followed
    const response = await axios.get(`${apiBaseUrl}/user/${fid}`, { headers });
    const userData = response.data;

    const hasLiked = userData.user.likes.includes(castHash);  // Check if the user liked the cast
    const hasRecasted = userData.user.recasts.includes(castHash);  // Check if the user recasted the cast
    const hasFollowed = userData.user.following.includes(yourFID);  // Check if the user is following you

    return hasLiked && hasRecasted && hasFollowed;
  } catch (error: any) {
    console.error('Verification failed:', error.response?.data || error.message);
    return false;
  }
};

// Frame 1: Display "Press Enter" and a button
app.frame('/', async (c) => {
  const { buttonValue } = c;

  if (buttonValue === 'enter') {
    // Auto-detect the user's FID from the Neynar API
    const userFID = await getCurrentUserFID();
    
    if (!userFID) {
      return c.res({
        image: (
          <div style={{ color: 'red', fontSize: 30, textAlign: 'center' }}>
            Could not detect your Farcaster user account. Please make sure you're logged in.
          </div>
        ),
      });
    }

    // Verify if the user has liked, recasted, and followed
    const isVerified = await verifyUserStatus(userFID);

    if (isVerified) {
      // Move to Frame 2 (Welcome to the pod) if verification is successful
      return c.res({
        image: (
          <div
            style={{
              alignItems: 'center',
              background: 'linear-gradient(to right, #432889, #17101F)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <div style={{ color: 'white', fontSize: 60 }}>Welcome to the pod!</div>
          </div>
        ),
        intents: [<Button value="reset">Reset</Button>],  // Reset button
      });
    } else {
      // Show an error message if the user hasn't liked, recasted, or followed
      return c.res({
        image: (
          <div
            style={{
              alignItems: 'center',
              background: 'linear-gradient(to right, #432889, #17101F)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <div style={{ color: 'white', fontSize: 30 }}>
              Please like, recast, and follow before proceeding.
            </div>
          </div>
        ),
        intents: [<Button value="enter">Try Again</Button>],
      });
    }
  }

  // Initial display: Frame 1 with Enter button
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div style={{ color: 'white', fontSize: 60 }}>Press Enter</div>
      </div>
    ),
    intents: [<Button value="enter">Enter</Button>],  // One button that triggers verification
  });
});

// Enable development tools
const isProduction = process.env.NODE_ENV === 'production';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
