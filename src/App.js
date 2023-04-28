import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import { ethers } from "ethers";
import NFTMarketplace from "./abis/NFTMarketplace.json";

function App() {
  const [state, setState] = useState({});

  useEffect(() => {
    connectWallet();
  }, []);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts");
        const wallet = provider.getSigner();
        const userAddress = await wallet.getAddress();
        window.provider = provider;
        window.wallet = wallet;

        // const x = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545");
        // console.log({ x });

        const ethAddress = NFTMarketplace.networks[5777].address;
        console.log({ userAddress, ethAddress });

        const nftMarketplace = new ethers.Contract(
          ethAddress,
          NFTMarketplace.abi,
          provider
        );
        const nftMarketplaceWithSigner = nftMarketplace.connect(wallet);

        window.contract = nftMarketplace;
        window.contractWithSigner = nftMarketplaceWithSigner;

        setState({
          userAddress,
          provider,
          wallet,
          nftMarketplace,
          nftMarketplaceWithSigner,
        });
      } catch (e) {}
    } else {
      alert("Please install MetaMask wallet to continue.");
    }
  }

  function handleClick() {
    console.log(state);
  }

  const fetchContract = (signerOrProvider) => {
    const ethAddress = NFTMarketplace.networks[5777].address;

    const nftMarketplace = new ethers.Contract(
      ethAddress,
      NFTMarketplace.abi,
      signerOrProvider
    );

    return nftMarketplace;
  };

  const connectingWithSmartContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = fetchContract(signer);
      return contract;
    } catch (error) {
      console.log("Something went wrong while connecting with contract", error);
    }
  };

  // test
  async function createNFT(
    name = "soham",
    price = 12,
    image = "google",
    description = "testnft"
  ) {
    if (!name || !description || !price || !image)
      return console.log("data is missing");

    const data = JSON.stringify({ name, description, image });
    console.log(data);

    try {
      // const added = await client.add(data);
      // const url = `${subdomain}/ipfs/${added.path}`;
      const url = "www.google.com";

      await createSale(url, price);
      // router.push("/searchPage");
    } catch (error) {
      console.log("error in create nft");
      // setError("Error while creating NFT");
      // setOpenError(true);
    }
  }

  //--- createSale FUNCTION
  const createSale = async (url, formInputPrice, isReselling, id) => {
    try {
      console.log(url, formInputPrice, isReselling, id);
      const price = ethers.utils.parseUnits(formInputPrice.toString(), "ether");

      const contract = await connectingWithSmartContract();

      const listingPrice = await contract.getListingPrice();

      const transaction = !isReselling
        ? await contract.createToken(url, price, {
            value: listingPrice.toString(),
          })
        : await contract.resellToken(id, price, {
            value: listingPrice.toString(),
          });

      const receipt = await transaction.wait();
      console.log(receipt);
    } catch (error) {
      // setError("error while creating sale");
      // setOpenError(true);
      console.log("error in create sale", error);
    }
  };

  const fetchNFTs = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        //--process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC
        // "https://polygon-mumbai.g.alchemy.com/v2/0awa485pp03Dww2fTjrSCg7yHlZECw-K"
        "http://127.0.0.1:7545"
      );

      const contract = fetchContract(provider);

      const data = await contract.fetchMarketItems();

      console.log(data);

      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);
            console.log({ tokenURI, tokenId, seller, owner, unformattedPrice });

            // const {
            //   data: { image, name, description },
            // } = await axios.get(tokenURI, {});
            // const price = ethers.utils.formatUnits(
            //   unformattedPrice.toString(),
            //   "ether"
            // );

            // return {
            //   price,
            //   tokenId: tokenId.toNumber(),
            //   seller,
            //   owner,
            //   image,
            //   name,
            //   description,
            //   tokenURI,
            // };
          }
        )
      );

      // console.log(items);
      return items;
    } catch (error) {
      // setError("Error while fetching NFTS");
      // setOpenError(true);
      console.log(error);
    }
  };

  const buyNFT = async (nft) => {
    try {
      const contract = await connectingWithSmartContract();
      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });

      const receipt = await transaction.wait();
      console.log(receipt);
      // router.push("/author");
    } catch (error) {
      console.log("error while buying");
      // setError("Error While buying NFT");
      // setOpenError(true);
    }
  };

  return (
    <div>
      <div>{console.log(state)}</div>
      <button
        onClick={() => {
          handleClick();
        }}
      >
        Test
      </button>
      <button
        onClick={() => {
          createNFT();
        }}
      >
        Create NFT
      </button>
      <button
        onClick={() => {
          fetchNFTs();
        }}
      >
        Fetch NFT
      </button>
      <button
        onClick={() => {
          buyNFT({ tokenId: 3, price: 20 });
        }}
      >
        Buy NFT
      </button>
      <button
        onClick={() => {
          createSale("www.facebook.com", 20, true, 3);
        }}
      >
        Resell
      </button>
    </div>
  );
}

export default App;
