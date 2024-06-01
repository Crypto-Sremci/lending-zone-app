import { useState, useEffect } from "react";
import Erc721Vault from "../contracts/ERC721Vault.json";
import Usdc from "../contracts/USDC.json";
import Evc from "../contracts/Evc.json";
import CollateralNftShow from "./ColateralNftShow";


const PayOut = ({web3, setErrorMessage, current_address}) => {
    const [valutDepth, setValutDepth] = useState("1");
    const [collaterals, setCollaterals] = useState([]);

    const getFoundsFromVault = async () => {
        const instance = new web3.eth.Contract(
            Erc721Vault.abi,
            Erc721Vault.address
        );
        if (instance) {
            const currentDepth = await instance.methods.debtOf(current_address).call();
            const balanceDepth = web3.utils.fromWei(currentDepth, 'mwei');

            // TODO: remove logs
            console.log("My depth: " + balanceDepth);
            setValutDepth(balanceDepth.toString());
        }
        else {
            setErrorMessage("Contract not found!");
        }
    }

    const getCollaterals = async () => {
        try {
            const instance = new web3.eth.Contract(
                Evc.abi,
                Evc.address
            );
            const collaterals = await instance.methods.getCollaterals(current_address).call();
            console.log("Colaterals: " + collaterals);
            setCollaterals(collaterals);
        } catch (error) {
            setErrorMessage("Failed to get collaterals");
        }
    }

    const handlePayOut = async (e) => {
        e.preventDefault();

        var amount = e.target[0].value;
        
        try {
            // Construct the contract instance
            const instance = new web3.eth.Contract(
                Erc721Vault.abi,
                Erc721Vault.address
            );
            const instance_usdc = new web3.eth.Contract(
                Usdc.abi,
                Usdc.address
            );

            const allowance = await instance_usdc.methods.allowance(current_address, Erc721Vault.address).call();
            const amountInWei = web3.utils.toWei(amount, "mwei");
            console.log("Allowance: " + allowance);
            if (allowance < amountInWei) {
                console.log("Approving USDC")
                // Approve the contract to spend the USDC
                await instance_usdc.methods.approve(Erc721Vault.address, amountInWei).send( {from: current_address });
                console.log("Approved USDC")
            }
            
            console.log("Paying out USDC")
            await instance.methods.repay(amountInWei, current_address).send({ from: current_address });
            console.log("Payed USDC")
            await getFoundsFromVault();
            setErrorMessage("");
        } catch (error) {
            setErrorMessage("Failed to payout USDC");
        }
    }

    useEffect(() => {
        getFoundsFromVault()
        getCollaterals()
    }, []);

    return (
        <div className="flex flex-col w-full
                            justify-left lg:items-start overflow-y-hidden pr-2">
            {Number(valutDepth) !== 0?
                <div className="text-center opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 bg-gray-900">
                    <label className="block text-white-300 py-2 font-bold">
                        USDC Vault Status
                    </label>
                    <label className="block text-white-300 py-2">
                        My depth: {valutDepth}USDC
                    </label>

                    <label className="block text-white-300 py-2 mt-4 font-bold">
                        Actions
                    </label>
                    <form onSubmit={handlePayOut}>
                        <input type="decimal" placeholder="Pay Out Amount" className="w-1/5 bg-gray-700 text-white border border-gray-900 rounded-lg px-3 py-2 mb-4" required />
                        <br/>

                        <button id="file_button" className="bg-transparent border border-blue-500 
                                                        text-blue-500 font-bold py-1 px-1 rounded 
                                                        focus:outline-none focus:shadow-outline mt-4 
                                                        transition-colors duration-300" type="submit">
                            Submit
                        </button>
                    </form>
                </div>
            : 
                <div className="grid grid-cols-2 text-center opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 bg-gray-900">
                    {collaterals.map((collateral, index) => (
                        <CollateralNftShow key={index} web3={web3} setErrorMessage={setErrorMessage} current_address={current_address} nftvalut_address={collateral} />
                    ))}
                </div>
            }
        </div>
    );
};

export default PayOut;
