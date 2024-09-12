import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import axios from 'axios';
import { neynar } from 'frog/middlewares';


// Initialize the Neynar API for Farcaster integration
export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Frog Frame with Sharing',
}).use(
  neynar({
    apiKey:'0D6B6425-87D9-4548-95A2-36D107C12421', // Use environment variable for API key
    features: ['interactor', 'cast'],
  })
);

// Function to publish the cast using the Neynar API
async function publishCast(message: string) {
  try {
    const response = await axios.post(
      'https://hub-api.neynar.com/v1/cast',
      {
        text: message,
        interactor: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEYNAR_API_KEY}`
        }
      }
    );
    console.log('Cast published successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error publishing cast:', error);
    return null;
  }
}

// Main frame logic
app.frame('/', async (c) => {
  const { buttonValue } = c;
  
  const fruitSelected = buttonValue && ['apples', 'oranges', 'bananas'].includes(buttonValue);
  const isSharing = buttonValue && buttonValue.startsWith('share_');

  let message = '';
  if (isSharing) {
    const selectedFruit = buttonValue.split('_')[1];
    message = `I like ${selectedFruit.toUpperCase()}! Follow me, the creator!`;
  }

  if (buttonValue === 'post_to_farcaster') {
    const result = await publishCast(message);
    if (result) {
      return c.res({
        image: (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(to right, #432889, #17101F)', color: 'white', fontSize: 32, textAlign: 'center' }}>
            <p>Cast posted successfully!</p>
          </div>
        )
      });
    } else {
      return c.res({
        image: (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(to right, #432889, #17101F)', color: 'white', fontSize: 32, textAlign: 'center' }}>
            <p>Error posting the cast.</p>
          </div>
        )
      });
    }
  }

  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          background: 'linear-gradient(to right, #432889, #17101F)',
          color: 'white',
          fontSize: 32,
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <p style={{ margin: 0, padding: '10px' }}>
          {isSharing
            ? `Ready to share: ${message}`
            : fruitSelected
            ? `Nice choice. ${buttonValue!.toUpperCase()}!!`
            : 'Welcome! Select your favorite fruit!'}
        </p>
      </div>
    ),
    intents: 
      isSharing
        ? [
            <Button value="post_to_farcaster">Post to Farcaster</Button>,
            <Button value="apples">Apples</Button>,
            <Button value="oranges">Oranges</Button>,
            <Button.Reset>Reset</Button.Reset>,
          ]
        : fruitSelected
        ? [
            <Button value={`share_${buttonValue}`}>Share on Farcaster</Button>,
            <Button value="apples">Apples</Button>,
            <Button value="oranges">Oranges</Button>,
            <Button value="bananas">Bananas</Button>,
          ]
        : [
            <Button value="apples">Apples</Button>,
            <Button value="oranges">Oranges</Button>,
            <Button value="bananas">Bananas</Button>,
            <Button.Reset>Cancel</Button.Reset>,
          ],
  });
});

// Enable development tools and serve static assets
const isProduction = process.env.NODE_ENV === 'production';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);