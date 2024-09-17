import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import axios from 'axios';

// Example: Replace with the actual frame image URL (could be generated or hosted)
const frameImageUrl = 'https://share-button-tau.vercel.app/api';

// Neynar API base URL (replace with actual API key and endpoint)
const neynarApiBase = 'https://api.farcaster.xyz/v2';
const apiKey = '0D6B6425-87D9-4548-95A2-36D107C12421'; // Replace this with your actual Neynar API key

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Two Frame App',
});

// Function to get the current user's FID from the Farcaster API
const getCurrentUserFID = async () => {
  try {
    // Farcaster provides the user session and FID, assuming you have API access or the user is logged in
    const response = await axios.get(`${neynarApiBase}/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.data.result.fid; // Return the FID of the user
  } catch (error) {
    console.error('Failed to fetch current user FID:', error);
    return null;
  }
};

// Function to check if the user meets all conditions (followed, liked, recasted)
const checkUserStatus = async (fid: string) => {
  try {
    const response = await axios.get(`${neynarApiBase}/user/${fid}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = response.data;

    const hasFollowed = data.user.following;
    const hasLiked = data.user.likes;
    const hasRecasted = data.user.recasts;

    return hasFollowed && hasLiked && hasRecasted;
  } catch (error) {
    console.error('API call failed:', error);
    return false;
  }
};

// Frame 1: Display "Enter" button and auto-detect user FID
app.frame('/', async (c) => {
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
app.frame('/reset', (c) => {
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
