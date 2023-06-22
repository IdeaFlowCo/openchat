import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios'

// Define a function called textToSpeech that takes in a string called inputText as its argument.
const textToSpeech = async (inputText) => {
    // Set the API key for ElevenLabs API. 
    // Do not use directly. Use environment variables.
    const API_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY;
    // Set the ID of the voice to be used.
    const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
  
    // Set options for the API request.
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
        'content-type': 'application/json', // Set the content type to application/json.
        'xi-api-key': `${API_KEY}`, // Set the API key in the headers.
      },
      data: {
        text: inputText, // Pass in the inputText as the text to be converted to speech.
      },
      responseType: 'arraybuffer', // Set the responseType to arraybuffer to receive binary data as response.
    };
  
    // Send the API request using Axios and wait for the response.
    const speechDetails = await axios.request(options);
  
    // Return the binary audio data received from the API response.
    console.log("speechDetails.data", speechDetails.data);
    return speechDetails.data;
  };

export default function TestChat() {
    // Define a state variable to hold the audio URL
  const [audioURL, setAudioURL] = useState(null);

  // Define a function to fetch the audio data and set the URL state variable
  const handleAudioFetch = async () => {
    // Call the textToSpeech function to generate the audio data for the text "Hello welcome"
    const data = await textToSpeech("Hello, welcome!")
    console.log("data", data)
    // Create a new Blob object from the audio data with MIME type 'audio/mpeg'
    const blob = new Blob([data], { type: 'audio/mpeg' });
    console.log("blob", blob)
    // Create a URL for the blob object
    const url = URL.createObjectURL(blob);
    console.log("url", url)
    
    // Set the audio URL state variable to the newly created URL
    setAudioURL(url);
  };

  // Use the useEffect hook to call the handleAudioFetch function once when the component mounts
  useEffect(() => {
    handleAudioFetch()
  }, []);

  return (
    <div>
      {audioURL && (
        <audio autoPlay controls>
          <source src={audioURL} type="audio/mpeg" />
        </audio>
      )}
    </div>
  )
}
