import { Frog, Button } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import axios from 'axios';

const apiKey = '63FC33FA-82AF-466A-B548-B3D906ED2314';
const apiBaseUrl = 'https://api.neynar.xyz/v2';
const castHash = '0x83faf84b';
const yourFID = '14871';

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Verification Frame App',
});

const verifyUserStatus = async () => {
  try {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    const response = await axios.get(`${apiBaseUrl}/user/me`, { headers });
    const userData = response.data;

    const hasLiked = userData.user.likes.includes(castHash);
    const hasRecasted = userData.user.recasts.includes(castHash);
    const hasFollowed = userData.user.following.includes(yourFID);

    return hasLiked && hasRecasted && hasFollowed;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Verification failed:', error.message);
    } else {
      console.error('Verification failed:', error);
    }
    return false;
  }
};

app.frame('/', async (c) => {
  const { buttonValue } = c;

  if (buttonValue === 'enter') {
    const isVerified = await verifyUserStatus();

    if (isVerified) {
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
        intents: [<Button value="reset">Reset</Button>],
      });
    } else {
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
    intents: [<Button value="enter">Enter</Button>],
  });
});

const isProduction = process.env.NODE_ENV === 'production';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
