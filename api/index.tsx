import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Simple Frame with Share Button',
});

app.frame('/', (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            marginTop: 30,
            padding: '0 120px',
          }}
        >
          HI!
        </div>
      </div>
    ),
    intents: [
      <Button.Link 
        href="https://warpcast.com/~/compose?text=Check%20out%20this%20cool%20frame%20on%20Farcaster!"
      >
        Share
      </Button.Link>,  // This button opens a pre-filled cast draft on Farcaster
    ],
  });
});

// Enable development tools and static asset serving
const isProduction = process.env.NODE_ENV === 'production';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
