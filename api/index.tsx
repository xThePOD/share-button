import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import axios from 'axios'; // We'll use axios to interact with Neynar API
import { neynar } from 'frog/middlewares';

// Set up your Neynar API key
const apiKey = 'your-neynar-api-key';  // <-- REPLACE THIS with your actual Neynar API key

// Initialize the Neynar API for Farcaster integration
export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Frog Frame with Sharing',
}).use(
  neynar({
    apiKey: apiKey, // Pass the API key here for Neynar integration
    features: ['interactor', 'cast'], // Enable interactor and cast features
  })
);

// Function to publish the draft cast using the Neynar API
async function openDraftCast(message: string) {
  try {
    // Use the Neynar API directly with axios to create a draft cast
    const response = await axios.post(
      'https://hub-api.neynar.com/v1/cast',
      {
        text: message,  // Prewritten message for the cast
        interactor: true // Enable interactor if needed
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,  // Use the API key for authentication
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('Draft cast opened successfully:', response.data);
    return response.data;
  } catch (error) {
    // Handle any errors when opening the cast
    if (error instanceof Error) {
      console.error('Error opening draft cast:', error.message);
    } else {
      console.error('Unknown error occurred:', error);
    }
    return null;
  }
}

// Main frame logic for handling the button clicks and the cast submission
app.frame('/', async (c) => {
  const { buttonValue } = c;

  // Check if a fruit is selected and if the sharing option is active
  const fruitSelected = buttonValue && ['apples', 'oranges', 'bananas'].includes(buttonValue);
  const isSharing = buttonValue && buttonValue.startsWith('share_');

  let message = '';
  if (isSharing) {
    const selectedFruit = buttonValue.split('_')[1]; // Get the selected fruit from the buttonValue
    message = `I like ${selectedFruit.toUpperCase()}! Follow me, the creator!`; // Prewritten cast message
  }

  // If the user clicks the "Share" button, open the draft cast
  if (buttonValue === 'open_cast') {
    const result = await openDraftCast(message); // Open a draft cast using the Neynar API
    if (result) {
      return c.res({ image: 'Draft cast opened successfully! Ready to publish.' });
    } else {
      return c.res({ image: 'Error opening the draft cast.' });
    }
  }

  // If a fruit is selected, move to the next frame to display the choice and share option
  if (fruitSelected) {
    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: 'linear-gradient(to right, #432889, #17101F)',
            backgroundSize: '100% 100%',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
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
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              lineHeight: 1.4,
              marginTop: 30,
              padding: '0 120px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {`You selected ${buttonValue!.toUpperCase()}. Ready to share?`}
          </div>
        </div>
      ),
      intents: [
        <Button value="open_cast">Share on Farcaster</Button>, // Opens the draft cast
        <Button.Reset>Cancel</Button.Reset>, // Option to reset the frame
      ],
    });
  }

  // Default welcome screen if no fruit has been selected
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
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
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {'Welcome! Select your favorite fruit!'}
        </div>
      </div>
    ),
    intents: [
      <Button value="apples">Apples</Button>, // Button to select apples
      <Button value="oranges">Oranges</Button>, // Button to select oranges
      <Button value="bananas">Bananas</Button>, // Button to select bananas
      <Button.Reset>Cancel</Button.Reset>, // Button to reset the selection
    ],
  });
});

// Enable development tools and static asset serving
const isProduction = process.env.NODE_ENV === 'production';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
