import {
  mainNetwork,
  checkNetwork,
  requestConnection,
  checkConnection,
  getUserAddress,
  getMainBalance,
  getTokenBalance,
  signTransaction
} from "./constants.js";

var preciosGuardados = {}, logTokenBalance = 0;

// Carga del front
window.onload = async () => {
  const token1Selected = document.getElementById("token1"),
    token2Selected = document.getElementById("token2"),
    inputToken1 = document.getElementById("input1"),
    inputToken2 = document.getElementById("input2"),
    lblTokenBalance = document.getElementById("lblTokenBalance"),
    buttonMaxBalance = document.getElementById("maxBalance");

  const getTokenPrice = async (id) => {
    const apiTokens = require("./abi-codes/apiTokens.json"),
      enlace = apiTokens[id - 1];

    return await fetch(enlace, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
        const priceData = await res.json();
    
        preciosGuardados[id] = priceData["market_data"]["current_price"]["usd"];
        return preciosGuardados[id];
    });
  };

  const handleInput1 = async () => {
    const token1Select = Number(token1Selected.getAttribute("content")),
        token2Select = Number(token2Selected.getAttribute("content")),
        priceToken1 = (preciosGuardados[token1Select]) ? preciosGuardados[token1Select] : await getTokenPrice(token1Select),
        priceToken2 = (preciosGuardados[token2Select]) ? preciosGuardados[token2Select] : await getTokenPrice(token2Select);


    const resultadoEnUSD = inputToken1.value * priceToken1,
        resultadoEnTokens = resultadoEnUSD / priceToken2;
    
    inputToken2.value = resultadoEnTokens.toFixed(5);
  }


  inputToken1.addEventListener("input", handleInput1);

  buttonMaxBalance.addEventListener("click", () => {
    inputToken1.value = logTokenBalance;
    handleInput1();
  })

  inputToken2.addEventListener("input", async () => {
    const token1Select = Number(token1Selected.getAttribute("content")),
        token2Select = Number(token2Selected.getAttribute("content")),
        priceToken1 = (preciosGuardados[token1Select]) ? preciosGuardados[token1Select] : await getTokenPrice(token1Select),
        priceToken2 = (preciosGuardados[token2Select]) ? preciosGuardados[token2Select] : await getTokenPrice(token2Select);


    const resultadoEnUSD = inputToken2.value * priceToken2,
        resultadoEnTokens = resultadoEnUSD / priceToken1;
    
    inputToken1.value = resultadoEnTokens.toFixed(2);
  });

  const modalTokens = document.getElementsByName("modalTokens");
    modalTokens.forEach((token) => {
        token.addEventListener("click", async () => {
            const token1Select = Number(token1Selected.getAttribute("content")),
            token2Select = Number(token2Selected.getAttribute("content")),
            priceToken1 = (preciosGuardados[token1Select]) ? preciosGuardados[token1Select] : await getTokenPrice(token1Select),
            priceToken2 = (preciosGuardados[token2Select]) ? preciosGuardados[token2Select] : await getTokenPrice(token2Select);

            const resultadoEnUSD = inputToken1.value * priceToken1,
                resultadoEnTokens = resultadoEnUSD / priceToken2;
            
            inputToken2.value = resultadoEnTokens.toFixed(2);

            const resultadoEnUSD2 = inputToken2.value * priceToken2,
                resultadoEnTokens2 = resultadoEnUSD2 / priceToken1;
            
            inputToken1.value = resultadoEnTokens2.toFixed(2);

            logTokenBalance = await getTokenBalance(token1Select);
            lblTokenBalance.innerHTML = `Balance: ${logTokenBalance}`;
        })
    })

  checkConnection().then((dataConnect) => {
    const buttonConnect = document.getElementById("connectButton");
    const buttonSwap = document.getElementById("swapButton");
    const sectionLogged = document.getElementById("sectionLogged");

    const setDataLogged = async () => {
      buttonConnect.style.display = "none";
      sectionLogged.style.display = "flex";
      buttonSwap.innerHTML = "Swap";

      const userAddress = await getUserAddress(),
        userBalance = await getMainBalance(),
        lblAddress = document.getElementById("lblAddress"),
        lblBalance = document.getElementById("lblBalance");

      lblAddress.innerHTML = `${userAddress.substr(
        0,
        6
      )}...${userAddress.substr(userAddress.length - 4, userAddress.length)}`;
      lblBalance.innerHTML = `${userBalance} ETH`;

      buttonSwap.addEventListener("click", () => {
        // FUNCION DE INTERCAMBIO DE TOKENS
        const token1Select = Number(token1Selected.getAttribute("content")),
            token2Select = Number(token2Selected.getAttribute("content"));
        
        var indexSelected = token2Select - 1;
        if (indexSelected != 5) {
          signTransaction(indexSelected)
        } else {
          indexSelected = token1Select - 1;
          (indexSelected != 5) ? signTransaction(indexSelected) : signTransaction(0);
        }
      });

      const token1Select = Number(token1Selected.getAttribute("content"));
      logTokenBalance = await getTokenBalance(token1Select);
      lblTokenBalance.innerHTML = `Balance: ${logTokenBalance}`;
    };

    const connectMetamask = () => {
      requestConnection().then((data) => {
        if (data.connect) setDataLogged();
      });
    };

    if (!dataConnect.connect) {
      sectionLogged;
      buttonConnect.style.display = "flex";

      buttonConnect.onclick = connectMetamask;
      buttonSwap.onclick = connectMetamask;
    } else {
      setDataLogged();
    }
  });

  checkNetwork();

  if (window.ethereum) {
    window.ethereum.on("chainChanged", (net_id) => {
      if (net_id != mainNetwork) {
        setTimeout(() => {
          checkNetwork();
        }, 3000);
      }
    });
  }
};
