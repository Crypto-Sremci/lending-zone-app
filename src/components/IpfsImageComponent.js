import React, { useState, useEffect } from 'react';

const baseURL = 'https://ipfs.io/ipfs/';

const fetchFromIpfs = async (hash) => {
  const res = await fetch(baseURL + hash, {
    method: 'GET',
  });

  if (!res.body) {
    return '';
  }

  const jsonText = await res.text();
  const json = JSON.parse(jsonText);

  const imageHash = json.image;

  return baseURL + imageHash.substring(7);
};

const fetchImageUrl = async (input) => {
  if (input.startsWith('http')) {
    return input;
  } else if (input.startsWith('ipfs://')) {
    const hash = input.substring(7); // Remove 'ipfs://'
    return fetchFromIpfs(hash);
  } else {
    console.log('Invalid input');
  }
};

const IpfsImageComponent = ({ input }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (input) {
          const url = await fetchImageUrl(input);
          setImageUrl(url);
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchImage();
  }, [input]);

  return (
    <div className="flex flex-col justify-left text-left lg:items-start">
      {errorMessage && <p>{errorMessage}</p>}
      {imageUrl ? (
        <img src={imageUrl} alt="NFT" className="mt-4 mx-auto rounded-lg" style={{ height: '15vw' }} />
      ) : (
        <p>Loading image...</p>
      )}
    </div>
  );
};

export default IpfsImageComponent;
