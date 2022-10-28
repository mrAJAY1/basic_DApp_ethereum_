import { useEffect } from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ABI, ADDRESS } from "./Variables";
import { Watch } from "react-loader-spinner";

import Web3 from "web3";
import "./App.scss";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [value, setValue] = useState("");
  const [contract, setContract] = useState(null);
  const [stored, setStored] = useState("");
  const [trs, setTransaction] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const notify = (msg) => toast(msg);

  // connect to metamask
  let { ethereum } = window;
  if (ethereum) {
    window.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  }

  // init functions

  useEffect(() => {
    const getAccount = async () => {
      if (ethereum) {
        await ethereum.request({ method: "eth_requestAccounts" });
        await ethereum.request({ method: "eth_accounts" });
        const accounts = await ethereum.request({ method: "eth_accounts" });
        setAccount(accounts[0]);
      }
    };
    const getContract = async () => {
      if (ethereum) {
        const contr = await new window.web3.eth.Contract(ABI, ADDRESS);
        setContract(contr);
      }
    };
    getAccount();
    getContract();
  }, []);

  // Load / Reload balance

  useEffect(() => {
    const getBalance = async () => {
      if (ethereum && account) {
        const result = await window.web3.eth.getBalance(account);
        const dataBalace = window.web3.utils.fromWei(result, "ether");
        setBalance(`${dataBalace}<b> MATIC</b> `);
      }
    };
    getBalance();
  }, [account, trs]);

  // update on accountChange
  if (window.ethereum)
    window.ethereum.on("accountsChanged", function (accounts) {
      setAccount(accounts[0]);
    });

  // Handle submit

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (contract) {
      try {
        setLoading(true);
        const transaction = await contract.methods["store(uint256)"](
          parseInt(value)
        ).send({
          from: account,
        });
        notify("transaction successfull");
        setTransaction(transaction);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        notify("transaction failed");
        console.log(err);
      }
    } else {
      alert("some error occured");
    }
  };

  // Retrieve data
  const retrieve = async () => {
    if (contract) {
      try {
        const result = await contract.methods.retrieve().call();
        setStored(result);
      } catch (err) {
        console.log(err);
      }
    } else {
      alert("some error occured");
    }
  };

  return (
    <div className="App">
      <ToastContainer />
      <div className="accountContianer">
        <div className="account">
          <h1>Account:</h1>
          <p>{account || "Not available"}</p>
        </div>
        <div className="balance">
          <h1>Balance: </h1>
          <p dangerouslySetInnerHTML={{ __html: balance || "Not Available" }} />
        </div>
      </div>

      <div className="contract">
        <div className="contractData">
          <div style={{ width: "70%" }}>
            <input
              disabled
              value={stored}
              placeholder="click Retrieve to find number"
              className="value"
            ></input>
          </div>
          <button className="retrieve Btn" onClick={retrieve}>
            Retreive
          </button>
        </div>
        <form className="contractForm" onSubmit={handleSubmit}>
          <div style={{ width: "70%", position: "relative" }}>
            <label htmlFor="">Enter Value</label>
            <input
              placeholder="Enter the number"
              value={value}
              type="number"
              required
              onChange={(e) => setValue(e.target.value)}
              className="value"
            ></input>
          </div>
          <button type="submit" disabled={isLoading} className="update Btn">
            {isLoading ? (
              <Watch
                height="30"
                width="30"
                radius="48"
                color="#fff"
                ariaLabel="watch-loading"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
              />
            ) : (
              "Upload"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
