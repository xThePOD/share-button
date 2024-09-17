import { Frog, Button } from 'frog';  // Make sure Button is imported
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import axios from 'axios';

// Example: Replace with the actual frame image URL (could be generated or hosted)
const frameImageUrl = 'https://share-button-tau.vercel.app/api';

// Neynar API base URL (replace with actual API key and endpoint)
const apiKey = 'YOUR_NEYNAR_API_KEY'; // Replace this with your actual Neynar API key
const apiBaseUrl = 'https://api.farcaster.xyz/v2';

// Retry logic function for API calls
const retryApiCall = async (url: string, headers: object, retries = 3) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt >= retries) throw error;
    }
  }
};

// Function to get the current user's FID from the Farcaster API
const getCurrentUserFID = async () => {
  try {
    const url = `${apiBaseUrl}/me`;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    // Make the API request with retry logic
    const responseData = await retryApiCall(url, headers);
    return responseData.result.fid; // Return the FID of the user
  } catch (error: any) {
    console.error('Failed to fetch current user FID:', error.response?.data || error.message);
    return null;
  }
};

// Function to check if the user meets all conditions (followed, liked, recasted)
const checkUserStatus = async (fid: string) => {
  try {
    const url = `${apiBaseUrl}/user/${fid}`;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    // Make the API request with retry logic
    const responseData = await retryApiCall(url, headers);
    const hasFollowed = responseData.user.following;
    const hasLiked = responseData.user.likes;
    const hasRecasted = responseData.user.recasts;

    return hasFollowed && hasLiked && hasRecasted;
  } catch (error: any) {
    console.error('API call failed:', error.response?.data || error.message);
    return false;
  }
};

// Initialize Frog App
const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Two Frame App',
});

// Frame 1: Display "Enter" button and auto-detect user FID
app.frame('/', async (c: any) => {
  const { buttonValue } = c;

  // Detect the current user FID
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

  if (buttonValue === 'enter') {
    // Check user status when they click the "Enter" button
    const isEligible = await checkUserStatus(userFID);

    if (isEligible) {
      // Define composerUrl inside this block
      const resultMessage = "Welcome to the pod!";
      const composedMessage = encodeURIComponent(
        `Join the pod! ${resultMessage} 🌐`
      );

      // Share URL with embedded frame URL
      const composerUrl = `https://warpcast.com/~/compose?text=${composedMessage}&embeds[]=${frameImageUrl}`;

      // Render Frame 2 content
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
        intents: [
          <Button.Link href={composerUrl}>Share on Farcaster</Button.Link>, // Share button with composer URL
          <Button value="reset">Reset</Button>, // Reset button to go back to Frame 1
        ],
      });
    } else {
      // Show error message if user does not meet conditions
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
              Please follow, like, and recast before proceeding.
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
        <div style={{ color: 'white', fontSize: 60 }}>Enter</div>
      </div>
    ),
    intents: [<Button value="enter">Enter</Button>],
  });
});

// Reset Frame (logic to reset the flow)
app.frame('/reset', (c: any) => {
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
        <div style={{ color: 'white', fontSize: 60 }}>Enter</div>
      </div>
    ),
    intents: [<Button value="enter">Enter</Button>],
  });
});

// Enable development tools and static asset serving
const isProduction = process.env.NODE_ENV === 'production';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
