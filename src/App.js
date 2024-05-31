import { useState, useEffect } from "react";
import MenuButton from './components/MenuButton.js';
import BorrowForm from './components/BorrowForm.js';

import Web3 from "web3";

import './App.css';

function App() {
  // const { address: connectedAddress } = useAccount();
  const [currPage, setCurrPage] = useState(1);
  const [web3, setWeb3] = useState(null);
  const [owner, setOwner] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initialize = async () => {
      try {
        setErrorMessage("");
        if (window.ethereum) {
          // Get network provider and web3 instance.
          const web3Instance = new Web3(window.ethereum);

          await window.ethereum.enable();

          // Use web3 to get the user's accounts.
          const userAccounts = await web3Instance.eth.getAccounts();

          setWeb3(web3Instance);
          setOwner(userAccounts[0].toLowerCase());
        } else {
          setErrorMessage("Metamask extension not found in Your browser, be sure to have it in order to use this app.");
        }
      } catch (error) {
        // Catch any errors for any of the above operations.
        setErrorMessage("There was a problem connecting with Your Metamask wallet, make sure everything is correctly set up.");
      }
    };
    initialize();
  }, []);

  var page_content = <></>;
  if (currPage === 1) {
    page_content = <BorrowForm web3={web3}
                               setErrorMessage={setErrorMessage}
                               current_address={owner}/>;
  }

  return (
    <div className="App">
      <div className="container pt-24 md:pt-34 mx-auto w-full
                      flex flex-wrap flex-col md:flex-row items-center">
        <MenuButton title="Borrow" 
                    setCurrPage={setCurrPage}
                    pageNumber={1}
                    currNumber={currPage}/>
        <MenuButton title="Lend / Witdraw" 
                    setCurrPage={setCurrPage}
                    pageNumber={2}
                    currNumber={currPage}/>
        <MenuButton title="Pay Out" 
                    setCurrPage={setCurrPage}
                    pageNumber={3}
                    currNumber={currPage}/>
      </div>
      <div className="container justify-center pt-10 md:pt-5 mx-auto w-full
                      flex flex-wrap flex-col md:flex-row items-center">
                        <p className="text-red-500 w-full text-xs italic text-center">{errorMessage}</p>
                      </div>
      <div className="container pt-10 md:pt-5 mx-auto w-full
                      flex flex-wrap flex-col md:flex-row items-center">
        {page_content}
      </div>
    </div>
  );
}

export default App;
