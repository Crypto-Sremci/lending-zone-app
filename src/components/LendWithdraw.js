import { useState, useEffect } from "react";
import Erc721Vault from "../contracts/ERC721Vault.json";
import Usdc from "../contracts/USDC.json";


const LendWithdraw = ({web3, setErrorMessage, current_address}) => {
    const [valutBalance, setValutBalance] = useState(" ");

    const getFoundsFromVault = async () => {
        const instance = new web3.eth.Contract(
            Erc721Vault.abi,
            Erc721Vault.address
        );
        if (instance) {
            const shareBalance = await instance.methods.balanceOf(current_address).call();
            const balance = await instance.methods.convertToAssets(shareBalance).call();
            const balanceOriginal = web3.utils.fromWei(balance, 'mwei');

            // TODO: remove logs
            console.log("My balance: " + balanceOriginal);
            setValutBalance(balanceOriginal.toString());
        }
        else {
            setErrorMessage("Contract not found!");
        }
    }

    const handleLend = async (e) => {
        e.preventDefault();

        var amount = e.target[0].value;
        var withdraw = e.target[1].checked;
        // TODO: remove logs
        console.log("Lend / Withdraw Amount: " + amount);
        console.log("Do withdraw: " + withdraw);

        if (amount <= 0) {
            setErrorMessage("Amount must be greater than 0");
            return;
        }

        // Construct the contract instance
        const instance = new web3.eth.Contract(
            Erc721Vault.abi,
            Erc721Vault.address
        );
        const instance_usdc = new web3.eth.Contract(
            Usdc.abi,
            Usdc.address
        );

        if (instance) {
            if (!withdraw) {
                try {
                    const allowance = await instance_usdc.methods.allowance(current_address, Erc721Vault.address).call();
                    const amountInWei = web3.utils.toWei(amount, "mwei");
                    console.log("Allowance: " + allowance);
                    if (allowance < amountInWei) {
                        console.log("Approving USDC")
                        // Approve the contract to spend the USDC
                        await instance_usdc.methods.approve(Erc721Vault.address, amountInWei).send( {from: current_address });
                        console.log("Approved USDC")
                    }
                    
                    console.log("Depositing USDC")
                    await instance.methods.deposit(amountInWei, current_address).send({ from: current_address });
                    console.log("Deposited USDC")
                    await getFoundsFromVault();
                    setErrorMessage("");
                } catch (error) {
                    setErrorMessage("Failed to lend");
                }
            } else {
                try {
                    if (valutBalance < amount) {
                        setErrorMessage("Not enough funds in the vault");
                        return;
                    }
                    const amountInWei = web3.utils.toWei(amount, "mwei");

                    console.log("Withdrawing USDC")
                    await instance.methods.withdraw(amountInWei, current_address, current_address).send({
                        from: current_address
                    });
                    console.log("Withdrawn USDC")
                    await getFoundsFromVault();
                    setErrorMessage("");
                } catch (error) {
                    setErrorMessage("Failed to withdraw");
                }
            }
        }
    }

    useEffect(() => {
        getFoundsFromVault()
    }, []);

    return (
        <div className="flex flex-col w-full
                            justify-left lg:items-start overflow-y-hidden pr-2">
            <div className="text-center opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 bg-gray-900">
                <label className="block text-white-300 py-2 font-bold">
                    USDC Vault Status
                </label>
                <label className="block text-white-300 py-2">
                    My In Vault balance: {valutBalance}USDC
                </label>

                <label className="block text-white-300 py-2 mt-4 font-bold">
                    Actions
                </label>
                <form onSubmit={handleLend}>
                    <input type="decimal" placeholder="Lend / Withdraw Amount" className="w-1/5 bg-gray-700 text-white border border-gray-900 rounded-lg px-3 py-2 mb-4" required />
                    <br/>

                    <label
                        htmlFor="toggleId"
                        className="inline-block pr-1 hover:cursor-pointer"
                    >Lend</label>
                    <input
                        className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                        type="checkbox"
                        role="switch"
                        id="toggleId" />
                    <label
                        htmlFor="toggleId"
                        className="inline-block pl-1 hover:cursor-pointer"
                    >Withdraw</label>
                    <br/>

                    <button id="file_button" className="bg-transparent border border-blue-500 
                                                    text-blue-500 font-bold py-1 px-1 rounded 
                                                    focus:outline-none focus:shadow-outline mt-4 
                                                    transition-colors duration-300" type="submit">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LendWithdraw;
