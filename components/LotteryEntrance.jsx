import { useWeb3Contract } from "react-moralis"
import { contractAddress, abi } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import {ethers} from "ethers"
import { useNotification } from "web3uikit"

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddress ? contractAddress[chainId][0] : null

    const [entranceFee, setEntrancFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()
    
    const {runContractFunction: enterRaffle, isLoading, isFetching} = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress[chainId], // Specify the networkId
        functionName: 'enterRaffle',
        params: {},
        msgValue: entranceFee,
    })

      const {runContractFunction: getEntranceFee} = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress[chainId], // Specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const {runContractFunction: getNumOfPlayers} = useWeb3Contract({
      abi: abi,
      contractAddress: contractAddress[chainId], // Specify the networkId
      functionName: "getNumOfPlayers",
      params: {},
  })

  const {runContractFunction: getRecentWinner} = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress[chainId], // Specify the networkId
    functionName: "getRecentWinner",
    params: {},
})

async function updateUI() {
  const entranceFeeFromCall = (await getEntranceFee()).toString()
  const numPlayersFromCall = (await getNumOfPlayers()).toString()
  const recentWinnerFromCall = (await getRecentWinner()).toString()
  setEntrancFee(entranceFeeFromCall)
  setNumPlayers(numPlayersFromCall)
  setRecentWinner(recentWinnerFromCall)
  console.log(raffleAddress)
}

    useEffect(() => {
        if (isWeb3Enabled) {
        updateUI()
    }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx){
      await tx.wait(1)
      handleNewSuccess()
      updateUI()
    }

    const handleNewSuccess = function (){
      dispatch({
        type: 'info',
        message: 'Transaction Complete!',
        title: 'Transaction Notification',
        position: 'topR',
        icon: '',
      })
    }

  return (
    <div className="p-5">
      <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
      {raffleAddress ? (
      <div>
      <button 
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
      onClick={async function(){await enterRaffle({
        onSuccess: handleSuccess,
        onError: (error) => console.log(error)
      })
    }}
    disabled={isLoading || isFetching}
>
    {isLoading || isFetching ? (
        <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
    ) : (
        "Enter Raffle"
    )}</button>
       <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
       <div>Number OF Players: {numPlayers}</div>
       <div> Recent Winner: {recentWinner}</div>
       </div>) : (<div>No Raffle Address Detected</div>)}
      </div>
  )
}

export default LotteryEntrance