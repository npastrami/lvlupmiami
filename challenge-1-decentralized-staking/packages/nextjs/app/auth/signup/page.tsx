"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ethers } from "ethers";


declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function SignUpPage(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [retypePassword, setRetypePassword] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isWalletVerified, setIsWalletVerified] = useState<boolean>(false);
  const router = useRouter();

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
		setIsWalletVerified(false);
      } catch (error) {
        console.error("User rejected the request.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const verifyWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const message = "Please sign this message to verify your wallet.";
        const signature = await signer.signMessage(message);
        const address = await signer.getAddress();

        const response = await fetch("/api/auth/verify-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, signature, message }),
        });

        if (response.ok) {
          setWalletAddress(address);
		  setIsWalletVerified(true);
        } else {
          console.error("Wallet verification failed");
        }
      } catch (error) {
        console.error("User rejected the signature request.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    const isPasswordMatching = password === retypePassword;
    const isEmailValid = email.includes("@");
    const isPasswordFilled = password.length >= 6;
    setIsValid(
      !!walletAddress && isPasswordMatching && isEmailValid && isPasswordFilled
    );
  }, [email, password, retypePassword, walletAddress]);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!walletAddress) {
		alert("Please connect your wallet.");
		return;
    }

	if (!isWalletVerified) {
		alert("Please verify your wallet before signing up.");
		return;
	}

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, walletAddress }),
    });

    if (response.ok) {
      router.push("/auth/signin");
    } else {
      console.error("Error signing up");
    }
  };

  return (
    <div
      className={`flex justify-center items-center min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-primary-100"
      }`}
    >
      <form
        onSubmit={handleSignUp}
        className={`space-y-6 p-6 rounded-lg shadow-md w-full max-w-md ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <h2
          className={`text-2xl font-bold text-center ${
            isDarkMode ? "text-white" : "text-primary-700"
          }`}
        >
          Sign Up
        </h2>

        <div>
          <label
            className={`block text-sm font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            className={`w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-gray-300 focus:ring-gray-500"
                : "border-primary-300 focus:ring-primary-500"
            }`}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className={`w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-gray-300 focus:ring-gray-500"
                : "border-primary-300 focus:ring-primary-500"
            }`}
            placeholder="Enter your password"
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Re-type Password:
          </label>
          <input
            type="password"
            value={retypePassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRetypePassword(e.target.value)
            }
            className={`w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-gray-300 focus:ring-gray-500"
                : "border-primary-300 focus:ring-primary-500"
            }`}
            placeholder="Re-enter your password"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={connectWallet}
            className={`w-full px-4 py-2 font-semibold rounded-lg focus:outline-none focus:ring-4 ${
              isDarkMode
                ? "bg-gray-700 text-white hover:bg-gray-500 focus:ring-gray-300 shadow-md"
                : "bg-primary-600 hover:bg-primary-700 focus:ring-primary-400 shadow-md"
            } transition duration-200 ease-in-out transform hover:scale-105`}
          >
            {walletAddress ? "Wallet Connected" : "Connect Wallet"}
          </button>
          {walletAddress && (
            <p
              className={`mt-2 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Connected Wallet: {walletAddress}
            </p>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={verifyWallet}
            disabled={!walletAddress} // Disable until wallet is connected
            className={`w-full px-4 py-2 font-semibold rounded-lg focus:outline-none focus:ring-4 ${
              isDarkMode
                ? `bg-gray-700 text-white hover:bg-gray-500 focus:ring-gray-300 shadow-md ${
                    !walletAddress ? "opacity-50 cursor-not-allowed" : ""
                  }`
                : `bg-primary-600 hover:bg-primary-700 focus:ring-primary-400 shadow-md ${
                    !walletAddress ? "opacity-50 cursor-not-allowed" : ""
                  }`
            } transition duration-200 ease-in-out transform ${
              walletAddress ? "hover:scale-105" : ""
            }`}
          >
            {isWalletVerified ? "Wallet Verified" : "Verify Wallet"}
          </button>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className={`w-full px-4 py-2 font-semibold rounded-lg focus:outline-none focus:ring-4 ${
            isDarkMode
              ? `bg-gray-700 text-white hover:bg-gray-500 focus:ring-gray-300 shadow-md ${
                  !isValid ? "opacity-50 cursor-not-allowed" : ""
                }`
              : `bg-primary-600 hover:bg-primary-700 focus:ring-primary-400 shadow-md ${
                  !isValid ? "opacity-50 cursor-not-allowed" : ""
                }`
          } transition duration-200 ease-in-out transform ${
            isValid ? "hover:scale-105" : ""
          }`}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
