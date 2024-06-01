import { useState } from "react";
import AbiErc721 from "../contracts/ABI-ERC721.json";
import IpfsImageComponent from "./IpfsImageComponent";
import NftVault from "../contracts/NFTVault.json";
import NftOracle from "../contracts/NftOracle.json";
import Usdc from "../contracts/USDC.json";
import Evc from "../contracts/Evc.json";
import Erc721Vault from "../contracts/ERC721Vault.json";


const BorrowForm = ({web3, setErrorMessage, current_address}) => {
    const [imageUrl, setImageUrl] = useState("");
    const [nftPrice, setNftPrice] = useState("");
    const [nftAddress, setNftAddress] = useState("");
    const [tokenId, setTokenId] = useState("");

    const handleBorrow = async (e) => {
        e.preventDefault();
        
        try{
            // Deploying the NftVault contract
            let deploy_contract = new web3.eth.Contract(NftVault.abi);
            let payload = {
                data: NftVault.bytecode,
                arguments: [Evc.address, 
                            nftAddress,
                            tokenId]
            }
            let parameter = {
                from: current_address,
                maxFeePerGas: web3.utils.toWei('100', 'gwei'), // Example max fee per gas
                maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei') // Example max priority fee per gas
            }
            var instance = await deploy_contract.deploy(payload).send(parameter);
            console.log("New vault address: " + instance.options.address);
            
            // Deposit the NFT
            const instance_nft = new web3.eth.Contract(
                AbiErc721,
                nftAddress
            );
            const instance_vault_nft = new web3.eth.Contract(
                NftVault.abi,
                instance.options.address
            );
            let owner_address = await instance_vault_nft.methods.owner().call();
            console.log("Owner address: " + owner_address);
            console.log(instance_vault_nft)
            console.log("Approving NFT")
            await instance_nft.methods.approve(instance.options.address, tokenId).send( {from: current_address });
            console.log("Depositing NFT")
            await instance_vault_nft.methods.deposit().send({ from: current_address });
            console.log("NFT deposited")

            // Make a loan
            const instance_evc = new web3.eth.Contract(
                Evc.abi,
                Evc.address
            );
            const instance_lending_vault = new web3.eth.Contract(
                Erc721Vault.abi,
                Erc721Vault.address
            );
            console.log("Enable Controler")
            await instance_evc.methods.enableController(current_address, Erc721Vault.address).send({ from: current_address });
            console.log("Controler enabled")
            console.log("Enable Colateral")
            await instance_evc.methods.enableCollateral(current_address, instance.options.address).send({ from: current_address });
            console.log("Colateral enabled")
            console.log("Borrowing USDC")
            const amount = web3.utils.toWei(Number(nftPrice), "mwei");
            await instance_lending_vault.methods.borrow(amount, current_address).send({ from: current_address });
            console.log("USDC borrowed")
        }catch (error) {
            console.log(error)
            setErrorMessage("Error while borrowing NFT");
        }
    }

    const handleSubmission = async (e) => {
        e.preventDefault();
        var nft_address = e.target[0].value;
        var token_id = e.target[1].value;
        console.log(nft_address, token_id);
        if (web3.utils.isAddress(nft_address)) {
            try{
                const instance = new web3.eth.Contract(
                    AbiErc721,
                    nft_address
                );
                if (!instance) {
                    setErrorMessage("Contract not found!");
                    return;
                }
                var url = await instance.methods.tokenURI(token_id).call();
                const owner = await instance.methods.ownerOf(token_id).call();
                
                // Add placeholder image if nft does not have url set
                if (url === "") {
                    url = "https://placehold.co/600x400";
                }

                // TODO: remove logs
                console.log("URI: " + url);
                console.log("Owner: " + owner);

                // TODO: uncomment
                if (owner.toLowerCase() !== current_address) {
                    setErrorMessage("You are not the owner of this NFT");
                    return;
                }

                // Get the NFT price
                const oracle_instance = new web3.eth.Contract(
                    NftOracle.abi,
                    NftOracle.address
                );
                const currPrice = await oracle_instance.methods.getQuote(Usdc.address, nft_address, token_id).call();
                var reaulPrice = web3.utils.fromWei(currPrice, "mwei");

                // TODO: remove logs
                console.log("Evaluated price: " + reaulPrice);

                setNftPrice(reaulPrice.toString());
                setNftAddress(nft_address);
                setTokenId(token_id);
                setImageUrl(url);
                setErrorMessage("");
            } catch (error) {
                setErrorMessage("Error while fetching NFT data");
            }
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
                        Price: {nftPrice} USDC
                    </label>
                    <button id="file_button" className="bg-transparent border border-blue-500 
                                                    text-blue-500 font-bold py-1 px-1 rounded 
                                                    focus:outline-none focus:shadow-outline mt-4 
                                                    transition-colors duration-300" type="submit"
                                                    onClick={handleBorrow}>
                        Borrow
                    </button>
                </div>
            }
        </div>
    );
};

export default BorrowForm;
