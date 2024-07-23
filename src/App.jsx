import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaBitcoin, FaSearch } from "react-icons/fa";

function Result({ data, usdRate }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Unique, aggregate and organize transactions
  const uniqueTransactions =
    data.txrefs?.reduce((acc, tx) => {
      if (!acc[tx.tx_hash]) {
        // If the transaction has not been added yet, create a new transaction
        acc[tx.tx_hash] = {
          ...tx,
          value: tx.value,
          type: tx.tx_input_n === -1 ? "Received" : "Sent",
        };
      } else {
        // Aynı tx_hash varsa, mevcut değere ekle
        acc[tx.tx_hash].value += tx.value;
      }
      return acc;
    }, {}) || {};

  // Convert transactions to an array and sort by date
  const sortedTransactions = Object.values(uniqueTransactions).sort(
    (a, b) => new Date(b.confirmed) - new Date(a.confirmed)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 rounded-lg overflow-hidden max-w-4xl"
    >
      <div className=" rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 flex justify-between">
          <h2 className="text-xl leading-6 font-medium text-white">Address</h2>
          <h2 className="text-xl leading-6 font-medium text-white">
            Balance (BTC)
          </h2>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {[
              {
                label: data.address,
                value: `${(data.balance / 1e8).toFixed(6)} BTC`,
              },
            ].map((item) => (
              <div className="bg-blue-100 px-4 py-5 grid grid-cols-2 gap-2 sm:gap-4 sm:px-6">
                <h2 className="text-md font-semibold text-black break-words">
                  {item.label}
                </h2>
                <dd className="text-md font-bold text-BLACK text-right">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-gray-200"></div>
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-600 to-indigo-900 flex justify-end">
            <h2 className="text-xl leading-6 font-medium text-white">
              Total Balance
            </h2>
            <h2 className="text-xl font-medium text-green-500 ml-4">
              {`${((data.balance / 1e8) * usdRate).toFixed(2)} USD`}
            </h2>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 mt-12  rounded-t-lg">
        <h2 className="text-xl leading-6 font-medium text-white">
          Address Information
        </h2>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {[
            {
              label: "Total Received",
              value: `${(data.total_received / 1e8).toFixed(8)} BTC - ${(
                (data.total_received / 1e8) *
                usdRate
              ).toFixed(2)} USD`,
            },
            {
              label: "Total Sent",
              value: `${(data.total_sent / 1e8).toFixed(8)} BTC - ${(
                (data.total_sent / 1e8) *
                usdRate
              ).toFixed(2)} USD`,
            },
            { label: "Number of Transactions", value: data.n_tx },
            {
              label: "Last Transaction",
              value: data.txrefs
                ? new Date(data.txrefs[0].confirmed).toLocaleString()
                : "Bilgi yok",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
            >
              <dt className="text-lg md:text-base font-medium text-gray-600">
                {item.label}
              </dt>
              <dd className="mt-1 text-md text-gray-900 sm:mt-0 sm:col-span-2">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-gray-200 mt-12">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-lg">
          <h3 className="text-xl leading-6 font-medium text-white">
            Transactions
          </h3>
        </div>
        <div className="">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.slice(0, 20).map((tx, index) => {
              const isIncome = tx.type === "Received";
              const amountClass = isIncome ? "text-green-500" : "text-red-500";
              const amountSign = isIncome ? "+" : "-";
              const amount = `${amountSign}${(tx.value / 1e8).toFixed(8)} BTC`;

              return (
                <div key={tx.tx_hash} className="border-b border-gray-200">
                  <button
                    className="w-full px-4 py-3 sm:px-6 text-left focus:outline-none"
                    onClick={() => toggleAccordion(index)}
                  >
                    <div className="flex justify-between items-center">
                      <p className={`text-lg font-medium ${amountClass}`}>
                        {amount}
                      </p>
                      <svg
                        className={`w-5 h-5 text-gray-500 transform ${
                          openIndex === index ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>
                  {openIndex === index && (
                    <div className="px-4 py-3 sm:px-6 bg-gray-50">
                      <p className="text-lg md:text-base text-gray-500">
                        <span className="text-lg md:text-base font-medium  text-gray-700">
                          Date:
                        </span>{" "}
                        {new Date(tx.confirmed).toLocaleString()}
                      </p>
                      <p className="text-lg break-words text-gray-500">
                        <span className="text-lg md:text-base font-medium  text-gray-700">
                          Hash:
                        </span>{" "}
                        {tx.tx_hash}
                      </p>
                      <div className="flex gap-2">
                        <p className="text-lg  md:text-base font-medium  text-gray-700">
                          Amount:
                        </p>
                        <p className="text-lg md:text-base break-words text-gray-500">
                          {`$${((tx.value / 1e8) * usdRate).toFixed(2)}`}
                        </p>
                      </div>

                      <p className="text-lg md:text-base break-words text-gray-500">
                        <span className="text-lg md:text-base font-medium  text-gray-700">
                          Type:
                        </span>{" "}
                        {tx.type}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xl text-gray-500 px-4 py-5 sm:px-6">
              No transactions have been made in this wallet before.!
            </p>
          )}
        </div>
        <div className="mt-2">
          {sortedTransactions.length > 0 && (
            <div
              class="flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 "
              role="alert"
            >
              <svg
                class="flex-shrink-0 inline w-4 h-4 me-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <div>
                <span class="font-medium">Warning!</span> Only the last 20
                transactions are shown.
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  const [address, setAddress] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usdRate, setUsdRate] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.blockcypher.com/v1/btc/main/addrs/${address}?token={"GET_YOUR_TOKEN"}`
      );
      setData(response.data);
      setError("");
    } catch (err) {
      setError("Invalid Bitcoin address or API error!");
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coindesk.com/v1/bpi/currentprice.json"
        );
        const data = await response.json();
        const usdRate = data.bpi.USD.rate_float;
        setUsdRate(usdRate);
      } catch (error) {
        console.error("Error fetching the Bitcoin price:", error);
      }
    };

    fetchBitcoinPrice();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full space-y-8 bg-white p-2 md:p-10 rounded-xl shadow-2xl"
      >
        <div className="flex items-center justify-center ">
          <FaBitcoin className="text-6xl text-yellow-500" />
          <h1 className="ml-4 text-4xl font-extrabold text-gray-900">
            Bitcoin Wallet Tracker
          </h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="flex items-center bg-gray-100 rounded-full p-2">
              <FaSearch className="text-gray-400 ml-2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter a Bitcoin address"
                className="ml-2 flex-1 appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? "Searching..." : "Search"}
          </motion.button>
        </form>
        {error && (
          <p className="mt-2 text-center text-xl font-medium text-red-600">
            {error}
          </p>
        )}
        {data && usdRate && <Result data={data} usdRate={usdRate} />}
      </motion.div>
      <div className="name-footer">
        <a
          href="https://github.com/onaranyusuf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Developed with ❤️ by YO
        </a>
      </div>
    </div>
  );
}

export default App;
