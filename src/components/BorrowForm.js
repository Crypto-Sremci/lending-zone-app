import { useState } from "react";
import AbiErc721 from "../contracts/ABI-ERC721.json";
import IpfsImageComponent from "./IpfsImageComponent";


const BorrowForm = ({web3, setErrorMessage, current_address}) => {
    const [imageUrl, setImageUrl] = useState("");

    const handleSubmission = async (e) => {
        e.preventDefault();
        var nft_address = e.target[0].value;
        var token_id = e.target[1].value;
        console.log(nft_address, token_id);
        if (web3.utils.isAddress(nft_address)) {
            const instance = new web3.eth.Contract(
                AbiErc721,
                nft_address
            );
            var url = await instance.methods.tokenURI(token_id).call();
            const owner = await instance.methods.ownerOf(token_id).call();
            
            // TODO: remove logs
            console.log("URI: " + url);
            console.log("Owner: " + owner);

            // TODO: uncomment
            // if (owner.toLowerCase() !== current_address) {
            //     setErrorMessage("You are not the owner of this NFT");
            //     return;
            // }

            setImageUrl(url);
            setErrorMessage("");
        }
        else {
            setErrorMessage("Invalid NFT address");
        }
    }

    return (
        <div className="flex flex-col w-full
                            justify-left lg:items-start overflow-y-hidden pr-2">
            {imageUrl === ""?
                <form className="opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 bg-gray-900"
                    onSubmit={handleSubmission}>
                    <label className="block text-white-300 py-2 font-bold">
                        Address
                    </label>
                    <input type="text" placeholder="NFT address" className="w-full bg-gray-700 text-white border border-gray-900 rounded-lg px-3 py-2 mb-4" required />
    
                    <label className="block text-white-300 py-2 font-bold">
                        ID
                    </label>
                    <input type="text" placeholder="NFT ID" className="w-full bg-gray-700 text-white border border-gray-900 rounded-lg px-3 py-2 mb-4" required />
    
                    <button id="file_button" className="bg-transparent border border-blue-500 
                                                    text-blue-500 font-bold py-1 px-1 rounded 
                                                    focus:outline-none focus:shadow-outline mt-4 
                                                    transition-colors duration-300" type="submit">
                        Evaluate
                    </button>
                </form>
            : 
                <div className="text-center opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 bg-gray-900">
                    <IpfsImageComponent input={imageUrl} />
                    <label className="block text-white-300 py-2 font-bold">
                        Price: 0.1 ETH
                    </label>
                </div>
            }
        </div>
    );
};

export default BorrowForm;
