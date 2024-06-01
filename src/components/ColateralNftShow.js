import { useState, useEffect } from "react";
import NFTVault from "../contracts/NFTVault.json";
import AbiErc721 from "../contracts/ABI-ERC721.json";
import IpfsImageComponent from "./IpfsImageComponent";
import Evc from "../contracts/Evc.json";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const PayOut = ({web3, setErrorMessage, current_address, nftvalut_address, updateColaterals}) => {
    const [NftAddress, setNftAddress] = useState("");
    const [TokenId, setTokenId] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const notify = (message) => toast(message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        className: 'bg-gray-800 text-white',
    });

    function shortenAddress(address, length = 6) {
        if (address.length <= length) {
            return address;
        }
        return address.substring(0, length) + '...';
    }    

    const loadNft = async (e) => {
        try{
            const instance_nft_valut = new web3.eth.Contract(
                NFTVault.abi,
                nftvalut_address
            );

            // Get the NFT address and id
            console.log("Getting NFT address and id");
            const data = await instance_nft_valut.methods.getUnderlyingERC721().call();
            const nft_address = data[0];
            const nft_id = data[1];
            console.log("NFT data: " + nft_address);
            console.log("NFT data: " + nft_id);

            // Load url from NFT
            const instance = new web3.eth.Contract(
                AbiErc721,
                nft_address
            );
            var url = await instance.methods.tokenURI(nft_id).call();
            
            // Add placeholder image if nft does not have url set
            if (url === "") {
                url = "https://placehold.co/600x400";
            }

            // TODO: remove logs
            console.log("URI: " + url);

            setNftAddress(nft_address);
            setTokenId(nft_id.toString());
            setImageUrl(url);
            setErrorMessage("");
        } catch (error) {
            setErrorMessage("Error while fetching NFT data");
        }
    }

    const handleCollect = async (e) => {
        e.preventDefault();
        try{
            // Make a loan
            const instance_evc = new web3.eth.Contract(
                Evc.abi,
                Evc.address
            );
            const instance_nft_valut = new web3.eth.Contract(
                NFTVault.abi,
                nftvalut_address
            );
            notify("Disable Colateral")
            await instance_evc.methods.disableCollateral(current_address, nftvalut_address).send({ from: current_address });
            console.log("Colateral disabled")
            notify("Collecting NFT")
            await instance_nft_valut.methods.withdraw(current_address).send({ from: current_address });
            notify("NFT collected!")
            updateColaterals();
        } catch (error) {
            setErrorMessage("Error while collecting NFT: " + error);
        }
    }

    useEffect(() => {
        loadNft();
    }, []);

    return (
        <div className="pr-2">
            <IpfsImageComponent input={imageUrl} />
            <h1 className="text-center text-white-300 font-bold">
                Address: {shortenAddress(NftAddress)}
            </h1>
            <h1 className="text-center text-white-300 font-bold">
                Id: {TokenId}
            </h1>
            <button id="file_button" className="bg-transparent border border-blue-500 
                                                text-blue-500 font-bold py-1 px-1 rounded 
                                                focus:outline-none focus:shadow-outline mt-4 
                                                transition-colors duration-300" type="submit"
                                                onClick={handleCollect}>
                Collect
            </button>
        </div>
    );
};

export default PayOut;
